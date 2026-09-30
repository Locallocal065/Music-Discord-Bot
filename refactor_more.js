const fs = require('fs');
let code = fs.readFileSync('bot.js', 'utf8');

const groups = {
  'lyrics.js': [
    'parseSyncedLyrics', 'lyricIndexAt', 'fetchLyrics', 
    'karaokeField', 'estimateSyncedLyrics'
  ],
  'settings.js': [
    'volumeStorePath', 'loadGuildSettings', 'effectiveCookieFile', 
    'saveGuildSettings', 'getSavedVolume', 'setSavedVolume', 
    'getSavedSpeed', 'setSavedSpeed', 'getSavedShowLyrics', 
    'setSavedShowLyrics', 'getSavedShowControls', 'setSavedShowControls',
    'getSavedMusicVoice', 'setSavedMusicVoice', 'getSavedAiChannel', 
    'aiSessionKeyForChannel', 'setSavedAiChannel', 'getSavedControlChannel', 
    'setSavedControlChannel'
  ],
  'system.js': [
    'logConfiguration', 'ytdlpOpts', 'readLastUpdateTs', 
    'writeLastUpdateTs', 'runYtDlpUpdate', 'msUntilNextBangkokMidnight', 
    'scheduleDailyBangkokMidnight', 'ytCookiesPath', 'ytCookiesStatus', 
    'saveYTCookies', 'isGuildAdmin', 'wsPing'
  ]
};

const imports = {
  'lyrics.js': "const { fetchJsonWithTimeout } = require('./metadata.js');\nconst { fmtTime, cleanTitle } = require('./utils.js');\n\n",
  'settings.js': "const fs = require('fs');\nconst path = require('path');\nconst { logPretty } = require('./utils.js');\n\n",
  'system.js': "const fs = require('fs');\nconst path = require('path');\nconst { exec } = require('child_process');\nconst { logPretty, nowStrShort } = require('./utils.js');\n\n"
};

let exportedAll = {};

for (const [filename, funcs] of Object.entries(groups)) {
  let moduleCode = imports[filename];
  const exported = [];

  for (const fn of funcs) {
    const r = new RegExp('^(?:async )?function ' + fn + '\\s*\\([^{]*\\)\\s*\\{', 'm');
    const match = r.exec(code);
    if (!match) continue;
    
    let start = match.index;
    let braces = 0;
    let end = -1;
    let inString = false;
    let stringChar = '';
    
    for (let i = start; i < code.length; i++) {
      const c = code[i];
      if ((c === '"' || c === "'" || c === '`') && code[i-1] !== '\\') {
        if (!inString) { inString = true; stringChar = c; }
        else if (stringChar === c) { inString = false; }
      }
      
      if (!inString) {
        if (c === '{') braces++;
        if (c === '}') {
          braces--;
          if (braces === 0) {
            end = i;
            break;
          }
        }
      }
    }
    
    if (end !== -1) {
      const fnCode = code.slice(start, end + 1);
      moduleCode += fnCode + '\n\n';
      exported.push(fn);
      code = code.slice(0, start) + code.slice(end + 1);
    }
  }

  moduleCode += 'module.exports = {\n  ' + exported.join(',\n  ') + '\n};\n';
  fs.writeFileSync('function/' + filename, moduleCode);
  exportedAll[filename] = exported;
  
  if (exported.length > 0) {
    code = 'const { ' + exported.join(', ') + ' } = require("./function/' + filename + '");\n' + code;
  }
}

fs.writeFileSync('bot.js', code);
console.log('Moved lyrics, settings, and system modules.');
