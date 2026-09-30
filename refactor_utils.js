const fs = require('fs');
let code = fs.readFileSync('bot.js', 'utf8');

const funcsToMove = [
  'nowStr', 'nowStrShort', 'writeLog', 'logPretty', 
  'fmtTime', 'cleanTitle', 'shuffleArray', 'loopLabel', 
  'escHtml', 'isUrl', 'numOrNull'
];
let utilsCode = "const fs = require('fs');\nconst path = require('path');\n\n";
const exported = [];

for (const fn of funcsToMove) {
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
    utilsCode += fnCode + '\n\n';
    exported.push(fn);
    code = code.slice(0, start) + code.slice(end + 1);
  }
}

utilsCode += 'module.exports = {\n  ' + exported.join(',\n  ') + '\n};\n';

if (!fs.existsSync('function')) fs.mkdirSync('function');
fs.writeFileSync('function/utils.js', utilsCode);

code = 'const { ' + exported.join(', ') + ' } = require("./function/utils.js");\n' + code;
fs.writeFileSync('bot.js', code);
console.log('Moved: ' + exported.join(', '));
