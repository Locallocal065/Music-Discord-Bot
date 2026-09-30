const https = require('https');
const http = require('http');
const { isUrl } = require('./utils.js');

function isSpotifyUrl(s) {
  return typeof s === "string" && (s.includes("open.spotify.com/") || s.startsWith("spotify:"));
}

function normalizeSpotifyUrl(input) {
  if (!input || typeof input !== "string") return null;
  const m = input.match(/^spotify:(track|album|playlist|episode):([A-Za-z0-9]+)$/);
  if (m) return `https://open.spotify.com/${m[1]}/${m[2]}`;
  return input.replace(/^<|>$/g, "");
}

function spotifyKind(url) {
  const u = normalizeSpotifyUrl(url);
  if (!u) return null;
  const m = u.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/i);
  return m ? m[1].toLowerCase() : null;
}

async function fetchJsonWithTimeout(url, ms = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { "Accept": "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

async function spotifyTitle(input) {
  const url = normalizeSpotifyUrl(input);
  const kind = spotifyKind(url);
  if (!kind) return null;
  const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`;
  const data = await fetchJsonWithTimeout(oembedUrl, 8000);
  return data?.title ? String(data.title) : null;
}

async function spotifyTrackToSearchQuery(input) {
  const url = normalizeSpotifyUrl(input);
  const kind = spotifyKind(url);
  if (kind !== "track" && kind !== "episode") return null;
  const t = await spotifyTitle(url);
  if (!t) return null;
  return `${t} audio`;
}

async function spotifyMeta(input) {
  try {
    const url = normalizeSpotifyUrl(input);
    if (!url) return { title: input, thumb: null };
    const data = await fetchJsonWithTimeout(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`, 8000);
    if (data?.title) return { title: String(data.title), thumb: data.thumbnail_url || null };
  } catch { }
  return { title: input, thumb: null };
}

async function tiktokMeta(pageUrl, retries = 1) {
  try {
    return await tiktokMetaOnce(pageUrl);
  } catch (e) {
    // TikWM free tier: 1 request/second — wait and retry once.
    if (retries > 0 && /1 request\/second|429|rate/i.test(String(e?.message || e))) {
      await new Promise((r) => setTimeout(r, 1300));
      return await tiktokMetaOnce(pageUrl);
    }
    throw e;
  }
}

async function tiktokMetaOnce(pageUrl) {
  const data = await fetchJsonWithTimeout(API_URL + '?url=' + encodeURIComponent(pageUrl), 12000);
  const d = data && data.data;
  if (!d) throw new Error('tikwm: ' + ((data && data.msg) || 'bad response'));
  const music = typeof d.music === "string" ? d.music
    : (d.music && (d.music.play || d.music.url)) || (d.music_info && (d.music_info.play || d.music_info.url));
  if (!music) throw new Error('tikwm: no audio stream in response');
  const title = d.title || (d.music_info && d.music_info.title) || pageUrl;
  const thumb = d.cover || d.origin_cover || d.ai_dynamic_cover || null;
  const author = (d.author && (d.author.nickname || d.author.unique_id)) || null;
  return { title: String(title), thumb, audioUrl: String(music), duration: d.duration || null, author };
}

function tiktokHeaders() {
  return "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36\r\n"
    + "Referer: https://www.tiktok.com/\r\n";
}

function isTikTokUrl(s) {
  return typeof s === "string" && (s.includes("tiktok.com") || s.includes("vt.tiktok.com"));
}

async function getTitle(input) {
  const r = await resolveTitleAndThumb(input);
  return r.title;
}

