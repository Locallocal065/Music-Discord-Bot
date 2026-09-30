const { spawn } = require('child_process');
const ytdl = require('yt-dlp-exec');
const { logPretty, writeLog } = require('./utils.js');
const { tiktokHeaders, resolveFirstVideoUrl } = require('./metadata.js');

function swallowPipeError(err) {
  const msg = String(err?.message || err || "");
  if (msg.includes("EPIPE") || msg.includes("ERR_STREAM_DESTROYED") || msg.includes("Premature close")) return;
  logPretty("ERROR", "pipe error: " + msg);
}

function checkFfmpegAvailability() {
  if (FFMPEG_AVAILABLE) return;
  try {
    const res = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
    if (!res.error && res.status === 0) {
      FFMPEG_AVAILABLE = true;
      return;
    }
  } catch { }
  logPretty("ERROR", "ffmpeg binary not found. Please install ffmpeg or add it to PATH.");
}

async function getDirectAudioUrlAndHeaders(input) {
  // Single yt-dlp call: resolve the page URL (or search query) AND extract
  // the CDN audio URL in one shot. Previously we called resolveFirstVideoUrl
  // first (one yt-dlp invocation) and then called this function (a second
  // invocation). The CDN URL YouTube returns expires quickly, so by the time
  // ffmpeg started fetching it the URL was already dead → instant FINISHED.
  // Now we do everything in one call so ffmpeg starts immediately.
  const info = await ytdlp(input, ytdlpOpts({ dumpSingleJson: true, f: "bestaudio/best" }));
  const url = info?.url;
  const headers = info?.http_headers || {};
  if (!url) throw new Error("yt-dlp did not return media url");
  return { url, headers };
}

function buildFfmpegHeadersString(h) {
  const merged = {
    "User-Agent": h["User-Agent"] || h["user-agent"] || "Mozilla/5.0",
    "Accept": h["Accept"] || "*/*",
    "Accept-Language": h["Accept-Language"] || "en-US,en;q=0.9",
    "Origin": h["Origin"] || "https://www.youtube.com",
    "Referer": h["Referer"] || "https://www.youtube.com/",
    ...(h.Cookie ? { "Cookie": h.Cookie } : (h.cookie ? { "Cookie": h.cookie } : {})),
  };
  return Object.entries(merged).map(([k, v]) => `${k}: ${v}`).join("\r\n");
}

function spawnFfmpegFromDirectUrl(url, headersStr) {
  if (!FFMPEG_AVAILABLE) throw new Error("ffmpeg binary not available");

  // Build argument list dynamically based off the audio/network config
  const a = [];

  // Base logging and banner settings
  a.push("-loglevel", "info", "-hide_banner");

  // Reconnect logic with configurable max delay
  a.push(
    "-reconnect", "1",
    "-reconnect_streamed", "1",
    "-reconnect_on_network_error", "1",
    "-reconnect_delay_max", String(config.ffmpegReconnectDelayMax)
  );

  // Tune buffering and probing depending on latency preference
  if (config.ffmpegLowLatency) {
    a.push(
      "-fflags", "+nobuffer",
      "-flags", "low_delay",
      "-analyzeduration", String(config.ffmpegInputAnalyzeMs * 1000), // microseconds
      "-probesize", "32k",
      "-rw_timeout", "15000000",
      "-timeout", "15000000"
    );
  } else {
    const us = Math.max(0, config.ffmpegInputAnalyzeMs) * 1000;
    a.push("-analyzeduration", String(us), "-probesize", "256k");
  }

  // Pass through HTTP headers and input URL
  a.push("-headers", headersStr + "\r\n", "-i", url);

  // Drop any video streams
  a.push("-vn");

  // Apply channel count and sample rate
  a.push("-ac", String(config.audioChannels));
  a.push("-ar", String(config.audioSampleRate));

  // Optional audio filter chain
  const afChain = (config.audioFilter || "").trim();
  if (afChain) {
    a.push("-af", afChain);
  }

  // Encode to Opus with bitrate and VBR settings
  a.push("-c:a", "libopus");
  a.push("-b:a", config.opusBitrate);

  // Configure variable bitrate mode
  if (config.opusVbr === "off") {
    a.push("-vbr", "off");
  } else if (config.opusVbr === "constrained") {
    a.push("-vbr", "constrained");
  } else {
    a.push("-vbr", "on");
  }

  // Set Opus application profile if valid
  if (["audio", "voip", "lowdelay"].includes(config.opusApplication)) {
    a.push("-application", config.opusApplication);
  }

  // Frame duration (accepted values: 2.5,5,10,20,40,60 ms)
  const fd = Number(config.opusFrameDuration);
  if ([2.5, 5, 10, 20, 40, 60].includes(fd)) {
    a.push("-frame_duration", String(fd));
  }

  // Complexity (0–10)
  const cx = Number(config.opusComplexity);
  if (Number.isFinite(cx) && cx >= 0 && cx <= 10) {
    a.push("-compression_level", String(cx));
  }

  // Append any custom extra arguments
  if (config.ffmpegExtraArgs && config.ffmpegExtraArgs.trim()) {
    // Split on whitespace to allow multiple flags
    a.push(...config.ffmpegExtraArgs.trim().split(/\s+/));
  }

  // Output container and pipe to stdout
  a.push("-f", "ogg", "pipe:1");

  const ff = spawn(FFMPEG || "ffmpeg", a, { stdio: ["ignore", "pipe", "pipe"] });
  ff.on("error", (e) => logPretty("ERROR", "ffmpeg spawn error: " + (e?.message || e)));
  ff.stdout.on("error", swallowPipeError);
  ff.stderr.on("error", swallowPipeError);
  ff.stderr.on("data", d => {
    try {
      logPretty("LOG", "[ffmpeg] " + d.toString().trim());
    } catch { }
  });
  return ff;
}

