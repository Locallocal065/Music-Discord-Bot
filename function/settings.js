const fs = require('fs');
const path = require('path');
const { logPretty } = require('./utils.js');

function volumeStorePath() { return path.join(config.dataDir, "guild-settings.json"); }

function loadGuildSettings() {
  try {
    const raw = fs.readFileSync(volumeStorePath(), "utf8");
    const o = JSON.parse(raw);
    return (o && typeof o === "object") ? o : {};
  } catch { return {}; }
}

function effectiveCookieFile() {
  const p = config.cookieFile;
  if (!p) return null;
  try {
    const st = fs.statSync(p);
    if (!st.isFile() || st.size < 50) { _cookieCache = { path: p, mtimeMs: st.size, valid: false }; return null; }
    const key = p + ":" + st.size + ":" + st.mtimeMs;
    if (_cookieCache.path === key) return _cookieCache.valid ? p : null;
    const head = fs.readFileSync(p, "utf8").slice(0, 4096);
    const lines = head.split("\n").filter((l) => l && !l.trim().startsWith("#"));
    const valid = lines.length > 0 && lines.some((l) => l.includes("\t") && /youtube\.com|youtu\.be|google\.com/i.test(l));
    _cookieCache = { path: key, valid };
    if (!valid) logPretty("WARN", `Ignoring invalid cookies file ${p} (not Netscape format) — running without cookies`);
    return valid ? p : null;
  } catch { return null; }
}

function saveGuildSettings(all) {
  try {
    fs.mkdirSync(config.dataDir, { recursive: true });
    fs.writeFileSync(volumeStorePath(), JSON.stringify(all), "utf8");
  } catch (e) { logPretty("ERROR", "save settings: " + (e?.message || e)); }
}

function getSavedVolume(guildId) {
  const v = loadGuildSettings()[String(guildId)]?.volumePct;
  return Number.isFinite(v) ? Math.max(0, Math.min(10000, v)) : null;
}

function setSavedVolume(guildId, pct) {
  const all = loadGuildSettings();
  all[String(guildId)] = { ...(all[String(guildId)] || {}), volumePct: pct };
  saveGuildSettings(all);
}

function getSavedSpeed(guildId) {
  const v = loadGuildSettings()[String(guildId)]?.speed;
  return Number.isFinite(v) && v >= 0.5 && v <= 2 ? v : 1;
}

function setSavedSpeed(guildId, speed) {
  const all = loadGuildSettings();
  all[String(guildId)] = { ...(all[String(guildId)] || {}), speed };
  saveGuildSettings(all);
}

function getSavedShowLyrics(guildId) {
  const v = loadGuildSettings()[String(guildId)]?.showLyrics;
  return v === undefined ? true : v !== false;
}

function setSavedShowLyrics(guildId, on) {
  const all = loadGuildSettings();
  all[String(guildId)] = { ...(all[String(guildId)] || {}), showLyrics: on !== false };
  saveGuildSettings(all);
}

function getSavedShowControls(guildId) {
  const v = loadGuildSettings()[String(guildId)]?.showControls;
  return v === undefined ? true : v !== false;
}

function setSavedShowControls(guildId, on) {
  const all = loadGuildSettings();
  all[String(guildId)] = { ...(all[String(guildId)] || {}), showControls: on !== false };
  saveGuildSettings(all);
}

function getSavedMusicVoice(guildId) {
  return loadGuildSettings()[String(guildId)]?.musicVoiceChannelId || null;
}

function setSavedMusicVoice(guildId, channelId) {
  const all = loadGuildSettings();
  all[String(guildId)] = { ...(all[String(guildId)] || {}), musicVoiceChannelId: channelId };
  saveGuildSettings(all);
}

function getSavedAiChannel(guildId) {
  return loadGuildSettings()[String(guildId)]?.aiChatChannelId || null;
}

function aiSessionKeyForChannel(guildId, channelId) {
  return getSavedAiChannel(guildId) === channelId
    ? `channel:${guildId}:${channelId}`
    : `slash:${guildId}:${channelId}`;
}

function setSavedAiChannel(guildId, channelId) {
  const all = loadGuildSettings();
  all[String(guildId)] = { ...(all[String(guildId)] || {}), aiChatChannelId: channelId };
  saveGuildSettings(all);
}

function getSavedControlChannel(guildId) {
  return loadGuildSettings()[String(guildId)]?.controlChannelId || null;
}

function setSavedControlChannel(guildId, channelId) {
  const all = loadGuildSettings();
  all[String(guildId)] = { ...(all[String(guildId)] || {}), controlChannelId: channelId };
  saveGuildSettings(all);
}

module.exports = {
  volumeStorePath,
  loadGuildSettings,
  effectiveCookieFile,
  saveGuildSettings,
  getSavedVolume,
  setSavedVolume,
  getSavedSpeed,
  setSavedSpeed,
  getSavedShowLyrics,
  setSavedShowLyrics,
  getSavedShowControls,
  setSavedShowControls,
  getSavedMusicVoice,
  setSavedMusicVoice,
  getSavedAiChannel,
  aiSessionKeyForChannel,
  setSavedAiChannel,
  getSavedControlChannel,
  setSavedControlChannel
};
