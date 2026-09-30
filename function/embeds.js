const { fmtTime, loopLabel } = require('./utils.js');
const { EmbedBuilder } = require('discord.js');

const COLORS = {
  success: 0x2e8b57,
  error: 0xff4500,
  info: 0x5865F2,
  music: 0x9370DB,
  queue: 0x4682B4,
};

function makeEmbed(color = COLORS.primary) {
  return new EmbedBuilder().setColor(color).setTimestamp();
}

function successEmbed(title, description) {
  return makeEmbed(COLORS.success)
    .setDescription(`### ${title}\n${description ? `${description}` : ""}`);
}

function errorEmbed(description) {
  return makeEmbed(COLORS.error)
    .setDescription(`### ❌ Error\n${description}`);
}

function infoEmbed(title, description) {
  return makeEmbed(COLORS.info)
    .setDescription(`### ${title}\n${description ? `${description}` : ""}`);
}

function musicEmbed(title, description) {
  return makeEmbed(COLORS.music)
    .setDescription(`### ${title}\n${description ? `${description}` : ""}`);
}

function buildNowPlayingEmbed(state, lyrics) {
  const cur = state.current;
  const dur = cur?.durationSec;
  const scrollingTitle = marqueeText(cleanTitle(cur?.title, 180), playbackSeconds(state));
  const e = makeEmbed(COLORS.music)
    .setTitle("🎶 Now Playing")
    .setDescription(`**${scrollingTitle}**${Number.isFinite(dur) && dur > 0 ? ` — ${fmtTime(dur)}` : ""}\n${progressLine(state)}`)
    .addFields(
      { name: "👤 Requested by", value: `${cur?.requestedBy || "—"}`, inline: true },
      { name: "🔊 Volume", value: `${state.volumePct}%`, inline: true },
      { name: "🔁 Loop", value: loopLabel(state.loopMode), inline: true },
    )
    .setFooter({ text: `Speed ${Number(state.speed) || 1}x · Use the controls below` })
    .setTimestamp();
  if (cur?.source && isUrl(cur.source)) e.setURL(cur.source);
  const t = cur ? (cur.thumb || thumbFor(cur.source)) : null;
  if (t) e.setThumbnail(t);
  if (lyrics && lyrics.text) {
    let synced = Array.isArray(lyrics.synced) ? lyrics.synced : [];
    let estimated = false;
    if (!synced.length && Number.isFinite(dur) && dur > 30 && !/^🎵/.test(lyrics.text)) {
      synced = estimateSyncedLyrics(lyrics.text, dur);
      estimated = synced.length > 0;
    }
    if (state.showLyrics !== false && synced.length) {
      e.addFields(karaokeField(state, { ...lyrics, synced }, estimated));
    } else {
      const lines = lyrics.text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      let preview = lines.slice(0, 4).join("\n");
      if (preview.length > 280) preview = preview.slice(0, 277).trimEnd() + "...";
      else if (lines.length > 4) preview += "\n…";
      e.addFields({ name: `📝 Lyrics preview${lyrics.artist ? ` · ${lyrics.artist}` : ""}`, value: preview, inline: false });
    }
  }
  return e;
}

function buildHelpEmbedSlash() {
  return new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle("🎵 Music Bot — User Guide")
    .setDescription("> Just use **Slash** `/` commands\n> Supports **YouTube · SoundCloud · TikTok · Spotify** (track)")
    .addFields(
      {
        name: "╔══════════════════════════╗",
        value: "** **",
        inline: false,
      },
      {
        name: "🎶 Play & queue",
        value: [
          "`/play query:<name/URL>` — Play or queue a song",
          "`/playlist query:<URL/search> limit:<N>` — Load songs in bulk",
          "`/queue` — Show the full queue",
          "`/np` — Currently playing song",
          "`/remove index:<number>` — Remove from queue",
          "`/shuffle` — Shuffle the queue",
        ].join("\n"),
        inline: false,
      },
      {
        name: "⏯️ Playback",
        value: [
          "`/skip` — Skip the current song",
          "`/pause` — Pause",
          "`/resume` — Resume",
          "`/stop` — Stop and clear the whole queue",
        ].join("\n"),
        inline: true,
      },
      {
        name: "🔊 Volume & loop",
        value: [
          "`/volume value:<0-10000>` — Adjust the volume",
          "`/loop mode:off` — Loop off",
          "`/loop mode:track` — Loop the current track",
          "`/loop mode:queue` — Loop the whole queue",
        ].join("\n"),
        inline: true,
      },
      {
        name: "⚙️ System",
        value: [
          "`/ping` — Check latency",
          "`/ai question:<text>` — Ask Gemini a question",
          "`/airef` — Set this chat's AI persona (omit persona to use Ref/Ai_Tsun.txt)",
          "`/setaip` — Open a private AI chat",
          "`/delete` — Delete your private AI chat",
          "`/deletep confirm:true` — Delete all messages in public AI chat (Manage Messages)",
          "`/clear` — Clear this server's AI history (Manage Channels)",
          "`/setai` — Create a public AI chat channel (Manage Channels)",
          "`/setup` — Create or reuse the music control room (Manage Server)",
          "`/botupdate` — Update yt-dlp",
          "`/help` — Show this guide",
        ].join("\n"),
        inline: false,
      },
      {
        name: "╚══════════════════════════╝",
        value: "** **",
        inline: false,
      },
    )
    .setFooter({ text: "💡 Tip: prefix commands via /help are faster!" })
    .setTimestamp();
}

module.exports = {
  COLORS,
  makeEmbed,
  successEmbed,
  errorEmbed,
  infoEmbed,
  musicEmbed,
  buildNowPlayingEmbed,
  buildHelpEmbedSlash
};

