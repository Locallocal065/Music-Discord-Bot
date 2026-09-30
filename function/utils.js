const fs = require('fs');
const path = require('path');

function nowStr() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} `
    + `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function nowStrShort() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function writeLog(plain, isDebug = false, type = "") {
  // bot-debug.log — always receives everything (incl. ffmpeg)
  try { fs.appendFileSync(LOG_FILE_DEBUG, plain + "\n", "utf8"); } catch { }

  // bot-error.log — ERROR and WARN only
  if (type === "ERROR" || type === "WARN") {
    try { fs.appendFileSync(LOG_FILE_ERROR, plain + "\n", "utf8"); } catch { }
  }

  // bot.log — everything except ffmpeg debug
  if (!isDebug) {
    try { fs.appendFileSync(LOG_FILE_MAIN, plain + "\n", "utf8"); } catch { }
  }
}

function fmtTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return "• LIVE";
  sec = Math.floor(sec);
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function cleanTitle(t, max = 90) {
  let s = String(t ?? "Unknown").split("\n")[0].trim();
  s = s.replace(/(\s*#[^\s#]+)+\s*$/, "").trim(); // strip trailing hashtag run
  if (s.length > max) s = s.slice(0, max - 1).trim() + "…";
  return s || "Unknown";
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function loopLabel(mode) {
  if (mode === "track") return "🔂 Loop current";
  if (mode === "queue") return "🔁 Loop whole queue";
  return "➡️ Off";
}

function isUrl(s) { try { new URL(s); return true; } catch { return false; } }

function numOrNull(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

module.exports = {
  nowStr,
  nowStrShort,
  writeLog,
  fmtTime,
  cleanTitle,
  shuffleArray,
  loopLabel,
  isUrl,
  numOrNull
};