function spawnUniversalPipe(source, playerClient, speed, offsetSec) {
  if (!FFMPEG_AVAILABLE) throw new Error("ffmpeg binary not available");

  // ── yt-dlp ───────────────────────────────────────────────────────────────
  const isTikTok = source.includes("tiktok.com") || source.includes("vt.tiktok.com");
  const ytArgs = [];
  if (config.ytdlpForceIpv4) ytArgs.push("--force-ipv4");
  const ckFile = effectiveCookieFile();
  if (ckFile) ytArgs.push("--cookies", ckFile);
  ytArgs.push(
    "--no-check-certificates",
    "--retries", "infinite",
    "--fragment-retries", "infinite",
    "--buffer-size", "64K",
    "--js-runtimes", "node",
  );
  if (isTikTok) {
    // TikTok: needs impersonation to avoid 403
    // and must pick audio-only formats (some clips are video-only)
    ytArgs.push(
      "--impersonate", "chrome",
      "-f", "bestaudio[acodec!=none]/ba[acodec!=none]/b[acodec!=none]",
    );
  } else {
    // YouTube and others — prefer direct m4a (single progressive file = fastest
    // start, no hundreds of DASH fragments on 30min+ videos), concurrent
    // fragments keep long videos from stalling mid-play.
    ytArgs.push(
      "--extractor-args", `youtube:player-client=${playerClient || config.ytdlpPlayerClient};player_skip=webpage`,
      "-f", "bestaudio[ext=m4a]/bestaudio[acodec=aac]/bestaudio/best",
      "--concurrent-fragments", "4",
    );
  }
  ytArgs.push("-o", "-", source);
  const helper = spawn(YTDLP_BIN, ytArgs, { stdio: ["ignore", "pipe", "pipe"] });
  helper.on("error", (e) => logPretty("ERROR", "yt-dlp(universal) error: " + (e?.message || e)));
  helper.stdout.on("error", swallowPipeError);
  helper.stderr.on("error", swallowPipeError);
  helper.stderr.on("data", (d) => { try { logPretty("LOG", "[yt-dlp] " + d.toString().trim()); } catch { } });

  // ── ffmpeg ────────────────────────────────────────────────────────────────
  const a = ffmpegStdinArgs(speed, offsetSec);

  const ff = spawn(FFMPEG || "ffmpeg", a, { stdio: ["pipe", "pipe", "pipe"] });
  ff.on("error", (e) => logPretty("ERROR", "ffmpeg(universal) error: " + (e?.message || e)));
  ff.stdout.on("error", swallowPipeError);
  ff.stderr.on("error", swallowPipeError);
  // *** EPIPE guard: when stop/skip kills ffmpeg, yt-dlp writes into closed stdin
  // without this handler Node throws unhandled EPIPE and dies ***
  ff.stdin.on("error", swallowPipeError);
  ff.stderr.on("data", (d) => { try { logPretty("LOG", "[ffmpeg] " + d.toString().trim()); } catch { } });

  helper.stdout.pipe(ff.stdin);
  return { ff, stream: cushionStream(ff), helper, raw: ff.stdout };
}

