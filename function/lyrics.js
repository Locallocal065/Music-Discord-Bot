const { fetchJsonWithTimeout } = require('./metadata.js');
const { fmtTime, cleanTitle } = require('./utils.js');

function parseSyncedLyrics(synced) {
  const out = [];
  for (const rawLine of String(synced || "").split(/\r?\n/)) {
    const m = rawLine.match(/^\s*\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$/);
    if (!m) continue;
    const t = Number(m[1]) * 60 + Number(m[2]);
    const text = (m[3] || "").trim().slice(0, 160);
    if (!Number.isFinite(t) || t < 0 || !text) continue;
    out.push({ t, text });
    if (out.length >= 400) break;
  }
  out.sort((a, b) => a.t - b.t);
  return out;
}

function lyricIndexAt(synced, elapsedSec) {
  let idx = -1;
  for (let i = 0; i < synced.length; i++) {
    if (synced[i].t <= elapsedSec + 0.25) idx = i;
    else break;
  }
  return idx;
}

async function fetchLyrics(title) {
  const key = String(title || "").slice(0, 80).toLowerCase().trim();
  if (!key || key.length < 3) return null;
  if (lyricCache.has(key)) return lyricCache.get(key);
  const p = (async () => {
    try {
      const q = encodeURIComponent(cleanTitle(title, 80));
      const s = await fetchJsonWithTimeout(`https://lrclib.net/api/search?q=${q}`, 7000);
      const arr = Array.isArray(s) ? s : [];
      const best = arr.find((x) => x && x.syncedLyrics) || arr.find((x) => x && x.plainLyrics) || null;
      if (!best) return null;
      const synced = parseSyncedLyrics(best.syncedLyrics);
      let text = String(best.plainLyrics || "").trim();
      if (!text && best.syncedLyrics) text = String(best.syncedLyrics).replace(/^\[\d+:\d+\.\d+\]\s*/gm, "").trim();
      if (!text) return null;
      if (/^\[?instrumental\]?$/i.test(text)) return { text: "🎵 Instrumental", synced: [], artist: best.artistName || null, name: best.trackName || null };
      if (text.length < 20) return null;
      if (text.length > 900) text = text.slice(0, 900).trim() + "…";
      return { text, synced, artist: best.artistName || null, name: best.trackName || null };
    } catch { return null; }
  })();
  lyricCache.set(key, p);
  if (lyricCache.size > 200) { try { lyricCache.delete(lyricCache.keys().next().value); } catch {} }
  return p;
}

function karaokeField(state, lyrics, estimated = false) {
  const el = playbackSeconds(state);
  const synced = lyrics.synced;
  const idx = lyricIndexAt(synced, el);
  const PAST = 2, FUTURE = 4;
  const rows = [];
  if (idx < 0) {
    rows.push("*♪ Intro — get ready…*");
    for (let i = 0; i < Math.min(FUTURE + 1, synced.length); i++) rows.push(`　${synced[i].text}`);
  } else {
    const start = Math.max(0, idx - PAST);
    for (let i = start; i < idx; i++) rows.push(`╰╴${synced[i].text}`);
    rows.push(`**🎤▶ ${synced[idx].text}**`);
    for (let i = idx + 1; i < synced.length && rows.length < PAST + 1 + FUTURE; i++) rows.push(`　${synced[i].text}`);
    if (idx >= synced.length - 1) rows.push("*♪ Outro…*");
  }
  let value = rows.join("\n");
  if (value.length > 1000) value = value.slice(0, 997).trimEnd() + "…";
  const by = lyrics.artist ? ` · ${lyrics.artist}` : "";
  const est = estimated ? " · ~timing estimated" : "";
  return { name: `🎤 Karaoke — sing along${by}${est}`, value: `​\n${value}\n​`, inline: false };
}

function estimateSyncedLyrics(text, durationSec) {
  const lines = String(text).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2 || lines.length > 200) return [];
  const start = Math.max(5, durationSec * 0.06);
  const end = durationSec * 0.97;
  const step = (end - start) / lines.length;
  return lines.map((line, i) => ({ t: start + i * step, text: line.slice(0, 160) }));
}

module.exports = {
  parseSyncedLyrics,
  lyricIndexAt,
  fetchLyrics,
  karaokeField,
  estimateSyncedLyrics
};
