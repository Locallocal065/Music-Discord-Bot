const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { makeEmbed, COLORS } = require('./embeds.js');

function buildTransportRows(state = null) {
  const paused = state?.player?.state?.status === AudioPlayerStatus.Paused;
  const r1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("mus_prev").setLabel("Prev").setEmoji("⏮").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("mus_resume").setLabel(paused ? "Play" : "Pause").setEmoji(paused ? "▶" : "⏸").setStyle(paused ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("mus_skip").setLabel("Skip").setEmoji("⏭").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("mus_stop").setLabel("Stop").setEmoji("⏹").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("mus_queue").setLabel("List").setEmoji("📋").setStyle(ButtonStyle.Secondary),
  );
  const lyricsOn = state ? state.showLyrics !== false : true;
  const r2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("mus_loop").setLabel(`Loop: ${state ? loopLabel(state.loopMode).replace(/^[^\s]+\s/, "") : "Off"}`).setEmoji("🔁").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("mus_speed").setLabel(`Speed: ${state && Number(state.speed) ? state.speed : 1}x`).setEmoji("⏩").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("mus_lyrics").setLabel(`Lyrics: ${lyricsOn ? "On" : "Off"}`).setEmoji("📝").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("mus_volup").setLabel("Vol +").setEmoji("🔊").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("mus_voldown").setLabel("Vol −").setEmoji("🔉").setStyle(ButtonStyle.Secondary),
  );
  return [r1, r2];
}

function buildSettingsRow(state = null) {
  const shown = !state || state.showControls !== false;
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("mus_controls").setLabel(`Controls: ${shown ? "Show" : "Hidden"}`).setEmoji("🎛").setStyle(ButtonStyle.Secondary),
  );
  if (!isBocchiSetup(state)) {
    row.addComponents(new ButtonBuilder().setCustomId("mus_setup").setLabel("/setup").setEmoji("🛠").setStyle(ButtonStyle.Secondary));
  }
  return row;
}

function buildControlRows(state = null) {
  const rows = [];
  const [r1, r2] = buildTransportRows(state);
  rows.push(r1);
  if (!state || state.showControls !== false) rows.push(r2);
  rows.push(buildSettingsRow(state));
  return rows;
}

function buildPanelEmbed(guild) {
  const st = getGuildState(guild);
  const cur = st.current ? `**${st.current.title}**\n👤 ${st.current.requestedBy}` : "— idle —\nuse `/play` or `/play` to add songs";
  const next = st.queue.slice(0, 3).map((x, i) => `\`${i + 1}.\` ${x.title}`).join("\n") || "—";
  const ck = ytCookiesStatus();
  const room = getSavedControlChannel(guild.id) ? `<#${getSavedControlChannel(guild.id)}>` : "#bocchi (auto)";
  const panel = new EmbedBuilder().setColor(0x5865F2).setTitle("🎛 Music Panel — Settings")
    .setDescription("Press the buttons — you must share a voice channel with the bot\nAll bot messages live in " + room)
    .addFields(
      { name: "🎵 Now", value: cur, inline: false },
      { name: "📋 Next", value: next, inline: false },
      { name: "🔊 Volume", value: `${st.volumePct}%`, inline: true },
      { name: "🔁 Loop", value: loopLabel(st.loopMode), inline: true },
      { name: "⏩ Speed", value: `${Number(st.speed) || 1}x`, inline: true },
      { name: "📝 Lyrics", value: st.showLyrics !== false ? "On" : "Off", inline: true },
      { name: "🎛 Controls", value: st.showControls !== false ? "Show" : "Hidden", inline: true },
      { name: " Room", value: room, inline: true },
      { name: "🍪 YouTube", value: ck.exists ? `✅ signed in (${ck.size}b)` : "❌ not signed — admin, use `/ytsignin`", inline: true },
    ).setTimestamp();
  const pt = st.current ? (st.current.thumb || thumbFor(st.current.source)) : null;
  if (pt) panel.setThumbnail(pt);
  return panel;
}

function buildVideoRows(videoId, pageUrl) {
  const row = new ActionRowBuilder();
  if (videoId) {
    row.addComponents(new ButtonBuilder().setLabel("▶ Watch on YouTube").setStyle(ButtonStyle.Link).setURL(`https://www.youtube.com/watch?v=${videoId}`));
    if (pageUrl) row.addComponents(new ButtonBuilder().setLabel("🖥 Open video page").setStyle(ButtonStyle.Link).setURL(pageUrl));
  } else if (pageUrl) {
    // TikTok / SoundCloud / others: no embed page, just the source link.
    row.addComponents(new ButtonBuilder().setLabel("🔗 Open link").setStyle(ButtonStyle.Link).setURL(pageUrl));
  }
  return row.components.length ? [row] : [];
}

module.exports = {
  buildTransportRows,
  buildSettingsRow,
  buildControlRows,
  buildPanelEmbed,
  buildVideoRows
};
