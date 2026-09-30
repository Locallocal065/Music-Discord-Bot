const fs = require('fs');
let code = fs.readFileSync('bot.js', 'utf8');

const funcsToMove = [
  'aiSystemInstruction', 'askOpenRouter', 'askGemini',
  'loadAiHistories', 'loadAiPersonas', 'saveAiPersonas', 
  'getAiPersona', 'setAiPersona', 'saveAiHistories', 
  'askGeminiWithHistory', 'clearGuildAiChats'
];

let aiCode = "const fs = require('fs');\n" + 
             "const path = require('path');\n" +
             "const { fetchJsonWithTimeout } = require('./metadata.js');\n" +
             "const { writeLog, logPretty, nowStr } = require('./utils.js');\n\n";

// aiHistoryPath and aiPersonasPath are constants in bot.js, I should extract them or they will be undefined.
aiCode += "const aiHistoryPath = path.join(process.cwd(), 'Ai_History');\n";
aiCode += "const aiPersonasPath = path.join(aiHistoryPath, 'personas.json');\n";
// Let's remove them from bot.js
code = code.replace(/const aiHistoryPath = path\.join\(process\.cwd\(\), "Ai_History"\);\n?/, '');
code = code.replace(/const aiPersonasPath = path\.join\(aiHistoryPath, "personas\.json"\);\n?/, '');

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
    aiCode += fnCode + '\n\n';
    exported.push(fn);
    code = code.slice(0, start) + code.slice(end + 1);
  }
}

aiCode += 'module.exports = {\n  ' + exported.join(',\n  ') + '\n};\n';

fs.writeFileSync('function/ai.js', aiCode);

code = 'const { ' + exported.join(', ') + ' } = require("./function/ai.js");\n' + code;
fs.writeFileSync('bot.js', code);
console.log('Moved: ' + exported.join(', '));
