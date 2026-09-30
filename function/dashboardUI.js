const { cleanTitle, escHtml } = require('./utils.js');

function dashLoginPage(msg = "") {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Music Bot · Sign in</title>
<script src="https://cdn.tailwindcss.com"></script><link href="https://unpkg.com/aos@2.3.4/dist/aos.css" rel="stylesheet">
<style>body{background:radial-gradient(ellipse at 15% 15%,rgba(232,179,76,.1),transparent 38%),#0b0f14}input:focus{outline:2px solid #e8b34c;outline-offset:2px}</style></head>
<body class="min-h-screen text-zinc-100 antialiased"><main class="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-5 py-12">
<section data-aos="fade-up" class="w-full max-w-md border border-white/10 bg-[#121a24] p-7 shadow-2xl shadow-black/30 sm:p-9">
<div class="mb-8 flex items-center gap-3"><span class="grid h-11 w-11 place-items-center bg-amber-400 text-xl font-black text-[#17140d]">♪</span><div><p class="text-xs font-semibold uppercase tracking-[.18em] text-amber-300">Control desk</p><p class="text-xs text-zinc-500">Music bot</p></div></div>
<h1 class="text-2xl font-semibold tracking-tight">Sign in</h1><p class="mt-2 text-sm text-zinc-400">Use the dashboard credentials configured for this bot.</p>
${msg ? `<div role="alert" class="mt-5 border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">${escHtml(msg)}</div>` : ""}
<form method="POST" action="/login" class="mt-7 space-y-4"><label class="block text-xs font-medium text-zinc-400">Username<input name="username" required autocomplete="username" class="mt-2 w-full border border-white/10 bg-[#0b0f14] px-3 py-3 text-sm text-zinc-100 placeholder:text-zinc-600" placeholder="Username"></label><label class="block text-xs font-medium text-zinc-400">Password<input name="password" type="password" required autocomplete="current-password" class="mt-2 w-full border border-white/10 bg-[#0b0f14] px-3 py-3 text-sm text-zinc-100 placeholder:text-zinc-600" placeholder="Password"></label><button class="w-full bg-amber-300 px-4 py-3 text-sm font-bold text-[#19150c] transition hover:bg-amber-200" type="submit">Continue</button></form>
</section></main><script src="https://unpkg.com/aos@2.3.4/dist/aos.js"></script><script>AOS.init({once:true,duration:500,disable:window.matchMedia('(prefers-reduced-motion: reduce)').matches});</script></body></html>`;
}

function sharedDashCss() {
  return `
  :root{
    --ink:#0b0f14;
    --panel:#121a24;
    --panel-2:#182230;
    --line:#26323d;
    --line-soft:#1c2630;
    --text:#e8ecef;
    --text-dim:#8fa0ac;
    --amber:#e8b34c;
    --blurple:#5865f2;
    --bad:#f0654b;
    --good:#4ade80;
    --radius:10px;
    --font-ui:'Space Grotesk',system-ui,-apple-system,sans-serif;
    --font-mono:'IBM Plex Mono',ui-monospace,'SFMono-Regular',monospace;
  }
  *{box-sizing:border-box}
  body{font-family:var(--font-ui);background:var(--ink);color:var(--text);margin:0;-webkit-font-smoothing:antialiased}
  a{color:var(--amber);text-decoration:none}
  a:hover{text-decoration:underline}
  .wrap{max-width:920px;margin:0 auto;padding:28px 20px 60px}
  .topbar{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding-bottom:18px;border-bottom:1px solid var(--line)}
  .status-pill{display:flex;align-items:center;gap:10px}
  .dot{width:9px;height:9px;border-radius:50%;background:var(--good);box-shadow:0 0 0 3px rgba(74,222,128,.18)}
  .botname{font-weight:600;font-size:16px;letter-spacing:.2px}
  .meta{color:var(--text-dim);font-size:13px;font-family:var(--font-mono)}
  nav.links{display:flex;gap:14px;font-size:13px;color:var(--text-dim)}
  .banner{margin-top:16px;padding:10px 14px;border-radius:8px;font-size:13.5px;border:1px solid transparent}
  .banner.ok{background:rgba(74,222,128,.08);border-color:rgba(74,222,128,.35);color:#c8f5d6}
  .banner.err{background:rgba(240,101,75,.08);border-color:rgba(240,101,75,.4);color:#ffd2c7}
  .module{margin-top:22px}
  .module-head{display:flex;align-items:baseline;gap:10px;margin-bottom:10px}
  .module-head h2{font-size:13px;margin:0;font-weight:600;letter-spacing:.3px;color:var(--text-dim)}
  .module-head .rule{flex:1;height:1px;background:var(--line)}
  .rack{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:18px}
  .row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
  .row + .row{margin-top:12px}
  select,input[type=text],input[type=number]{font-family:var(--font-ui);background:var(--panel-2);border:1px solid var(--line);color:var(--text);border-radius:7px;padding:9px 11px;font-size:13.5px}
  select:focus,input:focus{outline:none;border-color:var(--amber)}
  .field-label{font-size:11.5px;color:var(--text-dim);display:block;margin-bottom:4px}
  .field{display:flex;flex-direction:column}
  input#ctlQuery,input#q2{flex:1;min-width:200px}
  button{font-family:var(--font-ui);background:var(--panel-2);border:1px solid var(--line);color:var(--text);font-weight:600;font-size:13.5px;padding:9px 15px;border-radius:7px;cursor:pointer;transition:border-color .15s ease}
  button:hover{border-color:var(--amber)}
  button.primary{background:var(--amber);border-color:var(--amber);color:#241a06}
  button.primary:hover{filter:brightness(1.06)}
  button.danger{background:transparent;border-color:var(--bad);color:var(--bad)}
  button.danger:hover{background:rgba(240,101,75,.1)}
  .transport{display:flex;gap:8px;align-items:center}
  .transport button{min-width:44px}
  code{font-family:var(--font-mono);background:var(--panel-2);padding:2px 6px;border-radius:5px;font-size:12.5px}
  small{color:var(--text-dim)}
  .msg-line{font-size:12.5px;color:var(--text-dim);min-height:16px;margin-top:8px}
  .now-readout{margin-top:14px;padding:12px 14px;background:var(--panel-2);border:1px solid var(--line-soft);border-radius:8px;font-size:13.5px;line-height:1.6}
  .cue-list{list-style:none;margin:0;padding:0}
  .cue-list li{display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--line-soft);font-size:13.5px}
  .cue-list li:last-child{border-bottom:none}
  .cue-idx{font-family:var(--font-mono);color:var(--amber);width:18px;flex-shrink:0}
  .grid-2{display:grid;grid-template-columns:1.2fr 1fr;gap:16px}
  @media (max-width:720px){.grid-2{grid-template-columns:1fr}}
  textarea{width:100%;min-height:130px;background:var(--panel-2);color:var(--text);border:1px solid var(--line);border-radius:8px;padding:10px;font-family:var(--font-mono);font-size:12.5px;resize:vertical}
  .eq{display:inline-flex;gap:2px;align-items:flex-end;height:14px;vertical-align:middle;margin-right:8px}
  .eq span{width:3px;background:var(--amber);border-radius:1px;animation:eqbounce 900ms ease-in-out infinite}
  .eq span:nth-child(2){animation-delay:150ms}
  .eq span:nth-child(3){animation-delay:300ms}
  .eq.paused span{animation-play-state:paused;opacity:.35}
  @keyframes eqbounce{0%,100%{height:30%}50%{height:100%}}
  input[type=range]{-webkit-appearance:none;appearance:none;height:4px;background:var(--line);border-radius:99px;outline:none}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:var(--amber);cursor:pointer;border:2px solid var(--ink)}
  input[type=range]::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:var(--amber);cursor:pointer;border:2px solid var(--ink);border:none}
  `;
}

function dashPage(status, msg = "", isErr = false) {
  const q = status.queues.map((g) => `<li><span class="cue-idx">▸</span><div><b>${escHtml(g.name)}</b><br><small>${g.nowPlaying ? "▶ " + escHtml(g.nowPlaying) : "idle"} · ${g.queueCount} queued${g.next.length ? " · " + g.next.map(escHtml).join(" · ") : ""}</small></div></li>`).join("") || `<li><small>No guilds cached yet</small></li>`;
  const c = status.cookies;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Music Bot — Console</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>${sharedDashCss()}</style></head><body><div class="wrap">
<div class="topbar">
  <div class="status-pill"><span class="dot"></span><span class="botname">${escHtml(status.tag)}</span></div>
  <div class="meta">${status.guilds} server${status.guilds === 1 ? "" : "s"} · up ${status.uptimeSec}s</div>
  <nav class="links"><a href="/logout">Logout</a><a href="/web.html">Web player</a><a href="/api/status">JSON</a><a href="/health">Health</a></nav>
</div>
${msg ? `<div class="banner ${isErr ? "err" : "ok"}">${escHtml(msg)}</div>` : ""}

<div class="module">
  <div class="module-head"><h2>Control rack</h2><div class="rule"></div></div>
  <div class="rack">
    <div class="row">
      <div class="field"><span class="field-label">Server</span><select id="ctlGuild"></select></div>
      <div class="field"><span class="field-label">Voice channel</span><select id="ctlChan"></select></div>
      <button onclick="ctlJoin()">Join</button><button onclick="ctlLeave()">Leave</button>
    </div>
    <div class="row">
      <input id="ctlQuery" type="text" placeholder="song name or URL">
      <button class="primary" onclick="ctlPlay()">Play</button>
    </div>
    <div class="row">
      <div class="transport">
        <button onclick="ctlDo('pause')" title="Pause">⏸</button>
        <button onclick="ctlDo('resume')" title="Resume">▶</button>
        <button onclick="ctlDo('skip')" title="Skip">⏭</button>
        <button class="danger" onclick="ctlDo('stop')" title="Stop">⏹</button>
      </div>
      <button onclick="ctlDo('shuffle')">Shuffle</button>
    </div>
    <div class="row">
      <div class="field"><span class="field-label">Volume %</span><input id="ctlVol" type="number" min="0" max="10000" step="10" style="width:100px"></div>
      <button onclick="ctlVolSet()">Set</button>
      <div class="field"><span class="field-label">Loop</span>
        <select id="ctlLoop"><option value="off">off</option><option value="track">track</option><option value="queue">queue</option></select>
      </div>
      <button onclick="ctlLoopSet()">Set</button>
    </div>
    <div class="now-readout" id="ctlNow"></div>
    <div class="msg-line" id="ctlMsg"><small></small></div>
  </div>
</div>

<div class="grid-2">
  <div class="module">
    <div class="module-head"><h2>Queues</h2><div class="rule"></div></div>
    <div class="rack"><ul class="cue-list">${q}</ul></div>
  </div>
  <div class="module">
    <div class="module-head"><h2>YouTube sign-in</h2><div class="rule"></div></div>
    <div class="rack">
      <p style="font-size:12.5px;color:var(--text-dim);margin-top:0">Fixes <code>Please sign in / GVS PO Token</code>. Export with "Get cookies.txt LOCALLY" while signed into YouTube, paste below.</p>
      <p style="font-size:13px">${c.exists ? `Signed in — <code>${escHtml(c.path)}</code> (${c.size}b, ${escHtml(c.mtime)})` : `Not signed in — expected at <code>${escHtml(c.path)}</code>`}</p>
      <form method="POST" action="/cookies"><textarea name="cookiesText" placeholder="# Netscape HTTP Cookie File&#10;.youtube.com ..."></textarea><br><button class="primary" type="submit" style="margin-top:8px">Save cookies</button></form>
      <form method="POST" action="/cookies/clear" style="margin-top:8px"><button class="danger" type="submit">Remove cookies</button></form>
    </div>
  </div>
</div>

<div class="module">
  <div class="module-head"><h2>Utility</h2><div class="rule"></div></div>
  <div class="rack"><form method="POST" action="/ytdlp-update"><button type="submit">Run yt-dlp update</button></form></div>
</div>
</div>
<script>
var CTL_G = [];
function ctlSay(t){ var el = document.querySelector('#ctlMsg small'); if (el) el.textContent = t; }
function ctlGid(){ var s = document.getElementById('ctlGuild'); return s && s.value ? s.value : ''; }
async function ctlCall(path, data){
  var r = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data || {}) });
  var j = null; try { j = await r.json(); } catch (e) { throw new Error('bad response'); }
  if (!r.ok || (j && j.error)) throw new Error((j && j.error) || ('HTTP ' + r.status));
  return j;
}
async function ctlLoad(){
  try {
    var gs = await (await fetch('/api/guilds')).json();
    CTL_G = gs;
    var gsel = document.getElementById('ctlGuild');
    gsel.innerHTML = '';
    gs.forEach(function(g){
      var o = document.createElement('option'); o.value = g.id; o.textContent = g.name + (g.botVC ? ' (bot in voice)' : ''); gsel.appendChild(o);
    });
    ctlGuildChanged(); ctlRefresh();
  } catch (e) { ctlSay('load failed: ' + e.message); }
}
function ctlGuildChanged(){
  var id = ctlGid();
  var g = null;
  CTL_G.forEach(function(x){ if (x.id === id) g = x; });
  var csel = document.getElementById('ctlChan');
  csel.innerHTML = '';
  if (g) g.voice.forEach(function(c){
    var o = document.createElement('option'); o.value = c.id; o.textContent = c.name + ' (' + c.members + ')'; csel.appendChild(o);
  });
}
async function ctlJoin(){ try { var j = await ctlCall('/api/join', { guildId: ctlGid(), channelId: document.getElementById('ctlChan').value }); ctlSay('joined ' + j.channel); ctlLoad(); } catch (e) { ctlSay('join failed: ' + e.message); } }
async function ctlLeave(){ try { await ctlCall('/api/leave', { guildId: ctlGid() }); ctlSay('left voice'); ctlLoad(); } catch (e) { ctlSay('leave failed: ' + e.message); } }
async function ctlPlay(){ var q = document.getElementById('ctlQuery').value; if (!q) { ctlSay('type a song first'); return; } try { var j = await ctlCall('/api/play', { guildId: ctlGid(), query: q }); ctlSay('queued: ' + j.title); document.getElementById('ctlQuery').value = ''; ctlRefresh(); } catch (e) { ctlSay('play failed: ' + e.message); } }
async function ctlDo(a){ try { var j = await ctlCall('/api/ctl', { guildId: ctlGid(), action: a }); ctlSay(a + ': ' + j.result); ctlRefresh(); } catch (e) { ctlSay(a + ' failed: ' + e.message); } }
async function ctlVolSet(){ try { var j = await ctlCall('/api/volume', { guildId: ctlGid(), value: Number(document.getElementById('ctlVol').value) }); ctlSay('volume: ' + j.result); ctlRefresh(); } catch (e) { ctlSay('volume failed: ' + e.message); } }
async function ctlLoopSet(){ try { var j = await ctlCall('/api/loop', { guildId: ctlGid(), mode: document.getElementById('ctlLoop').value }); ctlSay('loop: ' + j.result); ctlRefresh(); } catch (e) { ctlSay('loop failed: ' + e.message); } }
function ctlEsc(s){ return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
async function ctlRefresh(){
  var id = ctlGid(); if (!id) return;
  try {
    var gs = await (await fetch('/api/guilds')).json();
    CTL_G = gs;
    var g = null;
    gs.forEach(function(x){ if (x.id === id) g = x; });
    if (!g) return;
    var h = '<b>Now:</b> ' + ctlEsc(g.nowPlaying ? g.nowPlaying.title : '— idle —') + ' · 🔊 ' + g.volume + '% · 🔁 ' + ctlEsc(g.loop) + ' · ' + ctlEsc(g.player);
    if (g.queue && g.queue.length) { h += '<br><b>Queue:</b> ' + g.queue.map(function(x){ return ctlEsc(x.title); }).join(' | '); }
    document.getElementById('ctlNow').innerHTML = h;
    var v = document.getElementById('ctlVol'); if (v && document.activeElement !== v) v.value = g.volume;
    var l = document.getElementById('ctlLoop'); if (l) l.value = g.loop;
  } catch (e) {}
}
document.getElementById('ctlGuild').addEventListener('change', function(){ ctlGuildChanged(); ctlRefresh(); });
setInterval(ctlRefresh, 10000);
ctlLoad();
</script>
<div class="card"><h3>▶ Queues</h3><ul>${q}</ul></div>
<div class="card"><h3>🍪 YouTube sign-in (cookies)</h3>
<p><small>Fixes <code>Please sign in / GVS PO Token</code>. Export with “Get cookies.txt LOCALLY” while logged into YouTube, paste below.</small></p>
<p>Status: ${c.exists ? `✅ <code>${escHtml(c.path)}</code> (${c.size} bytes, ${escHtml(c.mtime)})` : `❌ not found — expected at <code>${escHtml(c.path)}</code>`}</p>
<form method="POST" action="/cookies"><textarea name="cookiesText" placeholder="# Netscape HTTP Cookie File&#10;.youtube.com ..."></textarea><br><button type="submit">Save cookies</button></form>
<form method="POST" action="/cookies/clear" style="margin-top:6px"><button class="danger" type="submit">Remove cookies</button></form>
</div>
<div class="card"><h3>⚙️ yt-dlp</h3><form method="POST" action="/ytdlp-update"><button class="ghost" type="submit">Run yt-dlp update</button></form></div>
</div></body></html>`;
}

function dashPageTailwind(status, msg = "", isErr = false) {
  const queues = status.queues.map((guild) => `<li class="flex gap-3 border-b border-white/5 py-3 last:border-0"><span class="font-mono text-amber-300">/</span><div class="min-w-0"><strong class="text-sm">${escHtml(guild.name)}</strong><p class="mt-1 truncate text-xs text-zinc-400">${guild.nowPlaying ? "▶ " + escHtml(guild.nowPlaying) : "Idle"} · ${guild.queueCount} queued${guild.next.length ? " · " + guild.next.map(escHtml).join(" · ") : ""}</p></div></li>`).join("") || `<li class="py-3 text-sm text-zinc-500">No servers connected</li>`;
  const cookies = status.cookies;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bocchi · Control Desk</title>
<script src="https://cdn.tailwindcss.com"></script><link href="https://unpkg.com/aos@2.3.4/dist/aos.css" rel="stylesheet">
<style>body{background-color:#090c10;background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);background-size:32px 32px}input:focus,select:focus,textarea:focus{outline:2px solid #e8b34c;outline-offset:2px}button:focus-visible,a:focus-visible{outline:2px solid #e8b34c;outline-offset:3px} [data-aos]{will-change:transform,opacity}</style></head>
<body class="min-h-screen text-zinc-100 antialiased"><div class="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
<header class="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 py-5" data-aos="fade-down"><div class="flex items-center gap-3"><span class="grid h-10 w-10 place-items-center bg-amber-300 text-xl font-black text-zinc-950">♪</span><div><p class="text-sm font-semibold">${escHtml(status.tag)}</p><p class="font-mono text-[11px] text-zinc-500">BOT CONTROL DESK</p></div></div><div class="flex items-center gap-4"><span class="inline-flex items-center gap-2 text-xs text-emerald-300"><i class="h-2 w-2 rounded-full bg-emerald-400"></i>Online</span><span class="font-mono text-xs text-zinc-400">${status.guilds} servers · ${status.uptimeSec}s uptime</span></div><nav class="flex gap-4 text-xs text-zinc-400"><a class="hover:text-amber-200" href="/web.html">Web player</a><a class="hover:text-amber-200" href="/api/status">Status</a><a class="hover:text-amber-200" href="/health">Health</a><a class="hover:text-rose-300" href="/logout">Logout</a></nav></header>
<main><section class="flex flex-wrap items-end justify-between gap-4 py-8" data-aos="fade-up"><div><p class="font-mono text-xs uppercase text-amber-300">Music operations / Overview</p><h1 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Control room<span class="text-amber-300">.</span></h1></div><div class="font-mono text-xs text-zinc-500">LIVE SYSTEM · ${escHtml(status.tag)}</div></section>
${msg ? `<div role="alert" class="mb-5 border px-4 py-3 text-sm ${isErr ? "border-rose-400/30 bg-rose-400/10 text-rose-200" : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"}">${escHtml(msg)}</div>` : ""}
<section class="mb-8 border border-white/10 bg-[#10151b]/95 p-5 sm:p-6" data-aos="fade-up"><div class="mb-5 flex items-center justify-between"><div><p class="font-mono text-[11px] uppercase text-zinc-500">01 / Transport</p><h2 class="mt-1 text-lg font-semibold">Playback controls</h2></div><span class="border border-amber-300/20 px-2 py-1 font-mono text-[10px] text-amber-200">REMOTE</span></div>
<div class="grid gap-4 md:grid-cols-[1fr_1fr_auto_auto]"><label class="text-xs text-zinc-400">Server<select id="ctlGuild" class="mt-2 w-full border border-white/10 bg-[#090c10] px-3 py-3 text-sm text-zinc-100"></select></label><label class="text-xs text-zinc-400">Voice channel<select id="ctlChan" class="mt-2 w-full border border-white/10 bg-[#090c10] px-3 py-3 text-sm text-zinc-100"></select></label><button class="self-end bg-amber-300 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-amber-200" onclick="ctlJoin()">Join voice</button><button class="self-end border border-white/15 px-5 py-3 text-sm text-zinc-200 hover:border-rose-300 hover:text-rose-200" onclick="ctlLeave()">Leave</button></div>
<div class="mt-4 flex flex-wrap gap-2"><input id="ctlQuery" type="text" placeholder="Song name or URL" class="min-w-[220px] flex-1 border border-white/10 bg-[#090c10] px-3 py-3 text-sm text-white placeholder:text-zinc-600"><button class="bg-amber-300 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-amber-200" onclick="ctlPlay()">Add to queue</button></div>
<div class="mt-4 flex flex-wrap items-center gap-2"><div class="flex gap-2"><button class="h-11 w-12 border border-white/10 text-lg hover:border-amber-300" onclick="ctlDo('pause')" title="Pause">Ⅱ</button><button class="h-11 w-12 border border-white/10 text-lg hover:border-amber-300" onclick="ctlDo('resume')" title="Resume">▶</button><button class="h-11 w-12 border border-white/10 text-lg hover:border-amber-300" onclick="ctlDo('skip')" title="Skip">⏭</button><button class="h-11 w-12 border border-rose-400/30 text-lg text-rose-300 hover:bg-rose-400/10" onclick="ctlDo('stop')" title="Stop">■</button></div><button class="h-11 border border-white/10 px-4 text-sm hover:border-amber-300" onclick="ctlDo('shuffle')">Shuffle</button><div class="ml-auto flex flex-wrap items-end gap-3"><label class="text-xs text-zinc-500">Volume %<input id="ctlVol" type="number" min="0" max="10000" step="10" class="mt-1 block w-24 border border-white/10 bg-[#090c10] px-2 py-2 text-sm text-white"></label><button class="h-10 border border-white/10 px-3 text-xs hover:border-amber-300" onclick="ctlVolSet()">Set</button><label class="text-xs text-zinc-500">Loop<select id="ctlLoop" class="mt-1 block border border-white/10 bg-[#090c10] px-3 py-2 text-sm text-white"><option value="off">Off</option><option value="track">Track</option><option value="queue">Queue</option></select></label><button class="h-10 border border-white/10 px-3 text-xs hover:border-amber-300" onclick="ctlLoopSet()">Set</button></div></div>
<div id="ctlNow" class="mt-5 border-l-2 border-amber-300 bg-black/20 px-4 py-3 text-sm leading-6 text-zinc-300"></div><p id="ctlMsg" class="mt-2 min-h-5 text-xs text-zinc-500"><small></small></p></section>
<div class="grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><section class="border border-white/10 bg-[#10151b]/95 p-5 sm:p-6" data-aos="fade-up"><div class="mb-4 flex items-end justify-between"><div><p class="font-mono text-[11px] uppercase text-zinc-500">02 / Queue</p><h2 class="mt-1 text-lg font-semibold">Server activity</h2></div><span class="font-mono text-xs text-zinc-500">${status.queues.length} active</span></div><ul class="divide-y divide-white/5">${queues}</ul></section>
<section class="border border-white/10 bg-[#10151b]/95 p-5 sm:p-6" data-aos="fade-up" data-aos-delay="100"><div class="mb-4"><p class="font-mono text-[11px] uppercase text-zinc-500">03 / YouTube</p><h2 class="mt-1 text-lg font-semibold">Cookie session</h2></div><div class="mb-4 border border-white/5 bg-black/20 p-3 text-xs leading-5 text-zinc-400">${cookies.exists ? `Signed in · <span class="text-emerald-300">${cookies.size} bytes</span><br><code>${escHtml(cookies.path)}</code>` : `Not signed in<br>Expected at <code>${escHtml(cookies.path)}</code>`}</div><form method="POST" action="/cookies" class="space-y-3"><textarea name="cookiesText" placeholder="# Netscape HTTP Cookie File&#10;.youtube.com ..." class="min-h-32 w-full border border-white/10 bg-[#090c10] p-3 font-mono text-xs text-zinc-200 placeholder:text-zinc-600"></textarea><button class="w-full bg-amber-300 px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-amber-200" type="submit">Save cookies</button></form><form method="POST" action="/cookies/clear" class="mt-2"><button class="w-full border border-rose-400/30 px-4 py-3 text-sm text-rose-200 hover:bg-rose-400/10" type="submit">Remove cookies</button></form></section></div>
<section class="mt-6 flex flex-wrap items-center justify-between gap-4 border border-white/10 bg-[#10151b]/95 p-5" data-aos="fade-up"><div><p class="font-mono text-[11px] uppercase text-zinc-500">04 / Maintenance</p><h2 class="mt-1 text-base font-semibold">yt-dlp</h2><p class="mt-1 text-xs text-zinc-500">Automatic updates ${status.ytAutoUpdate ? "enabled" : "disabled"}</p></div><form method="POST" action="/ytdlp-update"><button class="border border-white/15 px-4 py-3 text-sm hover:border-amber-300" type="submit">Run update</button></form></section>
</main><footer class="mt-10 border-t border-white/10 pt-4 font-mono text-[10px] text-zinc-600">BOCCHI AUDIO SYSTEM · DASHBOARD</footer></div>
<script src="https://unpkg.com/aos@2.3.4/dist/aos.js"></script><script>
var CTL_G = [];
function ctlSay(t){ var el = document.querySelector('#ctlMsg small'); if (el) el.textContent = t; }
function ctlGid(){ var s = document.getElementById('ctlGuild'); return s && s.value ? s.value : ''; }
async function ctlCall(path, data){var r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data||{})});var j=null;try{j=await r.json()}catch(e){throw new Error('bad response')}if(!r.ok||(j&&j.error))throw new Error((j&&j.error)||('HTTP '+r.status));return j;}
async function ctlLoad(){try{var gs=await(await fetch('/api/guilds')).json();CTL_G=gs;var gsel=document.getElementById('ctlGuild');gsel.innerHTML='';gs.forEach(function(g){var o=document.createElement('option');o.value=g.id;o.textContent=g.name+(g.botVC?' · in voice':'');gsel.appendChild(o)});ctlGuildChanged();ctlRefresh()}catch(e){ctlSay('load failed: '+e.message)}}
function ctlGuildChanged(){var id=ctlGid();var g=CTL_G.find(function(x){return x.id===id});var csel=document.getElementById('ctlChan');csel.innerHTML='';if(g)g.voice.forEach(function(c){var o=document.createElement('option');o.value=c.id;o.textContent=c.name+' · '+c.members+' members';csel.appendChild(o)})}
async function ctlJoin(){try{var j=await ctlCall('/api/join',{guildId:ctlGid(),channelId:document.getElementById('ctlChan').value});ctlSay('Joined '+j.channel);ctlLoad()}catch(e){ctlSay('Join failed: '+e.message)}}
async function ctlLeave(){try{await ctlCall('/api/leave',{guildId:ctlGid()});ctlSay('Left voice');ctlLoad()}catch(e){ctlSay('Leave failed: '+e.message)}}
async function ctlPlay(){var q=document.getElementById('ctlQuery').value;if(!q){ctlSay('Enter a song first.');return}try{var j=await ctlCall('/api/play',{guildId:ctlGid(),query:q});ctlSay('Queued: '+j.title);document.getElementById('ctlQuery').value='';ctlRefresh()}catch(e){ctlSay('Play failed: '+e.message)}}
async function ctlDo(a){try{var j=await ctlCall('/api/ctl',{guildId:ctlGid(),action:a});ctlSay(a+': '+j.result);ctlRefresh()}catch(e){ctlSay(a+' failed: '+e.message)}}
async function ctlVolSet(){try{var j=await ctlCall('/api/volume',{guildId:ctlGid(),value:Number(document.getElementById('ctlVol').value)});ctlSay('Volume: '+j.result+'%');ctlRefresh()}catch(e){ctlSay('Volume failed: '+e.message)}}
async function ctlLoopSet(){try{var j=await ctlCall('/api/loop',{guildId:ctlGid(),mode:document.getElementById('ctlLoop').value});ctlSay('Loop: '+j.result);ctlRefresh()}catch(e){ctlSay('Loop failed: '+e.message)}}
function ctlEsc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
async function ctlRefresh(){var id=ctlGid();if(!id)return;try{var gs=await(await fetch('/api/guilds')).json();CTL_G=gs;var g=CTL_G.find(function(x){return x.id===id});if(!g)return;var h='<b>Now:</b> '+ctlEsc(g.nowPlaying?g.nowPlaying.title:'— idle —')+' · 🔊 '+g.volume+'% · 🔁 '+ctlEsc(g.loop)+' · '+ctlEsc(g.player);if(g.queue&&g.queue.length)h+='<br><b>Queue:</b> '+g.queue.map(function(x){return ctlEsc(x.title)}).join(' · ');document.getElementById('ctlNow').innerHTML=h;var v=document.getElementById('ctlVol');if(v&&document.activeElement!==v)v.value=g.volume;var l=document.getElementById('ctlLoop');if(l)l.value=g.loop}catch(e){}}
document.getElementById('ctlGuild').addEventListener('change',function(){ctlGuildChanged();ctlRefresh()});
if(window.AOS)AOS.init({once:true,duration:520,offset:22,disable:window.matchMedia('(prefers-reduced-motion: reduce)').matches});ctlLoad();setInterval(ctlRefresh,10000);
</script></body></html>`;
}

function dashPlayerPageTailwind() {
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bocchi · Web Player</title>'
  + '<script src="https://cdn.tailwindcss.com"></script><link href="https://unpkg.com/aos@2.3.4/dist/aos.css" rel="stylesheet">'
  + '<style>body{background-color:#090c10;background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);background-size:32px 32px}input:focus,select:focus{outline:2px solid #e8b34c;outline-offset:2px}</style></head><body class="min-h-screen text-zinc-100 antialiased">'
  + '<main class="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10"><header class="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5" data-aos="fade-down"><div class="flex items-center gap-3"><span class="grid h-10 w-10 place-items-center bg-amber-300 text-xl font-black text-zinc-950">♪</span><div><p class="text-sm font-semibold">Bocchi player</p><p class="font-mono text-[10px] text-zinc-500">LISTENING ROOM</p></div></div><div class="flex flex-wrap items-center gap-2"><a class="px-3 py-2 text-xs text-zinc-400 hover:text-amber-200" href="/dashboard">← Control desk</a><select id="srv" class="border border-white/10 bg-[#10151b] px-3 py-2 text-sm"></select><select id="chn" class="border border-white/10 bg-[#10151b] px-3 py-2 text-sm"></select><button class="border border-white/15 px-3 py-2 text-xs hover:border-amber-300" onclick="P.join()">Join voice</button><button class="border border-white/15 px-3 py-2 text-xs hover:border-rose-300" onclick="P.leave()">Leave</button></div></header>'
  + '<section class="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,.8fr)]" data-aos="fade-up"><div class="border border-white/10 bg-[#10151b] p-4 sm:p-6"><img id="cover" class="mb-5 hidden aspect-video w-full border border-white/10 object-cover" alt="Album art"><p class="font-mono text-[10px] uppercase text-amber-300">Now playing</p><h1 id="ttl" class="mt-2 break-words text-2xl font-semibold sm:text-3xl">— idle —</h1><p id="by" class="mt-2 text-sm text-zinc-400"></p>'
  + '<div id="lyrics-container" class="mt-6 h-56 overflow-y-auto scroll-smooth rounded bg-[#090c10] p-4 text-center font-medium leading-loose text-zinc-400 hidden shadow-inner border border-white/5"></div>'
  + '<div class="mt-6 flex flex-wrap items-center gap-2"><button class="h-11 w-12 border border-white/10 text-lg hover:border-amber-300" onclick="P.ctl(\'prev\')" title="Previous">⏮</button><button id="pp" class="h-11 w-12 bg-amber-300 text-lg text-zinc-950 hover:bg-amber-200" onclick="P.toggle()" title="Play or pause">▶</button><button class="h-11 w-12 border border-white/10 text-lg hover:border-amber-300" onclick="P.ctl(\'skip\')" title="Skip">⏭</button><button class="h-11 w-12 border border-rose-400/30 text-lg text-rose-300 hover:bg-rose-400/10" onclick="P.ctl(\'stop\')" title="Stop">■</button><button id="loopb" class="ml-auto border border-white/10 px-3 py-3 text-xs hover:border-amber-300" onclick="P.loop()">Loop · Off</button><button id="spdb" class="border border-white/10 px-3 py-3 text-xs hover:border-amber-300" onclick="P.speed()">1×</button></div>'
  + '<div class="mt-5 flex flex-wrap items-center gap-3 border-t border-white/5 pt-5"><label class="font-mono text-xs text-zinc-500" for="vol">VOLUME</label><input id="vol" class="min-w-32 flex-1 accent-amber-300" type="range" min="0" max="200" value="100"><button class="border border-white/10 px-3 py-2 text-xs hover:border-amber-300" onclick="P.vol()">Apply</button></div><div class="mt-5 flex gap-2"><input id="q2" type="text" placeholder="Search or paste a link" class="min-w-0 flex-1 border border-white/10 bg-[#090c10] px-3 py-3 text-sm placeholder:text-zinc-600"><button class="bg-amber-300 px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-amber-200" onclick="P.play()">Queue</button></div><p id="msg" class="mt-3 min-h-5 text-xs text-zinc-500"></p></div>'
  + '<aside class="border border-white/10 bg-[#10151b] p-4 sm:p-6" data-aos="fade-up" data-aos-delay="100"><div class="mb-4 flex items-end justify-between"><div><p class="font-mono text-[10px] uppercase text-zinc-500">Next tracks</p><h2 class="mt-1 text-lg font-semibold">Up next</h2></div><span class="text-amber-300">☷</span></div><ol id="q" class="divide-y divide-white/5 text-sm text-zinc-300"></ol></aside></section></main>'
  + '<script src="https://unpkg.com/aos@2.3.4/dist/aos.js"></script><script>'
  + 'var PG={g:[],id:"",snap:null,snapAt:0};'
  + 'function say(t){document.getElementById("msg").textContent=t;}'
  + 'function gid(){var s=document.getElementById("srv");return s&&s.value?s.value:"";}'
  + 'async function api(p,d){var r=await fetch(p,{method:d?"POST":"GET",headers:{"Content-Type":"application/json"},body:d?JSON.stringify(d):undefined});var j=null;try{j=await r.json();}catch(e){}if(!r.ok||(j&&j.error))throw new Error((j&&j.error)||("HTTP "+r.status));return j;}'
  + 'async function load(){try{var g=await(await fetch("/api/guilds")).json();PG.g=g;var s=document.getElementById("srv");var keep=s.value;s.innerHTML="";g.forEach(function(x){var o=document.createElement("option");o.value=x.id;o.textContent=x.name;if(x.id===keep)o.selected=true;s.appendChild(o);});if(!s.value&&g.length)s.value=g[0].id;chans();refresh();}catch(e){say("load failed: "+e.message);}}'
  + 'function cur(){var id=gid();for(var i=0;i<PG.g.length;i++)if(PG.g[i].id===id)return PG.g[i];return null;}'
  + 'function chans(){var g=cur();var c=document.getElementById("chn");c.innerHTML="";if(!g)return;(g.voice||[]).forEach(function(x){var o=document.createElement("option");o.value=x.id;o.textContent=x.name+" · "+x.members;if(g.botVC===x.id)o.selected=true;c.appendChild(o);});}'
  + 'var P={'
  + 'join:async function(){try{var j=await api("/api/join",{guildId:gid(),channelId:document.getElementById("chn").value});say("Joined "+j.channel);load();}catch(e){say("Join failed: "+e.message);}},'
  + 'leave:async function(){try{await api("/api/leave",{guildId:gid()});say("Left voice");load();}catch(e){say(e.message);}},'
  + 'play:async function(){var q=document.getElementById("q2").value;if(!q){say("Enter a song first.");return;}try{var j=await api("/api/play",{guildId:gid(),query:q});say("Queued: "+j.title);document.getElementById("q2").value="";refresh();}catch(e){say("Queue failed: "+e.message);}},'
  + 'ctl:async function(a){try{var j=await api("/api/ctl",{guildId:gid(),action:a});say(j.result);refresh();}catch(e){say(e.message);}},'
  + 'toggle:async function(){var g=cur();var paused=g&&g.player==="paused";try{var j=await api("/api/ctl",{guildId:gid(),action:paused?"resume":"pause"});say(j.result);refresh();}catch(e){say(e.message);}},'
  + 'loop:async function(){var g=cur();var nx=g&&g.loop==="off"?"track":(g&&g.loop==="track"?"queue":"off");try{await api("/api/loop",{guildId:gid(),mode:nx});refresh();}catch(e){say(e.message);}},'
  + 'speed:async function(){var g=cur();var speed=(g&&g.nowPlaying&&g.nowPlaying.speed)||1;try{var j=await api("/api/ctl",{guildId:gid(),action:"speed",value:speed===2?1:2});say("Speed "+j.result+"×");refresh();}catch(e){say(e.message);}},'
  + 'vol:async function(){try{var j=await api("/api/volume",{guildId:gid(),value:Number(document.getElementById("vol").value)});say("Volume "+j.result+"%");refresh();}catch(e){say(e.message);}}'
  + '};'
  + 'async function refresh(){if(!gid())return;try{PG.g=await(await fetch("/api/guilds")).json();PG.snap=cur();PG.snapAt=Date.now();paint();}catch(e){}}'
  + 'function paint(){var g=PG.snap;if(!g)return;var n=g.nowPlaying;document.getElementById("ttl").textContent=n?n.title:"— idle —";document.getElementById("by").textContent=n?"Requested by "+n.by:"Choose a server and queue a track.";var c=document.getElementById("cover");if(n&&n.thumb){c.classList.remove("hidden");c.src=n.thumb;}else{c.classList.add("hidden");c.removeAttribute("src");}'
  + 'var lc=document.getElementById("lyrics-container");if(n&&n.lyrics&&n.lyrics.synced&&n.lyrics.synced.length){lc.classList.remove("hidden");if(lc.dataset.title!==n.title){lc.innerHTML="";lc.dataset.title=n.title;n.lyrics.synced.forEach(function(l){var p=document.createElement("p");p.className="lyric-line transition-all duration-300";p.dataset.time=l.time;p.textContent=l.text||"♪";lc.appendChild(p);});}var sp=n.speed||1;var base=n.posBase||0;var t0=n.startedAt||PG.snapAt;var el=base+Math.max(0,(Date.now()-t0)/1000)*sp;var lines=Array.from(lc.children);var aIdx=-1;for(var i=0;i<lines.length;i++){if(parseFloat(lines[i].dataset.time)<=el)aIdx=i;else break;}lines.forEach(function(p,i){if(i===aIdx){if(!p.classList.contains("active")){p.classList.add("active");p.style.color="#fcd34d";p.style.transform="scale(1.1)";lc.scrollTop=p.offsetTop-lc.offsetTop-(lc.clientHeight/2)+(p.clientHeight/2);}}else{p.classList.remove("active");p.style.color="";p.style.transform="";}});}else{lc.classList.add("hidden");lc.dataset.title="";}'
  + 'document.getElementById("pp").textContent=g.player==="paused"?"▶":"Ⅱ";document.getElementById("loopb").textContent="Loop · "+g.loop;document.getElementById("spdb").textContent=((n&&n.speed)||1)+"×";var v=document.getElementById("vol");if(document.activeElement!==v)v.value=g.volume;var q=document.getElementById("q");q.innerHTML="";(g.queue||[]).forEach(function(x){var li=document.createElement("li");li.className="flex gap-3 py-3";var index=document.createElement("span");index.className="font-mono text-xs text-amber-300";index.textContent=String(q.children.length+1).padStart(2,"0");var title=document.createElement("span");title.className="min-w-0 truncate";title.textContent=x.title||"";li.appendChild(index);li.appendChild(title);q.appendChild(li);});if(!q.children.length){var empty=document.createElement("li");empty.className="py-4 text-sm text-zinc-500";empty.textContent="Queue is empty";q.appendChild(empty);}}'
  + 'document.getElementById("srv").addEventListener("change",function(){chans();refresh();});if(window.AOS)AOS.init({once:true,duration:520,offset:22,disable:window.matchMedia("(prefers-reduced-motion: reduce)").matches});setInterval(refresh,5000);setInterval(paint,500);load();'
  + '</script></body></html>';
}

function dashPlayerPage() {
  return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Music Bot — Web Player</title>'
  + '<style>body{font-family:system-ui;background:#0b1020;color:#e2e8f0;margin:0;padding:20px}.wrap{max-width:720px;margin:0 auto}.top{display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap}a{color:#93c5fd}select,input[type=text]{padding:8px;border-radius:8px;border:1px solid #334155;background:#020617;color:#e2e8f0}.card{background:#141b31;border:1px solid #263154;padding:18px;border-radius:14px;margin:12px 0}.cover{width:100%;max-height:340px;object-fit:cover;border-radius:10px;background:#000;display:none}#ttl{font-size:20px;font-weight:800;margin:12px 0 2px}#by{color:#94a3b8;font-size:13px}#barwrap{margin:14px 0 4px;cursor:pointer}#bar{height:8px;background:#263154;border-radius:99px;position:relative}#fill{height:100%;width:0%;background:#5865F2;border-radius:99px}#knob{width:14px;height:14px;background:#fff;border-radius:99px;position:absolute;top:-3px;left:0%}#times{display:flex;justify-content:space-between;font-size:12px;color:#94a3b8}.row{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;align-items:center}button{padding:10px 16px;border:0;border-radius:10px;background:#5865F2;color:#fff;font-weight:700;cursor:pointer;font-size:15px}.ghost{background:#334155}.danger{background:#b91c1c}.vol{display:flex;gap:8px;align-items:center}input[type=range]{width:140px}#q{margin:8px 0 0;padding-left:20px;font-size:14px}#msg{color:#94a3b8;font-size:13px;min-height:18px}</style></head><body><div class="wrap">'
  + '<div class="top"><a href="/dashboard">← Dashboard</a><select id="srv"></select><select id="chn"></select><button class="ghost" onclick="P.join()">Join</button><button class="ghost" onclick="P.leave()">Leave</button></div>'
  + '<div class="card"><img id="cover" class="cover" alt=""><div id="ttl">— idle —</div><div id="by"></div>'
  + '<div id="lyrics-container" style="display:none; height:220px; overflow-y:auto; scroll-behavior:smooth; margin:16px 0; padding:12px; background:#020617; border-radius:8px; border:1px solid #334155; text-align:center; color:#94a3b8; font-size:15px; line-height:1.8;"></div>'
  + '<div id="barwrap" onclick="P.seek(event)"><div id="bar"><div id="fill"></div><div id="knob"></div></div></div>'
  + '<div id="times"><span id="tcur">0:00</span><span id="ttot">• LIVE</span></div>'
  + '<div class="row"><button onclick="P.ctl(\'prev\')">⏮</button><button id="pp" onclick="P.toggle()">▶</button><button onclick="P.ctl(\'skip\')">⏭</button><button class="danger" onclick="P.ctl(\'stop\')">⏹</button><button class="ghost" id="loopb" onclick="P.loop()">🔁 off</button><button class="ghost" id="spdb" onclick="P.speed()">1x</button></div>'
  + '<div class="row vol"><span>🔊</span><input id="vol" type="range" min="0" max="200" value="100"><button class="ghost" onclick="P.vol()">Set</button></div>'
  + '<div class="row"><input id="q2" type="text" placeholder="song name or URL" style="flex:1;min-width:200px"><button onclick="P.play()">+ Queue</button></div>'
  + '<div id="msg"></div></div>'
  + '<div class="card"><h3 style="margin:0 0 8px">📋 Up next</h3><ol id="q"></ol></div>'
  + '</div><script>'
  + 'var PG={g:[],id:"",snap:null,snapAt:0};'
  + 'function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}'
  + 'function say(t){document.getElementById("msg").textContent=t;}'
  + 'function gid(){var s=document.getElementById("srv");return s&&s.value?s.value:"";}'
  + 'function fmt(s){if(s==null||!isFinite(s)||s<0)return"• LIVE";s=Math.floor(s);var m=Math.floor(s/60);s=s%60;return m+":"+(s<10?"0":"")+s;}'
  + 'async function api(p,d){var r=await fetch(p,{method:d?"POST":"GET",headers:{"Content-Type":"application/json"},body:d?JSON.stringify(d):undefined});var j=null;try{j=await r.json();}catch(e){}if(!r.ok||(j&&j.error))throw new Error((j&&j.error)||("HTTP "+r.status));return j;}'
  + 'async function load(){try{var g=await(await fetch("/api/guilds")).json();PG.g=g;var s=document.getElementById("srv");var keep=s.value;s.innerHTML="";g.forEach(function(x){var o=document.createElement("option");o.value=x.id;o.textContent=x.name;if(x.id===keep)o.selected=true;s.appendChild(o);});if(!s.value&&g.length)s.value=g[0].id;chans();refresh();}catch(e){say("load failed: "+e.message);}}'
  + 'function cur(){var id=gid();for(var i=0;i<PG.g.length;i++)if(PG.g[i].id===id)return PG.g[i];return null;}'
  + 'function chans(){var g=cur();var c=document.getElementById("chn");c.innerHTML="";if(!g)return;(g.voice||[]).forEach(function(x){var o=document.createElement("option");o.value=x.id;o.textContent=x.name+" ("+x.members+")";if(g.botVC===x.id)o.selected=true;c.appendChild(o);});}'
  + 'var P={'
  + 'join:async function(){try{var j=await api("/api/join",{guildId:gid(),channelId:document.getElementById("chn").value});say("joined "+j.channel);load();}catch(e){say("join failed: "+e.message);}},'
  + 'leave:async function(){try{await api("/api/leave",{guildId:gid()});say("left");load();}catch(e){say(e.message);}},'
  + 'play:async function(){var q=document.getElementById("q2").value;if(!q){say("type a song first");return;}try{var j=await api("/api/play",{guildId:gid(),query:q});say("queued: "+j.title);document.getElementById("q2").value="";refresh();}catch(e){say("play failed: "+e.message);}},'
  + 'ctl:async function(a){try{var j=await api("/api/ctl",{guildId:gid(),action:a});say(a+": "+j.result);refresh();}catch(e){say(e.message);}},'
  + 'toggle:async function(){var g=cur();var paused=g&&g.player==="paused";try{var j=await api("/api/ctl",{guildId:gid(),action:paused?"resume":"pause"});say(j.result);refresh();}catch(e){say(e.message);}},'
  + 'loop:async function(){var g=cur();var nx=g&&g.loop==="off"?"track":(g&&g.loop==="track"?"queue":"off");try{await api("/api/loop",{guildId:gid(),mode:nx});refresh();}catch(e){say(e.message);}},'
  + 'speed:async function(){var g=cur();var curSpd=(g&&g.nowPlaying&&g.nowPlaying.speed)||1;var v=(curSpd===2)?1:2;try{var j=await api("/api/ctl",{guildId:gid(),action:"speed",value:v});say("speed "+j.result+"x");refresh();}catch(e){say(e.message);}},'
  + 'vol:async function(){try{var j=await api("/api/volume",{guildId:gid(),value:Number(document.getElementById("vol").value)});say("volume "+j.result);refresh();}catch(e){say(e.message);}},'
  + 'seek:async function(ev){var g=cur();if(!g||!g.nowPlaying||!g.nowPlaying.durationSec){say("live stream — cannot seek");return;}var r=document.getElementById("bar").getBoundingClientRect();var ratio=(ev.clientX-r.left)/r.width;ratio=Math.max(0,Math.min(1,ratio));var sec=Math.floor(ratio*g.nowPlaying.durationSec);try{await api("/api/seek",{guildId:gid(),seconds:sec});say("seek → "+fmt(sec));refresh();}catch(e){say(e.message);}}'
  + '};'
  + 'async function refresh(){var id=gid();if(!id)return;try{var gs=await(await fetch("/api/guilds")).json();PG.g=gs;var g=cur();if(!g)return;PG.snap=g;PG.snapAt=Date.now();paint();}catch(e){}}'
  + 'function paint(){var g=PG.snap;if(!g)return;var np=g.nowPlaying;document.getElementById("ttl").textContent=np?np.title:"— idle —";document.getElementById("by").textContent=np?("by "+np.by):"";var cv=document.getElementById("cover");if(np&&np.thumb){cv.style.display="block";if(cv.src!==np.thumb)cv.src=np.thumb;}else{cv.style.display="none";cv.removeAttribute("src");}'
  + 'var lc=document.getElementById("lyrics-container");if(np&&np.lyrics&&np.lyrics.synced&&np.lyrics.synced.length){lc.style.display="block";if(lc.dataset.title!==np.title){lc.innerHTML="";lc.dataset.title=np.title;np.lyrics.synced.forEach(function(l){var p=document.createElement("p");p.style.transition="all 0.3s";p.dataset.time=l.time;p.textContent=l.text||"♪";lc.appendChild(p);});}var sp=np.speed||1;var base=np.posBase||0;var t0=np.startedAt||PG.snapAt;var el=base+Math.max(0,(Date.now()-t0)/1000)*sp;var lines=Array.from(lc.children);var aIdx=-1;for(var i=0;i<lines.length;i++){if(parseFloat(lines[i].dataset.time)<=el)aIdx=i;else break;}lines.forEach(function(p,i){if(i===aIdx){if(p.dataset.active!=="1"){p.dataset.active="1";p.style.color="#fcd34d";p.style.transform="scale(1.1)";p.style.fontWeight="bold";lc.scrollTop=p.offsetTop-lc.offsetTop-(lc.clientHeight/2)+(p.clientHeight/2);}}else{p.dataset.active="0";p.style.color="";p.style.transform="";p.style.fontWeight="";}});}else{lc.style.display="none";lc.dataset.title="";}'
  + 'var dur=np&&np.durationSec?np.durationSec:null;var sp=(np&&np.speed)||1;var base=(np&&np.posBase)||0;var t0=(np&&np.startedAt)||PG.snapAt;var el=base+Math.max(0,(Date.now()-t0)/1000)*sp;'
  + 'document.getElementById("tcur").textContent=fmt(el);document.getElementById("ttot").textContent=dur?fmt(dur):"• LIVE";'
  + 'var pct=dur?Math.max(0,Math.min(100,el/dur*100)):0;document.getElementById("fill").style.width=pct+"%";document.getElementById("knob").style.left=pct+"%";'
  + 'document.getElementById("pp").textContent=(g.player==="paused")?"▶":"⏸";'
  + 'document.getElementById("loopb").textContent="🔁 "+g.loop;document.getElementById("spdb").textContent=(np&&np.speed===2)?"2x":"1x";'
  + 'var v=document.getElementById("vol");if(v&&document.activeElement!==v)v.value=g.volume;'
  + 'var q=document.getElementById("q");q.innerHTML="";(g.queue||[]).forEach(function(x){var li=document.createElement("li");li.textContent=x.title;q.appendChild(li);});if(!(g.queue||[]).length){var li=document.createElement("li");li.textContent="— empty —";q.appendChild(li);}}'
  + 'document.getElementById("srv").addEventListener("change",function(){chans();refresh();});'
  + 'setInterval(refresh,5000);setInterval(paint,500);load();'
  + '</scr' + 'ipt></body></html>';
}

module.exports = {
  dashLoginPage,
  sharedDashCss,
  dashPage,
  dashPageTailwind,
  dashPlayerPageTailwind,
  dashPlayerPage
};