function clampSpeed(speed) {
  const s = Number(speed);
  if (!Number.isFinite(s)) return 1;
  return Math.min(2, Math.max(0.5, s));
}

function combineAudioFilters(base, speed) {
  const parts = [];
  const b = (base || "").trim();
  if (b) parts.push(b);
  const s = clampSpeed(speed);
  if (s !== 1) parts.push(`atempo=${s}`);
  return parts.join(",");
}

function spawnFfmpegStdin(tag, speed, offsetSec) {
  if (!FFMPEG_AVAILABLE) throw new Error("ffmpeg binary not available");
  const ff = spawn(FFMPEG || "ffmpeg", ffmpegStdinArgs(speed, offsetSec), { stdio: ["pipe", "pipe", "pipe"] });
  ff.on("error", (e) => logPretty("ERROR", `ffmpeg(${tag}) error: ` + (e?.message || e)));
  ff.stdout.on("error", swallowPipeError);
  ff.stderr.on("error", swallowPipeError);
  ff.stdin.on("error", swallowPipeError);
  ff.stderr.on("data", (d) => { try { logPretty("LOG", `[ffmpeg(${tag})] ` + d.toString().trim()); } catch { } });
  return { ff, stream: cushionStream(ff), helper: null, raw: ff.stdout };
}

function cushionStream(ff) {
  const cushion = new PassThrough({ highWaterMark: 384 * 1024 });
  cushion.on("error", swallowPipeError);
  ff.stdout.pipe(cushion);
  cushion.on("close", () => { try { ff.stdout.unpipe(cushion); } catch { } });
  return cushion;
}

async function awaitPrebuffer(pipeObj, minBytes, maxWaitMs) {
  const s = pipeObj?.stream;
  if (!s || s.destroyed || minBytes <= 0) return;
  if ((s.readableLength || 0) >= minBytes) return;
  await new Promise((resolve) => {
    let done = false;
    const cleanup = () => { clearTimeout(timer); s.off("readable", onReadable); s.off("close", onClose); s.off("error", onClose); };
    const finish = () => { if (!done) { done = true; cleanup(); resolve(); } };
    const onReadable = () => { if ((s.readableLength || 0) >= minBytes) finish(); };
    const onClose = () => finish(); // dead source → let probe fail fast
    const timer = setTimeout(finish, maxWaitMs);
    s.on("readable", onReadable);
    s.on("close", onClose);
    s.on("error", onClose);
  });
}

