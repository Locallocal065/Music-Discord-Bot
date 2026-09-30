const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { logPretty, nowStrShort } = require('./utils.js');

function logConfiguration() {
  const entries = [
    { key: "port", env: "PORT" },
    { key: "token", env: "TOKEN", mask: true },
    { key: "geminiApiKey", env: "GEMINI_API_KEY", mask: true },
    { key: "openRouterApiKey", env: "OPENROUTER_API_KEY", mask: true },
    { key: "openRouterModel", env: "OPENROUTER_MODEL" },
    { key: "ffmpegPath", env: "FFMPEG_PATH" },
    { key: "cookieFile", env: "YTDLP_COOKIES_PATH" },
    { key: "logDir", env: "LOG_DIR" },
    { key: "dataDir", env: "DATA_DIR" },
    { key: "debugFfmpeg", env: "DEBUG_FFMPEG" },
    { key: "defaultVolume", env: "DEFAULT_VOLUME" },
    { key: "defaultLoop", env: "DEFAULT_LOOP_MODE" },
    { key: "timezoneOffsetHours", env: "TIMEZONE_OFFSET_HOURS" },
    { key: "ytdlpForceIpv4", env: "YTDLP_FORCE_IPV4" },
    { key: "ytdlpAutoUpdate", env: "YTDLP_AUTO_UPDATE" },
    { key: "audioChannels", env: "AUDIO_CHANNELS" },
    { key: "audioSampleRate", env: "AUDIO_SAMPLE_RATE" },
    { key: "opusBitrate", env: "OPUS_BITRATE" },
    { key: "opusVbr", env: "OPUS_VBR" },
    { key: "opusApplication", env: "OPUS_APPLICATION" },
    { key: "opusFrameDuration", env: "OPUS_FRAME_DURATION" },
    { key: "opusComplexity", env: "OPUS_COMPLEXITY" },
    { key: "audioFilter", env: "AUDIO_FILTER" },
    { key: "ffmpegLowLatency", env: "FFMPEG_LOW_LATENCY" },
    { key: "ffmpegInputAnalyzeMs", env: "FFMPEG_INPUT_ANALYZE_MS" },
    { key: "ffmpegReconnectDelayMax", env: "FFMPEG_RECONNECT_DELAY_MAX" },
    { key: "ffmpegExtraArgs", env: "FFMPEG_EXTRA_ARGS" },
    { key: "dashboardUser", env: "DASHBOARD_USER" },
    { key: "dashboardPassword", env: "DASHBOARD_PASSWORD", mask: true },
    { key: "disconnectDelaySec", env: "DISCONNECT_DELAY_SEC" },
    { key: "ytdlpPlayerClient", env: "YTDLP_PLAYER_CLIENT" },
    { key: "prebufferKB", env: "PREBUFFER_KB" },
    { key: "prebufferWaitMs", env: "PREBUFFER_WAIT_MS" },
  ];
  // We want to simulate loading the .env file by printing a message
  // and waiting a short time before outputting the configuration.  Using
  // an Atomics.wait call lets us block synchronously without complicating
  // the asynchronous flow elsewhere in the program.  This approach
  // guarantees that the loading message appears before the variables
  // themselves, and avoids interleaving logs due to unresolved promises.
  console.log("--------------------------------");
  // Thai text explains the wait – it will show up in the console to
  // indicate a brief pause while reading the .env file.
  console.log(
    "[BOT] loading .env"
  );
  console.log("--------------------------------");
  // Block for 1000ms to simulate reading the .env file
  try {
    const sab = new SharedArrayBuffer(4);
    const ia = new Int32Array(sab);
    // Atomics.wait returns 'timed-out' when the timeout expires
    Atomics.wait(ia, 0, 0, 1000);
  } catch {
    // Fall back to a non-blocking setTimeout if Atomics.wait is unavailable
    const end = Date.now() + 1000;
    while (Date.now() < end) {
      // busy loop
    }
  }
  for (const entry of entries) {
    const used = config[entry.key];
    let displayValue;
    if (entry.mask) {
      displayValue = used ? "[set]" : "[not set]";
    } else {
      displayValue = used;
    }
    // Print in the form "<ENV_NAME>:<value>" with a single leading space
    console.log(` ${entry.env}:${displayValue}`);
    console.log("--------------------------------");
  }
}

