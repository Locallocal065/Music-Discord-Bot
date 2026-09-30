const fs = require('fs');
const path = require('path');
const { fetchJsonWithTimeout } = require('./metadata.js');
const { writeLog, logPretty, nowStr } = require('./utils.js');

const aiHistoryPath = path.join(process.cwd(), 'Ai_History');
const aiPersonasPath = path.join(aiHistoryPath, 'personas.json');
function aiSystemInstruction(persona = "") {
  const identity = "Your name is Bocchi (ぼっち). You are the AI assistant in this Discord music bot. If asked your name, say Bocchi (ぼっち).";
  return persona ? `${identity}\n\nChat-specific persona:\n${persona}` : identity;
}

async function askOpenRouter(question, history = [], persona = "") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const messages = [{ role: "system", content: aiSystemInstruction(persona) }];
    for (const entry of history) {
      const content = Array.isArray(entry?.parts) ? entry.parts.map((part) => part?.text || "").join("") : "";
      if (content) messages.push({ role: entry.role === "model" ? "assistant" : "user", content });
    }
    messages.push({ role: "user", content: question });
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${config.openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://discord.com",
        "X-Title": "Discord Music Bot",
      },
      body: JSON.stringify({ model: config.openRouterModel, messages, max_tokens: 1024 }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const detail = data?.error?.message;
      throw new Error(`OpenRouter request failed (HTTP ${response.status})${detail ? `: ${String(detail).slice(0, 500)}` : ""}`);
    }
    const answer = data?.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || !answer.trim()) throw new Error("OpenRouter returned no answer.");
    const text = answer.trim();
    return text.length > 1900 ? text.slice(0, 1897) + "..." : text;
  } finally {
    clearTimeout(timeout);
  }
}

async function askGemini(question, history = [], persona = "") {
  if (!config.geminiApiKey) return askOpenRouter(question, history, persona);
  if (Date.now() < geminiQuotaCooldownUntil) {
    if (config.openRouterApiKey) return askOpenRouter(question, history, persona);
    throw new Error("Gemini quota limit reached. Please try again after the cooldown.");
  }
  const models = ["gemini-3.8-flash", "gemini-3.5-flash-lite"];
  let geminiError = null;
  for (let i = 0; i < models.length; i++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${models[i]}:generateContent`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": config.geminiApiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: aiSystemInstruction(persona) }] },
          contents: [...history, { role: "user", parts: [{ text: question }] }],
          generationConfig: { maxOutputTokens: 1024 },
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const detail = data?.error?.message;
        const error = new Error(`Gemini request failed (HTTP ${response.status})${detail ? `: ${detail.slice(0, 500)}` : ""}`);
        error.status = response.status;
        throw error;
      }
      const answer = data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim();
      if (!answer) throw new Error("Gemini returned no answer. Try rephrasing your question.");
      return answer.length > 1900 ? answer.slice(0, 1897) + "..." : answer;
    } catch (error) {
      geminiError = error;
      if (error?.status === 429) {
        geminiQuotaCooldownUntil = Date.now() + GEMINI_QUOTA_COOLDOWN_MS;
        logPretty("WARN", "Gemini returned HTTP 429; pausing Gemini requests for 15 minutes");
        break;
      }
      if (i === 0 && [500, 502, 503, 504].includes(error?.status)) {
        logPretty("WARN", `Gemini ${models[i]} unavailable (HTTP ${error.status}); trying ${models[i + 1]}`);
        continue;
      }
      break;
    } finally {
      clearTimeout(timeout);
    }
  }
  if (config.openRouterApiKey) {
    logPretty("WARN", `Gemini unavailable; falling back to OpenRouter (${config.openRouterModel})`);
    return askOpenRouter(question, history, persona);
  }
  throw geminiError || new Error("Gemini request failed. Please try again later.");
}

function loadAiHistories() {
  try {
    const data = JSON.parse(fs.readFileSync(aiHistoryPath(), "utf8"));
    return data && typeof data === "object" && !Array.isArray(data) ? data : {};
  } catch { return {}; }
}

function loadAiPersonas() {
  try {
    const data = JSON.parse(fs.readFileSync(aiPersonasPath(), "utf8"));
    return data && typeof data === "object" && !Array.isArray(data) ? data : {};
  } catch { return {}; }
}

function saveAiPersonas(personas) {
  try {
    fs.mkdirSync(config.dataDir, { recursive: true });
    fs.writeFileSync(aiPersonasPath(), JSON.stringify(personas), "utf8");
  } catch (error) {
    logPretty("WARN", "Could not persist AI chat personas: " + (error?.message || error));
  }
}

function getAiPersona(sessionKey) {
  const persona = loadAiPersonas()[sessionKey];
  return typeof persona === "string" ? persona : "";
}

function setAiPersona(sessionKey, persona) {
  const personas = loadAiPersonas();
  if (persona) personas[sessionKey] = persona;
  else delete personas[sessionKey];
  saveAiPersonas(personas);
}

function saveAiHistories(histories) {
  try {
    fs.mkdirSync(config.dataDir, { recursive: true });
    fs.writeFileSync(aiHistoryPath(), JSON.stringify(histories), "utf8");
  } catch (error) {
    logPretty("WARN", "Could not persist AI chat history: " + (error?.message || error));
  }
}

async function askGeminiWithHistory(question, sessionKey) {
  const histories = loadAiHistories();
  const previous = Array.isArray(histories[sessionKey])
    ? histories[sessionKey].filter((entry) =>
      ["user", "model"].includes(entry?.role) && Array.isArray(entry.parts) && entry.parts.every((part) => typeof part?.text === "string"))
    : [];
  const answer = await askGemini(question, previous, getAiPersona(sessionKey));
  histories[sessionKey] = [...previous, { role: "user", parts: [{ text: question }] }, { role: "model", parts: [{ text: answer }] }].slice(-20);
  saveAiHistories(histories);
  return answer;
}

async function clearGuildAiChats(guildId) {
  const histories = loadAiHistories();
  let clearedHistories = 0;
  for (const key of Object.keys(histories)) {
    if (key === `slash:${guildId}` || key.startsWith(`slash:${guildId}:`) || key.startsWith(`channel:${guildId}:`)) {
      delete histories[key];
      clearedHistories++;
    }
  }
  saveAiHistories(histories);
  const personas = loadAiPersonas();
  for (const key of Object.keys(personas)) {
    if (key === `slash:${guildId}` || key.startsWith(`slash:${guildId}:`) || key.startsWith(`channel:${guildId}:`) || key.startsWith(`private:${guildId}:`)) delete personas[key];
  }
  saveAiPersonas(personas);

  let closedPrivateChats = 0;
  for (const [threadId, session] of privateAiSessions) {
    if (session.guildId !== guildId) continue;
    privateAiSessions.delete(threadId);
    aiChatBusy.delete(`private:${threadId}`);
    try { await session.thread.delete("AI chats cleared by a server admin"); } catch { }
    closedPrivateChats++;
  }
  return { clearedHistories, closedPrivateChats };
}

module.exports = {
  aiSystemInstruction,
  askOpenRouter,
  askGemini,
  loadAiHistories,
  loadAiPersonas,
  saveAiPersonas,
  getAiPersona,
  setAiPersona,
  saveAiHistories,
  askGeminiWithHistory,
  clearGuildAiChats
};