function spawnTikTokPipe(pageUrl) {
  if (!FFMPEG_AVAILABLE) {
    throw new Error("ffmpeg binary not available");
  }
  // Build yt-dlp CLI arguments. We respect configuration options such as
  // force IPv4 and cookie file. The output is written to stdout ("-") so
  // ffmpeg can read it from a pipe.
  const ytdlpArgs = [];
  // use force-ipv4 if configured
  if (config.ytdlpForceIpv4) {
    ytdlpArgs.push("--force-ipv4");
  }
  // use cookie file if provided
  const legacyCk = effectiveCookieFile();
  if (legacyCk) {
    ytdlpArgs.push("--cookies", legacyCk);
  }
  // Basic resilient settings
  ytdlpArgs.push(
    "--no-check-certificates",
    "--retries", "infinite",
    "--fragment-retries", "infinite",
    "-f", "ba",
    "-o", "-",
    "--js-runtimes", "node",
    pageUrl
  );
  // Spawn yt-dlp process
  const helper = spawn("yt-dlp", ytdlpArgs, {
    stdio: ["ignore", "pipe", "pipe"],
  });
  helper.on("error", (e) => logPretty("ERROR", "yt-dlp spawn error: " + (e?.message || e)));
  helper.stderr.on("error", swallowPipeError);
  helper.stderr.on("data", (d) => {
    try {
      logPretty("LOG", "[yt-dlp] " + d.toString().trim());
    } catch { }
  });
  // Build ffmpeg arguments based on our audio configuration. Unlike
  // spawnFfmpegFromDirectUrl, we do not include reconnect flags because
  // yt-dlp is handling network access. We still honor low‑latency and
  // audio quality settings.
  const a = [];
  a.push("-loglevel", "info", "-hide_banner");
  if (config.ffmpegLowLatency) {
    a.push(
      "-fflags", "+nobuffer",
      "-flags", "low_delay",
      "-analyzeduration", String(config.ffmpegInputAnalyzeMs * 1000),
      "-probesize", "32k"
    );
  } else {
    const us = Math.max(0, config.ffmpegInputAnalyzeMs) * 1000;
    a.push("-analyzeduration", String(us), "-probesize", "256k");
  }
  // Input from stdin (pipe)
  a.push("-i", "pipe:0");
  // Drop any video
  a.push("-vn");
  // Channels and sample rate
  a.push("-ac", String(config.audioChannels));
  a.push("-ar", String(config.audioSampleRate));
  // Optional audio filter
  const afChain = (config.audioFilter || "").trim();
  if (afChain) {
    a.push("-af", afChain);
  }
  // Opus encoding settings
  a.push("-c:a", "libopus");
  a.push("-b:a", config.opusBitrate);
  if (config.opusVbr === "off") {
    a.push("-vbr", "off");
  } else if (config.opusVbr === "constrained") {
    a.push("-vbr", "constrained");
  } else {
    a.push("-vbr", "on");
  }
  if (["audio", "voip", "lowdelay"].includes(config.opusApplication)) {
    a.push("-application", config.opusApplication);
  }
  const fd = Number(config.opusFrameDuration);
  if ([2.5, 5, 10, 20, 40, 60].includes(fd)) {
    a.push("-frame_duration", String(fd));
  }
  const cx = Number(config.opusComplexity);
  if (Number.isFinite(cx) && cx >= 0 && cx <= 10) {
    a.push("-compression_level", String(cx));
  }
  if (config.ffmpegExtraArgs && config.ffmpegExtraArgs.trim()) {
    a.push(...config.ffmpegExtraArgs.trim().split(/\s+/));
  }
  a.push("-f", "ogg", "pipe:1");
  // Spawn ffmpeg process
  const ff = spawn(FFMPEG || "ffmpeg", a, {
    stdio: ["pipe", "pipe", "pipe"],
  });
  ff.on("error", (e) => logPretty("ERROR", "ffmpeg(tiktok) spawn error: " + (e?.message || e)));
  ff.stdout.on("error", swallowPipeError);
  ff.stderr.on("error", swallowPipeError);
  ff.stderr.on("data", (d) => {
    try {
      logPretty("LOG", "[ffmpeg(tiktok)] " + d.toString().trim());
    } catch { }
  });
  // Pipe yt-dlp stdout into ffmpeg stdin
  helper.stdout.pipe(ff.stdin);
  return { ff, stream: ff.stdout, helper };
}

function cleanupCurrentPipeline(state) {
  if (!state.currentPipe) return;
  // Mark teardown time: errors surfacing within ~3s of an intentional
  // teardown (skip/stop/song switch) are dying-pipe noise, not real drops.
  // handlePlayerError ignores them so skips don't cry "signal lost".
  state.lastTeardownAt = Date.now();
  try {
    // Destroy the audio stream if present
    try { state.currentPipe.stream?.destroy?.(); } catch { }
    // Kill the ffmpeg process
    try { state.currentPipe.ff?.kill?.("SIGKILL"); } catch { }
    // If there is a helper process (e.g. yt-dlp for TikTok), kill it too
    try { state.currentPipe.helper?.kill?.("SIGKILL"); } catch { }
  } catch (e) {
    swallowPipeError(e);
  } finally {
    state.currentPipe = null;
  }
}


// yt-dlp helper functions

// Thumbnail helpers — YouTube thumbs need no API key: i.ytimg.com/vi/ID/hqdefault.jpg