function readLastUpdateTs() { try { return Number(fs.readFileSync(UPDATE_MARK_FILE, "utf8")); } catch { return 0; } }

function writeLastUpdateTs(ts = Date.now()) { try { fs.writeFileSync(UPDATE_MARK_FILE, String(ts), "utf8"); } catch { } }

async function runYtDlpUpdate(replyFn) {
  if (isUpdatingYtDlp) { replyFn?.("⏳ Update already in progress"); return; }
  isUpdatingYtDlp = true;
  const started = Date.now();
  try {
    try { await ytdlp("--version"); } catch { }
    const out = await ytdlp("-U").catch(err => ({ error: err }));
    if (out?.error) {
      logPretty("ERROR", `yt-dlp update failed: ${out.error.message || out.error}`);
      replyFn?.("❌ Update failed");
    } else {
      const stdout = typeof out === "string" ? out : (out?.stdout || "");
      logPretty("SYSTEM", `yt-dlp updated  ${stdout.toString().trim().split("\n").pop()}`);
      writeLastUpdateTs(started);
      replyFn?.("✅ Update finished");
    }
  } finally { isUpdatingYtDlp = false; }
}

function msUntilNextBangkokMidnight() {
  const now = new Date();
  const bkkNow = new Date(now.getTime() + BKK_OFFSET_MS);
  const nextMidnightBkkUTCms = Date.UTC(bkkNow.getUTCFullYear(), bkkNow.getUTCMonth(), bkkNow.getUTCDate() + 1, 0, 0, 0) - BKK_OFFSET_MS;
  return Math.max(1, nextMidnightBkkUTCms - now.getTime());
}

function scheduleDailyBangkokMidnight(fn) {
  const delay = msUntilNextBangkokMidnight();
  setTimeout(async () => {
    try {
      await fn();
    } finally {
      scheduleDailyBangkokMidnight(fn);
    }
  }, delay);
}

function ytCookiesPath() {
  return config.cookieFile || path.join(config.dataDir, "cookies.txt");
}

function ytCookiesStatus() {
  const p = ytCookiesPath();
  try {
    const st = fs.statSync(p);
    return { path: p, exists: true, size: st.size, mtime: st.mtime.toISOString() };
  } catch { return { path: p, exists: false, size: 0, mtime: null }; }
}

function saveYTCookies(text) {
  const t = String(text || "").trim();
  if (!t || t.length < 100) throw new Error("cookies too short — paste full cookies.txt");
  if (!t.includes("youtube.com") && !t.includes("youtu.be")) throw new Error("no youtube.com entries found");
  // Must look like a Netscape cookies file, or yt-dlp rejects EVERYTHING.
  const lines = t.split("\n").filter((l) => l && !l.trim().startsWith("#"));
  if (!lines.length || !lines.some((l) => l.includes("\t"))) {
    throw new Error("not a Netscape cookies.txt (need tab-separated lines — export with 'Get cookies.txt LOCALLY', don't paste JSON)");
  }
  const target = ytCookiesPath();
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, t.replace(/\r\n/g, "\n"), "utf8");
  config.cookieFile = target; // live, no restart
  logPretty("SYSTEM", `YouTube cookies updated via Discord (${t.length} chars -> ${target})`);
  return target;
}

function isGuildAdmin(member) {
  try {
    if (!member) return false;
    if (member.id === member.guild?.ownerId) return true;
    return member.permissions?.has?.(PermissionFlagsBits.ManageGuild);
  } catch { return false; }
}

function wsPing() {
  try { return Math.round(_clientForPing?.ws?.ping || 0); } catch { return 0; }
}

module.exports = {
  logConfiguration,
  readLastUpdateTs,
  writeLastUpdateTs,
  runYtDlpUpdate,
  msUntilNextBangkokMidnight,
  scheduleDailyBangkokMidnight,
  ytCookiesPath,
  ytCookiesStatus,
  saveYTCookies,
  isGuildAdmin,
  wsPing
};