function thumbFor(source) {
  const id = extractYouTubeIdSafe(source);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

function extractYouTubeIdSafe(s) { try { return extractYouTubeId(s); } catch { return null; } }

function pickThumb(e, fallbackUrl) {
  try {
    if (e?.thumbnail) return e.thumbnail;
    const list = e?.thumbnails;
    if (Array.isArray(list) && list.length) {
      const last = list[list.length - 1];
      if (last?.url) return last.url;
    }
  } catch { }
  return fallbackUrl ? thumbFor(fallbackUrl) : null;
}

async function resolveTitleAndThumb(input) {
  try {
    // TikTok: metadata only via TikWM (fast, no yt-dlp).
    if (isTikTokUrl(input)) {
      try {
        const m = await tiktokMeta(input);
        return { title: m.title, thumb: m.thumb, durationSec: numOrNull(m.duration) };
      } catch (e) { logPretty("WARN", "tikwm meta failed: " + (e?.message || e)); }
    }
    if (isSpotifyUrl(input)) {
      const meta = await spotifyMeta(input);
      if (meta.title && meta.title !== input) return { ...meta, durationSec: null };
    }
    const info = await ytdlp(input, ytdlpOpts({ dumpSingleJson: true, skipDownload: true, noWarnings: true }));
    const e = info?.entries?.[0] || info;
    if (e?.title) {
      const url = e.webpage_url || input;
      return { title: e.title, thumb: pickThumb(e, url) || thumbFor(input), durationSec: numOrNull(e.duration) };
    }
  } catch { }
  return { title: input, thumb: thumbFor(input), durationSec: null };
}

async function resolveFirstVideoUrl(query) {
  if (isSpotifyUrl(query)) {
    const kind = spotifyKind(query);
    if (kind === "album" || kind === "playlist") return null;
    const q2 = await spotifyTrackToSearchQuery(query);
    if (q2) query = q2;
  }
  if (isUrl(query)) return query;
  try {
    const out = await ytdlp(`ytsearch1:${query}`, ytdlpOpts({ dumpSingleJson: true }));
    return out?.entries?.[0]?.webpage_url || null;
  } catch (e) {
    logPretty("ERROR", "search resolve fail: " + (e?.message || e));
    return null;
  }
}

function extractYouTubeId(u) {
  try {
    const s = String(u || "");
    let m = s.match(/(?:youtube\.com\/(?:watch\?[^#]*v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
    if (m) return m[1];
    m = s.match(/^([A-Za-z0-9_-]{11})$/);
    if (m) return m[1];
  } catch { }
  return null;
}

async function resolveVideoInfo(query) {
  // ONE yt-dlp call (was: search call + info call). Title + URL together.
  let input = query;
  if (isSpotifyUrl(query)) {
    const kind = spotifyKind(query);
    if (kind === "album" || kind === "playlist") return null;
    const q2 = await spotifyTrackToSearchQuery(query);
    if (!q2) return null;
    input = q2;
  }
  if (!isUrl(input)) input = `ytsearch1:${input}`;
  try {
    const info = await ytdlp(input, ytdlpOpts({ dumpSingleJson: true, skipDownload: true, noWarnings: true }));
    const e = info?.entries?.[0] || info;
    if (!e) return null;
    const url = e.webpage_url || input;
    const title = e.title || query;
    return { title, url, thumb: pickThumb(e, url), durationSec: numOrNull(e.duration), videoId: extractYouTubeId(e.webpage_url || url) || extractYouTubeId(query) };
  } catch (e) {
    logPretty("ERROR", "video resolve fail: " + (e?.message || e));
    return null;
  }
}

module.exports = {
  isSpotifyUrl,
  normalizeSpotifyUrl,
  spotifyKind,
  fetchJsonWithTimeout,
  spotifyTitle,
  spotifyTrackToSearchQuery,
  spotifyMeta,
  tiktokMeta,
  tiktokMetaOnce,
  tiktokHeaders,
  isTikTokUrl,
  getTitle,
  thumbFor,
  extractYouTubeIdSafe,
  pickThumb,
  resolveTitleAndThumb,
  resolveFirstVideoUrl,
  extractYouTubeId,
  resolveVideoInfo
};