// Native artwork from yt-dlp (TikTok cover, SoundCloud art, YouTube thumb…),
// falling back to i.ytimg.com for YouTube URLs.

// ONE yt-dlp call → { title, thumb, durationSec }. Falls back to raw query.


// Spotify oembed gives title + album art in one call.


// ---- Video-page helpers (legit: share watch page + iframe, audio via voice) ----



// Watch Together: the ONLY legit way to show video inside a voice channel.
// Bots cannot push video frames (audio-only API); instead the bot creates an
// Activity invite so everyone in the VC watches YouTube together in sync.
const WATCH_TOGETHER_APP_ID = "880218394199220334";
async function createWatchTogetherInvite(voiceChannel) {
  const invite = await voiceChannel.createInvite({
    maxAge: 6 * 3600,
    targetApplication: WATCH_TOGETHER_APP_ID,
    targetType: InviteTargetType.EmbeddedApplication,
    reason: "Watch Together session",
  });
  return invite;
}




// Universal yt-dlp → ffmpeg pipe for ALL platforms.
// yt-dlp downloads best audio → stdout → ffmpeg stdin → opus ogg → stdout → Discord.
// Crucially, ff.stdin has an 'error' listener so SIGKILL on stop/skip never
// throws an unhandled EPIPE that crashes the Node process.
// Alternate YouTube player client for cookieless fallback.
// web↔android: if one demands sign-in / PO token, try the other.
function altPlayerClient(primary) {
  return /android/i.test(primary || "") ? "web,web_creator" : "android";
}

// Playback speed via ffmpeg atempo (single filter supports 0.5x–2x).


// Shared ffmpeg args: read audio from stdin pipe, output opus/ogg to stdout.
// offsetSec>0 adds output-side -ss (accurate seek; input is an unseekable pipe).
function ffmpegStdinArgs(speed, offsetSec) {
  const a = [];
  a.push("-loglevel", "info", "-hide_banner");
  if (config.ffmpegLowLatency) {
    a.push("-fflags", "+nobuffer", "-flags", "low_delay",
      "-analyzeduration", String(Math.max(500000, config.ffmpegInputAnalyzeMs * 1000)), "-probesize", "64k");
  } else {
    a.push("-analyzeduration", String(Math.max(0, config.ffmpegInputAnalyzeMs) * 1000), "-probesize", "256k");
  }
  // Bigger pipe-input queue so a busy CPU doesn't drop the stream start.
  a.push("-thread_queue_size", "1024", "-i", "pipe:0", "-vn");
  const off = Number(offsetSec);
  if (Number.isFinite(off) && off > 0) a.push("-ss", String(off)); // output seek: decode+drop, exact
  a.push("-ac", String(config.audioChannels), "-ar", String(config.audioSampleRate));
  const afChain = combineAudioFilters(config.audioFilter, speed);
  if (afChain) a.push("-af", afChain);
  a.push("-c:a", "libopus", "-b:a", config.opusBitrate);
  if (config.opusVbr === "off") a.push("-vbr", "off");
  else if (config.opusVbr === "constrained") a.push("-vbr", "constrained");
  else a.push("-vbr", "on");
  if (["audio", "voip", "lowdelay"].includes(config.opusApplication))
    a.push("-application", config.opusApplication);
  const fd = Number(config.opusFrameDuration);
  if ([2.5, 5, 10, 20, 40, 60].includes(fd)) a.push("-frame_duration", String(fd));
  const cx = Number(config.opusComplexity);
  if (Number.isFinite(cx) && cx >= 0 && cx <= 10) a.push("-compression_level", String(cx));
  if (config.ffmpegExtraArgs && config.ffmpegExtraArgs.trim())
    a.push(...config.ffmpegExtraArgs.trim().split(/\s+/));
  a.push("-f", "ogg", "pipe:1");
  return a;
}

module.exports = {
  swallowPipeError,
  checkFfmpegAvailability,
  getDirectAudioUrlAndHeaders,
  buildFfmpegHeadersString,
  spawnFfmpegFromDirectUrl,
  spawnUniversalPipe,
  clampSpeed,
  combineAudioFilters,
  spawnFfmpegStdin,
  cushionStream,
  awaitPrebuffer,
  spawnTikTokPipe,
  cleanupCurrentPipeline
};
