const fs = require('fs');
let code = fs.readFileSync('bot.js', 'utf8');

const funcsToMove = [
  'makeEmbed', 'successEmbed', 'errorEmbed', 'infoEmbed', 'musicEmbed', 'buildNowPlayingEmbed', 'buildHelpEmbedSlash'
];
let embedsCode = "const { EmbedBuilder } = require('discord.js');\n\n" +
  "const COLORS = {\n" +
  "  success: 0x2e8b57,\n" +
  "  error: 0xff4500,\n" +
  "  info: 0x5865F2,\n" +
  "  music: 0x9370DB,\n" +
  "  queue: 0x4682B4,\n" +
  "};\n\n";

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
    embedsCode += fnCode + '\n\n';
    exported.push(fn);
    code = code.slice(0, start) + code.slice(end + 1);
  }
}

// Extract COLORS from bot.js as well
code = code.replace(/const COLORS = \{[\s\S]*?\};\n/, '');

embedsCode += 'module.exports = {\n  COLORS,\n  ' + exported.join(',\n  ') + '\n};\n';

fs.writeFileSync('function/embeds.js', embedsCode);

code = 'const { COLORS, ' + exported.join(', ') + ' } = require("./function/embeds.js");\n' + code;
fs.writeFileSync('bot.js', code);
console.log('Moved: ' + exported.join(', '));
