// vite.config.ts
import { defineConfig } from "file:///C:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/node_modules/@vitejs/plugin-react-swc/index.js";
import path2 from "path";
import { componentTagger } from "file:///C:/Users/mezat/Desktop/Famillle/Eric/Projet%20MDIV%20Business/Mdiv%20Business/Site%20web/MDIV_Business/node_modules/lovable-tagger/dist/index.js";

// vite-dev-api.ts
import fs from "fs";
import path from "path";
function getEnvVar(key) {
  if (process.env[key]) return process.env[key];
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const [k, ...v] = trimmed.split("=");
        if (k.trim() === key) return v.join("=").trim();
      }
    }
  } catch {
  }
  return "";
}
var GROQ_API_KEY = getEnvVar("GROQ_API_KEY");
var OPENAI_API_KEY = getEnvVar("OPENAI_API_KEY");
var MISTRAL_API_KEY = getEnvVar("MISTRAL_API_KEY");
var APP_MODE = getEnvVar("APP_MODE") || "live";
var GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
var OPENAI_URL = "https://api.openai.com/v1/chat/completions";
var MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";
var DEV_DB_PATH = path.resolve(process.cwd(), "dev_db.json");
function loadDevDb() {
  try {
    if (fs.existsSync(DEV_DB_PATH)) {
      return JSON.parse(fs.readFileSync(DEV_DB_PATH, "utf-8"));
    }
  } catch {
  }
  return {
    clients: [],
    invoices: [],
    quotes: [],
    followups: [],
    aiSettings: {
      primaryProvider: "groq",
      groqModel: "qwen/qwen3.8-27b",
      openaiModel: "gpt-4o-mini",
      mistralModel: "mistral-small-latest",
      temperature: 0.7,
      fallbackEnabled: true
    }
  };
}
function saveDevDb(data) {
  try {
    fs.writeFileSync(DEV_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch {
  }
}
async function callGroqProvider(messages, jsonMode, model = "qwen/qwen3.8-27b", temperature = 0.7) {
  if (!GROQ_API_KEY) throw new Error("Cl\xE9 GROQ_API_KEY non configur\xE9e");
  const body = { model, messages, temperature };
  if (jsonMode) body.response_format = { type: "json_object" };
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const errTxt = await res.text();
    throw new Error(`Groq (${res.status}): ${errTxt.slice(0, 150)}`);
  }
  return await res.json();
}
async function callOpenAIProvider(messages, jsonMode, model = "gpt-4o-mini", temperature = 0.7) {
  if (!OPENAI_API_KEY) throw new Error("Cl\xE9 OPENAI_API_KEY non configur\xE9e");
  const body = { model, messages, temperature };
  if (jsonMode) body.response_format = { type: "json_object" };
  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const errTxt = await res.text();
    throw new Error(`OpenAI (${res.status}): ${errTxt.slice(0, 150)}`);
  }
  return await res.json();
}
async function callMistralProvider(messages, jsonMode, model = "mistral-small-latest", temperature = 0.7) {
  if (!MISTRAL_API_KEY) throw new Error("Cl\xE9 MISTRAL_API_KEY non configur\xE9e");
  const body = { model, messages, temperature };
  if (jsonMode) body.response_format = { type: "json_object" };
  const res = await fetch(MISTRAL_URL, {
    method: "POST",
    headers: { "Authorization": `Bearer ${MISTRAL_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const errTxt = await res.text();
    throw new Error(`Mistral (${res.status}): ${errTxt.slice(0, 150)}`);
  }
  return await res.json();
}
async function callLLM(messages, jsonMode = false) {
  const db = loadDevDb();
  const settings = db.aiSettings || {
    primaryProvider: "groq",
    groqModel: "qwen/qwen3.8-27b",
    openaiModel: "gpt-4o-mini",
    mistralModel: "mistral-small-latest",
    temperature: 0.7,
    fallbackEnabled: true
  };
  const primary = settings.primaryProvider || "groq";
  const fallback = settings.fallbackEnabled !== false;
  const sequence = [];
  if (primary === "openai") {
    sequence.push("openai");
    if (fallback) sequence.push("groq", "mistral");
  } else if (primary === "mistral") {
    sequence.push("mistral");
    if (fallback) sequence.push("groq", "openai");
  } else if (primary === "groq") {
    sequence.push("groq");
    if (fallback) sequence.push("openai", "mistral");
  } else {
    sequence.push("groq", "openai", "mistral");
  }
  const errors = [];
  for (const prov of sequence) {
    try {
      if (prov === "groq") {
        return await callGroqProvider(messages, jsonMode, settings.groqModel || "qwen/qwen3.8-27b", settings.temperature ?? 0.7);
      }
      if (prov === "openai") {
        return await callOpenAIProvider(messages, jsonMode, settings.openaiModel || "gpt-4o-mini", settings.temperature ?? 0.7);
      }
      if (prov === "mistral") {
        return await callMistralProvider(messages, jsonMode, settings.mistralModel || "mistral-small-latest", settings.temperature ?? 0.7);
      }
    } catch (err) {
      errors.push(err.message);
    }
  }
  throw new Error(`Tous les services IA ont \xE9chou\xE9. D\xE9tails : ${errors.join(" | ")}`);
}
function parseRequestBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on("end", () => {
      const buffer = Buffer.concat(chunks);
      const contentType = req.headers["content-type"] || "";
      if (contentType.includes("application/json")) {
        try {
          const parsed = JSON.parse(buffer.toString("utf-8"));
          return resolve({ fields: parsed, files: [] });
        } catch {
          return resolve({ fields: {}, files: [] });
        }
      }
      if (contentType.includes("multipart/form-data")) {
        const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
        const boundary = boundaryMatch ? boundaryMatch[1] || boundaryMatch[2] : null;
        if (boundary) {
          const rawString = buffer.toString("binary");
          const parts = rawString.split("--" + boundary);
          const fields = {};
          const files = [];
          for (const part of parts) {
            if (!part || part.trim() === "" || part.trim() === "--") continue;
            const headerEnd = part.indexOf("\r\n\r\n");
            if (headerEnd === -1) continue;
            const headerPart = part.slice(0, headerEnd);
            const bodyPart = part.slice(headerEnd + 4).replace(/\r\n$/, "");
            const nameMatch = headerPart.match(/name="([^"]+)"/i);
            const filenameMatch = headerPart.match(/filename="([^"]+)"/i);
            if (nameMatch) {
              const fieldName = nameMatch[1];
              if (filenameMatch) {
                const filename = filenameMatch[1];
                const textContent = Buffer.from(bodyPart, "binary").toString("utf-8");
                files.push({ name: fieldName, filename, text: textContent });
              } else {
                fields[fieldName] = Buffer.from(bodyPart, "binary").toString("utf-8");
              }
            }
          }
          return resolve({ fields, files });
        }
      }
      try {
        const str = buffer.toString("utf-8");
        const params = new URLSearchParams(str);
        const fields = {};
        params.forEach((v, k) => {
          fields[k] = v;
        });
        return resolve({ fields, files: [] });
      } catch {
        return resolve({ fields: {}, files: [] });
      }
    });
  });
}
var docStore = /* @__PURE__ */ new Map();
var meetingStore = /* @__PURE__ */ new Map();
function devApiPlugin() {
  return {
    name: "dev-api-server",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const urlObj = new URL(req.url || "/", "http://localhost:8080");
        const pathname = urlObj.pathname;
        if (!pathname.startsWith("/api/")) {
          return next();
        }
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.setHeader("X-MDIV-Mode", APP_MODE);
        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          return res.end();
        }
        try {
          if (pathname === "/api/ai_settings.php") {
            const db2 = loadDevDb();
            if (req.method === "GET") {
              res.setHeader("Content-Type", "application/json");
              return res.end(JSON.stringify({
                success: true,
                settings: db2.aiSettings || {
                  primaryProvider: "groq",
                  groqModel: "qwen/qwen3.8-27b",
                  openaiModel: "gpt-4o-mini",
                  mistralModel: "mistral-small-latest",
                  temperature: 0.7,
                  fallbackEnabled: true
                }
              }));
            }
            if (req.method === "POST") {
              const { fields } = await parseRequestBody(req);
              const newSettings = {
                primaryProvider: fields.primaryProvider || "groq",
                groqModel: fields.groqModel || "qwen/qwen3.8-27b",
                openaiModel: fields.openaiModel || "gpt-4o-mini",
                mistralModel: fields.mistralModel || "mistral-small-latest",
                temperature: typeof fields.temperature === "number" ? fields.temperature : parseFloat(fields.temperature ?? "0.7"),
                fallbackEnabled: fields.fallbackEnabled !== false && fields.fallbackEnabled !== "false"
              };
              db2.aiSettings = newSettings;
              saveDevDb(db2);
              try {
                const prodSettingsPath = path.resolve(process.cwd(), "public/api/ai_settings.json");
                fs.writeFileSync(prodSettingsPath, JSON.stringify(newSettings, null, 2), "utf-8");
              } catch {
              }
              res.setHeader("Content-Type", "application/json");
              return res.end(JSON.stringify({
                success: true,
                message: "Configuration IA mise \xE0 jour avec succ\xE8s",
                settings: db2.aiSettings
              }));
            }
          }
          if (pathname === "/api/ai_test_provider.php") {
            const { fields } = await parseRequestBody(req);
            const provider = fields.provider || "groq";
            const model = fields.model;
            const startTime = Date.now();
            const testMessages = [
              { role: "system", content: "Tu es un assistant de test de connectivit\xE9 MDIV Business." },
              { role: "user", content: 'R\xE9ponds uniquement par le mot "Connect\xE9".' }
            ];
            try {
              let responseContent = "";
              if (provider === "groq") {
                const resGroq = await callGroqProvider(testMessages, false, model || "qwen/qwen3.8-27b", 0.1);
                responseContent = resGroq?.choices?.[0]?.message?.content || "OK";
              } else if (provider === "openai") {
                const resOpenAI = await callOpenAIProvider(testMessages, false, model || "gpt-4o-mini", 0.1);
                responseContent = resOpenAI?.choices?.[0]?.message?.content || "OK";
              } else if (provider === "mistral") {
                const resMistral = await callMistralProvider(testMessages, false, model || "mistral-small-latest", 0.1);
                responseContent = resMistral?.choices?.[0]?.message?.content || "OK";
              } else {
                throw new Error(`Fournisseur ${provider} inconnu`);
              }
              const latency = Date.now() - startTime;
              res.setHeader("Content-Type", "application/json");
              return res.end(JSON.stringify({
                success: true,
                provider,
                latency,
                response: responseContent.trim()
              }));
            } catch (err) {
              const latency = Date.now() - startTime;
              res.setHeader("Content-Type", "application/json");
              return res.end(JSON.stringify({
                success: false,
                provider,
                latency,
                error: err.message || "Erreur lors du test du fournisseur"
              }));
            }
          }
          if (pathname === "/api/summarizer_upload.php") {
            const { fields, files } = await parseRequestBody(req);
            const id = "doc_" + Math.random().toString(36).substring(2, 10);
            const mode = fields.mode || "standard";
            let text = fields.extracted_text || "";
            let documentName = "document.txt";
            if (files.length > 0) {
              documentName = files[0].filename;
              if (!text) {
                text = files[0].text;
              }
            }
            if (!text || text.trim().length === 0) {
              text = `Document \xAB ${documentName} \xBB import\xE9 en attente de synth\xE8se.`;
            }
            docStore.set(id, { id, documentName, mode, text, createdAt: Date.now() });
            res.setHeader("Content-Type", "application/json");
            return res.end(JSON.stringify({
              id,
              documentName,
              mode,
              status: "uploaded"
            }));
          }
          if (pathname === "/api/summarizer_agents.php") {
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");
            const sendEvent = (event, data) => {
              res.write(`event: ${event}
data: ${JSON.stringify(data)}

`);
            };
            const docId = urlObj.searchParams.get("doc_id") || urlObj.searchParams.get("document_id") || "";
            const mode = urlObj.searchParams.get("mode") || "standard";
            const storedDoc = docStore.get(docId);
            if (!storedDoc || !storedDoc.text || storedDoc.text.trim().length < 5) {
              sendEvent("error", { message: "Aucun contenu textuel trouv\xE9 pour ce document. Veuillez importer un document valide." });
              return res.end();
            }
            sendEvent("agent_message", {
              agent: "Analyste Structurel",
              message: `Lecture approfondie de \xAB ${storedDoc.documentName} \xBB en mode \xAB ${mode} \xBB. Extraction des m\xE9triques et segmentation textuelle...`
            });
            setTimeout(async () => {
              sendEvent("agent_message", {
                agent: "Expert Strat\xE9gie & Risques",
                message: "\xC9valuation des enjeux critiques, d\xE9tection des risques et formalisation des arbitrages requis..."
              });
              try {
                const systemPrompt = `Tu es un consortium de directeurs d'entreprise de haut niveau (Analyste Strat\xE9gique, Auditeur des Risques, Directeur G\xE9n\xE9ral).
Ton r\xF4le est de g\xE9n\xE9rer une synth\xE8se ex\xE9cutive haut de gamme et rigoureuse du document fourni.
Le mode demand\xE9 est : ${mode} (express, standard, detailed, direction, comex).
R\xC8GLE ABSOLUE : Base-toi UNIQUEMENT et EXCLUSIVEMENT sur les informations r\xE9ellement pr\xE9sentes dans le document fourni.
Ne cite aucun fait ou chiffre non mentionn\xE9.
Tu dois r\xE9pondre UNIQUEMENT par un objet JSON valide respectant rigoureusement ce sch\xE9ma :
{
  "id": "${docId}",
  "documentName": "${storedDoc.documentName}",
  "mode": "${mode}",
  "date": "${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}",
  "kpis": {
    "readabilityScore": 88,
    "pageCount": 1,
    "estimatedTimeSavedMinutes": 35
  },
  "keywords": ["mot1", "mot2", "mot3", "mot4", "mot5"],
  "majorConcepts": ["Concept 1", "Concept 2", "Concept 3"],
  "executiveSummary": "Synth\xE8se ex\xE9cutive d\xE9taill\xE9e et percutante bas\xE9e sur le document...",
  "objectives": ["Objectif 1 extrait du document", "Objectif 2"],
  "keyPoints": ["Point cl\xE9 1", "Point cl\xE9 2", "Point cl\xE9 3"],
  "risks": ["Risque r\xE9el identifi\xE9 dans le texte 1", "Risque r\xE9el 2"],
  "recommendedActions": [
    {"action": "Action concr\xE8te 1", "context": "Justification d'apr\xE8s le texte"},
    {"action": "Action concr\xE8te 2", "context": "Justification d'apr\xE8s le texte"}
  ],
  "decisions": ["D\xE9cision 1 \xE0 acter", "D\xE9cision 2"],
  "deadlines": ["\xC9ch\xE9ance 1", "\xC9ch\xE9ance 2"],
  "stakeholders": ["Partie prenante 1", "Partie prenante 2"]
}`;
                const userPrompt = `Voici le contenu int\xE9gral du document \xE0 analyser :

${storedDoc.text.slice(0, 8e3)}

G\xE9n\xE8re le rapport JSON d'analyse d\xE9cisionnelle.`;
                const groqRes = await callLLM([
                  { role: "system", content: systemPrompt },
                  { role: "user", content: userPrompt }
                ], true);
                const content = groqRes.choices[0].message.content;
                const parsed = JSON.parse(content);
                sendEvent("complete", parsed);
                res.end();
              } catch (err) {
                sendEvent("error", { message: err.message || "Erreur lors de l'analyse du document." });
                res.end();
              }
            }, 600);
            return;
          }
          if (pathname === "/api/meeting_upload.php") {
            const { fields, files } = await parseRequestBody(req);
            let rawText = fields.raw_text || "";
            let filename;
            if (files.length > 0) {
              filename = files[0].filename;
              if (!rawText) rawText = files[0].text;
            }
            if (!rawText || rawText.trim().length === 0) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              return res.end(JSON.stringify({ error: "Aucun texte ou fichier de r\xE9union fourni." }));
            }
            const id = "meet_" + Math.random().toString(36).substring(2, 8);
            meetingStore.set(id, { id, text: rawText, filename, createdAt: Date.now() });
            const groqRes = await callLLM([
              {
                role: "system",
                content: `Tu es un secr\xE9taire de s\xE9ance ex\xE9cutif d'entreprise.
Analyse UNIQUEMENT les notes de r\xE9union fournies ci-dessous.
R\xC8GLES STRICTES :
1. Si un responsable n'est pas explicitement mentionn\xE9 pour une action, indique "Non assign\xE9".
2. Si une \xE9ch\xE9ance n'est pas sp\xE9cifi\xE9e, indique "\xC0 d\xE9terminer".
3. Ne jamais inventer de participants fictifs.
R\xE9ponds UNIQUEMENT en JSON strict :
{
  "id": "${id}",
  "date": "${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}",
  "subject": "Objet pr\xE9cis d\xE9duit des notes",
  "participants": ["Participant r\xE9el 1", "Participant 2"],
  "agenda": ["Point abord\xE9 1", "Point abord\xE9 2"],
  "executiveSummary": "Synth\xE8se fid\xE8le des \xE9changes...",
  "decisions": [
    {"decision": "D\xE9cision act\xE9e", "context": "Contexte"}
  ],
  "actions": [
    {"task": "T\xE2che concr\xE8te", "assignee": "Personne d\xE9sign\xE9e ou Non assign\xE9", "deadline": "Date ou \xC0 d\xE9terminer", "status": "pending"}
  ],
  "risks": [
    {"risk": "Risque soulev\xE9 lors de la r\xE9union", "impact": "Medium"}
  ]
}`
              },
              { role: "user", content: `Notes de la r\xE9union :

${rawText.slice(0, 6e3)}` }
            ], true);
            const report = JSON.parse(groqRes.choices[0].message.content);
            res.setHeader("Content-Type", "application/json");
            return res.end(JSON.stringify(report));
          }
          if (pathname === "/api/meeting_agents.php") {
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");
            const sendEvent = (event, data) => {
              res.write(`event: ${event}
data: ${JSON.stringify(data)}

`);
            };
            const contextRaw = urlObj.searchParams.get("context") || "";
            let meetingText = "";
            if (meetingStore.has(contextRaw)) {
              meetingText = meetingStore.get(contextRaw).text;
            } else if (contextRaw.length > 5) {
              try {
                meetingText = decodeURIComponent(contextRaw);
              } catch {
                meetingText = contextRaw;
              }
            }
            if (!meetingText || meetingText.trim().length === 0) {
              sendEvent("error", { message: "Aucun contenu de r\xE9union fourni pour analyse." });
              return res.end();
            }
            sendEvent("agent_message", {
              agent: "Secr\xE9taire de s\xE9ance IA",
              message: "Analyse du verbatim de la r\xE9union, identification des intervenants et structuration de l'ordre du jour..."
            });
            setTimeout(async () => {
              sendEvent("agent_message", {
                agent: "Auditeur des D\xE9cisions",
                message: "Extraction des arbitrages fermes, affectation des livrables et consolidation des risques..."
              });
              try {
                const groqRes = await callLLM([
                  {
                    role: "system",
                    content: `Tu es un secr\xE9taire de s\xE9ance de haut niveau pour MDIV Business.
Analyse fid\xE8lement les notes de r\xE9union transmises.
R\xC8GLES ABSOLUES :
- N'invente aucun participant non cit\xE9. Si aucun n'est cit\xE9, mets ["Participants \xE0 la r\xE9union"].
- Si un responsable n'est pas sp\xE9cifi\xE9 pour une t\xE2che, mets "Non assign\xE9".
- Si une deadline n'est pas cit\xE9e, mets "\xC0 convenir".
R\xE9ponds UNIQUEMENT par ce sch\xE9ma JSON :
{
  "id": "meet_${Math.random().toString(36).substring(2, 8)}",
  "date": "${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}",
  "subject": "Objet pr\xE9cis d\xE9duit des notes",
  "participants": ["..."],
  "agenda": ["Point 1", "Point 2"],
  "executiveSummary": "Synth\xE8se fid\xE8le...",
  "decisions": [
    {"decision": "D\xE9cision act\xE9e", "context": "Contexte"}
  ],
  "actions": [
    {"task": "Action \xE0 mener", "assignee": "Responsable r\xE9el ou Non assign\xE9", "deadline": "Date ou \xC0 convenir", "status": "pending"}
  ],
  "risks": [
    {"risk": "Point de vigilance", "impact": "Medium"}
  ]
}`
                  },
                  { role: "user", content: `Contenu r\xE9el des notes de r\xE9union :

${meetingText.slice(0, 6e3)}` }
                ], true);
                const report = JSON.parse(groqRes.choices[0].message.content);
                sendEvent("complete", report);
                res.end();
              } catch (err) {
                sendEvent("error", { message: err.message || "Erreur de traitement IA du compte-rendu." });
                res.end();
              }
            }, 600);
            return;
          }
          if (pathname === "/api/diagnostic_step.php") {
            const { fields } = await parseRequestBody(req);
            const history = fields.history || [];
            const groqRes = await callLLM([
              {
                role: "system",
                content: `Tu es l'analyste strat\xE9gique de diagnostic d'entreprise MDIV Business.
\xC0 partir des r\xE9ponses pr\xE9c\xE9dentes de l'utilisateur, g\xE9n\xE8re la prochaine question d'\xE9valuation diagnostique adapt\xE9e \xE0 son secteur et ses d\xE9fis.
R\xE9ponds en JSON strict :
{
  "question": "Question strat\xE9gique pr\xE9cise pos\xE9e au dirigeant ?",
  "options": ["Option concr\xE8te 1", "Option concr\xE8te 2", "Option concr\xE8te 3", "Option concr\xE8te 4"],
  "total_questions": 5
}`
              },
              { role: "user", content: `Historique des r\xE9ponses pr\xE9c\xE9dentes : ${JSON.stringify(history)}` }
            ], true);
            res.setHeader("Content-Type", "application/json");
            return res.end(groqRes.choices[0].message.content);
          }
          if (pathname === "/api/diagnostic_agents.php") {
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");
            const sendEvent = (event, data) => {
              res.write(`event: ${event}
data: ${JSON.stringify(data)}

`);
            };
            const contextRaw = urlObj.searchParams.get("context") || urlObj.searchParams.get("profile") || urlObj.searchParams.get("answers") || "";
            let userContext = contextRaw;
            try {
              userContext = decodeURIComponent(contextRaw);
            } catch {
            }
            sendEvent("agent_message", {
              agent: "Consultant Strat\xE9gie",
              message: "Analyse de vos r\xE9ponses et profil d'activit\xE9. \xC9valuation des leviers de rentabilit\xE9..."
            });
            setTimeout(async () => {
              sendEvent("agent_message", {
                agent: "Expert Automatisation",
                message: "Calcul des gains potentiels et s\xE9lection des cas d'usage IA prioritaires..."
              });
              try {
                const textLower = userContext.toLowerCase();
                let score = 50;
                if (textLower.includes("crm") || textLower.includes("cloud") || textLower.includes("outil")) score += 10;
                if (textLower.includes("ia") || textLower.includes("automatisation") || textLower.includes("digital")) score += 10;
                if (textLower.includes("d\xE9j\xE0") || textLower.includes("\xE9quipe") || textLower.includes("site web")) score += 5;
                if (textLower.includes("papier") || textLower.includes("manuel") || textLower.includes("retard")) score -= 15;
                if (textLower.includes("aucun") || textLower.includes("perte de temps") || textLower.includes("difficile")) score -= 10;
                if (textLower.includes("excel") || textLower.includes("d\xE9pass\xE9")) score -= 5;
                score = Math.max(25, Math.min(95, score));
                const groqRes = await callLLM([
                  {
                    role: "system",
                    content: `Tu es un consortium d'auditeurs de direction g\xE9n\xE9rale MDIV Business.
R\xE9dige le rapport d'audit final personnalis\xE9 bas\xE9 STRICTEMENT sur les r\xE9ponses donn\xE9es par le dirigeant.
Le score de maturit\xE9 calcul\xE9 est de ${score}/100.
Tu dois r\xE9pondre UNIQUEMENT en JSON strict avec ce sch\xE9ma :
{
  "score": ${score},
  "synthesis": "Synth\xE8se personnalis\xE9e d'apr\xE8s les r\xE9ponses du dirigeant (3 phrases concr\xE8tes).",
  "deduced_insights": [
    "Constat pr\xE9cis 1 d\xE9coulant directement de ses r\xE9ponses",
    "Opportunit\xE9 d'am\xE9lioration concr\xE8te 2"
  ],
  "recommendations": [
    {
      "tool_name": "Nom de solution adapt\xE9e",
      "category": "Domaine m\xE9tier",
      "reason": "Pourquoi c'est prioritaire d'apr\xE8s ses d\xE9clarations",
      "how_to_start": "Action concr\xE8te \xE0 lancer cette semaine"
    }
  ]
}`
                  },
                  { role: "user", content: `R\xE9ponses et profil de l'entreprise :

${userContext.slice(0, 4e3)}` }
                ], true);
                const report = JSON.parse(groqRes.choices[0].message.content);
                sendEvent("complete", report);
                res.end();
              } catch (err) {
                sendEvent("error", { message: err.message || "Erreur lors de la g\xE9n\xE9ration du diagnostic." });
                res.end();
              }
            }, 600);
            return;
          }
          if (pathname === "/api/invoice_ai_check.php") {
            const { fields } = await parseRequestBody(req);
            const invoiceNumber = fields.invoiceNumber || "Facture sans num\xE9ro";
            const lines = Array.isArray(fields.lines) ? fields.lines : [];
            const calcHT = lines.reduce((acc, l) => acc + (Number(l.quantity) || 1) * (Number(l.unitPriceHT) || 0) * (1 - (Number(l.discountPercentage) || 0) / 100), 0);
            const calcVAT = lines.reduce((acc, l) => acc + (Number(l.quantity) || 1) * (Number(l.unitPriceHT) || 0) * (1 - (Number(l.discountPercentage) || 0) / 100) * ((Number(l.vatRate) || 20) / 100), 0);
            const totalHT = fields.totalHT !== void 0 ? Number(fields.totalHT) : calcHT;
            const vatAmount = fields.vatAmount !== void 0 || fields.totalVAT !== void 0 ? Number(fields.vatAmount ?? fields.totalVAT) : calcVAT;
            const totalTTC = fields.totalTTC !== void 0 ? Number(fields.totalTTC) : totalHT + vatAmount;
            let clientName = fields.clientName;
            if (!clientName && fields.clientId) {
              const found = devDb.clients.find((c) => c.id === Number(fields.clientId) || c.id === fields.clientId);
              if (found) clientName = found.name;
            }
            if (!clientName) clientName = "Client non sp\xE9cifi\xE9";
            const errors = [];
            const warnings = [];
            if (lines.length > 0) {
              if (Math.abs(calcHT - totalHT) > 0.1) {
                errors.push(`Erreur de calcul : La somme des lignes HT (${calcHT.toFixed(2)} \u20AC) ne correspond pas au total HT d\xE9clar\xE9 (${totalHT.toFixed(2)} \u20AC).`);
              }
            } else {
              warnings.push("La facture ne contient aucune ligne de prestation ou produit.");
            }
            if (totalHT > 0 && Math.abs(totalHT + vatAmount - totalTTC) > 0.1) {
              errors.push(`Erreur TVA : Total HT (${totalHT.toFixed(2)} \u20AC) + TVA (${vatAmount.toFixed(2)} \u20AC) \u2260 Total TTC (${totalTTC.toFixed(2)} \u20AC).`);
            }
            if (!clientName || clientName === "Client non sp\xE9cifi\xE9") {
              warnings.push("Le nom du client destinataire est manquant.");
            }
            const groqRes = await callLLM([
              {
                role: "system",
                content: `Tu es un expert-comptable et juriste fiscaliste sp\xE9cialis\xE9 en facturation B2B fran\xE7aise.
Audite la facture suivante et identifie les anomalies juridiques, mentions manquantes ou alertes fiscales.
R\xE9ponds en JSON strict :
{
  "aiWarnings": ["Point de vigilance l\xE9gal 1", "Point 2"],
  "suggestedMentions": ["Mention obligatoire recommand\xE9e"]
}`
              },
              {
                role: "user",
                content: `Facture N\xB0: ${invoiceNumber}, Client: ${clientName}, Total HT: ${totalHT} \u20AC, Total TTC: ${totalTTC} \u20AC, TVA: ${vatAmount} \u20AC, Lignes: ${JSON.stringify(lines)}`
              }
            ], true);
            const aiAnalysis = JSON.parse(groqRes.choices[0].message.content);
            if (Array.isArray(aiAnalysis.aiWarnings)) {
              warnings.push(...aiAnalysis.aiWarnings);
            }
            res.setHeader("Content-Type", "application/json");
            return res.end(JSON.stringify({
              isValid: errors.length === 0,
              errors,
              warnings,
              suggestedMentions: aiAnalysis.suggestedMentions || ["Indemnit\xE9 forfaitaire de 40\u20AC pour frais de recouvrement (Art. D. 441-5 C. com.)"]
            }));
          }
          if (pathname === "/api/email_analyze.php") {
            const { fields } = await parseRequestBody(req);
            const text = (fields.text || fields.body || "").trim();
            if (!text || text.length === 0) {
              res.setHeader("Content-Type", "application/json");
              return res.end(JSON.stringify({
                clarityScore: 0,
                professionalismScore: 0,
                estimatedLengthWords: 0,
                readTimeSeconds: 0,
                qualityScore: 0
              }));
            }
            const wordCount = text.split(/\s+/).length;
            const readTimeSeconds = Math.max(5, Math.round(wordCount / 200 * 60));
            const groqRes = await callLLM([
              {
                role: "system",
                content: `Tu es un auditeur de communication d'entreprise. \xC9value rigoureusement la qualit\xE9 du texte d'email fourni.
Crit\xE8res :
- clarityScore (0-100) : Clart\xE9 du propos et structure.
- professionalismScore (0-100) : Politesse, vocabulaire soutenu, absence de familiarit\xE9.
- qualityScore (0-100) : Efficacit\xE9 globale pour atteindre son objectif.
R\xE9ponds en JSON strict :
{
  "clarityScore": 88,
  "professionalismScore": 92,
  "qualityScore": 90
}`
              },
              { role: "user", content: `Email \xE0 analyser :

${text}` }
            ], true);
            const scores = JSON.parse(groqRes.choices[0].message.content);
            res.setHeader("Content-Type", "application/json");
            return res.end(JSON.stringify({
              clarityScore: Number(scores.clarityScore) || 75,
              professionalismScore: Number(scores.professionalismScore) || 80,
              estimatedLengthWords: wordCount,
              readTimeSeconds,
              qualityScore: Number(scores.qualityScore) || 78
            }));
          }
          const db = loadDevDb();
          if (pathname === "/api/clients.php") {
            if (req.method === "POST") {
              const { fields } = await parseRequestBody(req);
              const newClient = {
                id: fields.id || db.clients.length + 1,
                name: fields.name || "Nouveau Client",
                email: fields.email || "",
                company: fields.company || fields.name || "Entreprise",
                address: fields.address || "",
                phone: fields.phone || "",
                createdAt: (/* @__PURE__ */ new Date()).toISOString()
              };
              db.clients.push(newClient);
              saveDevDb(db);
              res.setHeader("Content-Type", "application/json");
              return res.end(JSON.stringify(newClient));
            }
            res.setHeader("Content-Type", "application/json");
            return res.end(JSON.stringify(db.clients));
          }
          if (pathname === "/api/invoices.php") {
            if (req.method === "POST") {
              const { fields } = await parseRequestBody(req);
              const newInvoice = {
                id: fields.id || `inv_${Date.now()}`,
                invoiceNumber: fields.invoiceNumber || `FAC-${(/* @__PURE__ */ new Date()).getFullYear()}-${String(db.invoices.length + 1).padStart(4, "0")}`,
                clientName: fields.clientName || "Client",
                amountHT: Number(fields.totalHT || fields.amountHT) || 0,
                amountTTC: Number(fields.totalTTC || fields.amountTTC) || 0,
                status: fields.status || "pending",
                date: fields.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
                createdAt: (/* @__PURE__ */ new Date()).toISOString()
              };
              db.invoices.push(newInvoice);
              saveDevDb(db);
              res.setHeader("Content-Type", "application/json");
              return res.end(JSON.stringify(newInvoice));
            }
            res.setHeader("Content-Type", "application/json");
            return res.end(JSON.stringify(db.invoices));
          }
          if (pathname === "/api/invoices_kpis.php") {
            const totalIssued = db.invoices.reduce((sum, inv) => sum + (Number(inv.amountTTC) || 0), 0);
            const totalPaid = db.invoices.filter((i) => i.status === "paid").reduce((sum, inv) => sum + (Number(inv.amountTTC) || 0), 0);
            const totalPending = db.invoices.filter((i) => i.status === "pending").reduce((sum, inv) => sum + (Number(inv.amountTTC) || 0), 0);
            const totalOverdue = db.invoices.filter((i) => i.status === "overdue").reduce((sum, inv) => sum + (Number(inv.amountTTC) || 0), 0);
            res.setHeader("Content-Type", "application/json");
            return res.end(JSON.stringify({ totalIssued, totalPaid, totalPending, totalOverdue }));
          }
          if (pathname === "/api/followup_targets.php") {
            const overdueInvoices = db.invoices.filter((i) => i.status === "overdue" || i.status === "pending").map((i) => ({
              id: i.id,
              type: "invoice",
              reference: i.invoiceNumber,
              clientName: i.clientName,
              amount: i.amountTTC,
              daysPending: 15,
              status: i.status === "overdue" ? "escalated" : "pending"
            }));
            res.setHeader("Content-Type", "application/json");
            return res.end(JSON.stringify(overdueInvoices));
          }
          if (pathname === "/api/followup_kpis.php") {
            res.setHeader("Content-Type", "application/json");
            return res.end(JSON.stringify({
              totalSent: db.followups.length,
              responseRatePercent: db.followups.length > 0 ? 65 : 0,
              quotesWon: db.quotes.filter((q) => q.status === "accepted").length,
              invoicesPaid: db.invoices.filter((i) => i.status === "paid").length
            }));
          }
          if (pathname === "/api/upcoming_meetings.php") {
            res.setHeader("Content-Type", "application/json");
            return res.end(JSON.stringify([]));
          }
          if (pathname === "/api/leads_kpis.php") {
            res.setHeader("Content-Type", "application/json");
            return res.end(JSON.stringify({
              totalGenerated: 48,
              highlyQualified: 32,
              activeSegments: 6,
              totalExports: 14
            }));
          }
          if (pathname === "/api/leads_search.php") {
            const { fields } = await parseRequestBody(req);
            const sector = fields.sector || "Technologie & Conseil";
            const country = fields.country || "France";
            const region = fields.region || "Toutes r\xE9gions";
            const companySize = fields.companySize || "PME (51-250)";
            const targetFunction = fields.targetFunction || "CEO / DSI";
            const keywords = fields.keywords || "transformation digitale, automatisation";
            const systemPrompt = `Tu es un moteur de prospection et d'intelligence commerciale B2B sp\xE9cialis\xE9 pour MDIV Business.
\xC0 partir des crit\xE8res de ciblage r\xE9els demand\xE9s, g\xE9n\xE8re une liste de 4 \xE0 6 entreprises cibles cr\xE9dibles et hautement qualifi\xE9es avec leur profil d'enrichissement IA.
R\xE9ponds STRICTEMENT par un tableau JSON valide au format :
[
  {
    "companyName": "Nom entreprise",
    "sector": "${sector}",
    "size": "${companySize}",
    "location": "Paris, ${country}",
    "website": "https://www.exemple.fr",
    "digitalMaturityScore": "Moyen",
    "aiPotentialScore": "\xC9lev\xE9",
    "purchaseProbability": "Tr\xE8s \xE9lev\xE9",
    "decisionMakerName": "Pr\xE9nom Nom",
    "decisionMakerFunction": "${targetFunction}",
    "technologiesUsed": ["Microsoft 365", "ERP SAP", "Salesforce"]
  }
]`;
            const userPrompt = `Crit\xE8res de prospection demand\xE9s :
Secteur : ${sector}
Pays : ${country}
R\xE9gion : ${region}
Taille d'entreprise : ${companySize}
Fonction cibl\xE9e : ${targetFunction}
Mots-cl\xE9s et technologies : ${keywords}`;
            try {
              const aiRes = await callLLM([
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
              ], false);
              const content = aiRes.choices[0].message.content;
              let leadsData = [];
              try {
                leadsData = JSON.parse(content);
              } catch {
                const match = content.match(/\\[[\\s\\S]*\\]/);
                if (match) leadsData = JSON.parse(match[0]);
              }
              res.setHeader("Content-Type", "application/json");
              return res.end(JSON.stringify(leadsData));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              return res.end(JSON.stringify({ error: err.message || "Erreur de g\xE9n\xE9ration des leads" }));
            }
          }
          if (pathname === "/api/email_generate.php") {
            const { fields } = await parseRequestBody(req);
            const { text, task, tone, objective } = fields;
            const groqRes = await callLLM([
              {
                role: "system",
                content: `Tu es un expert en communication ex\xE9cutive pour MDIV Business.
T\xE2che : ${task || "R\xE9\xE9criture"} | Ton : ${tone || "Professionnel"} | Objectif : ${objective || "Email B2B"}
R\xE9dige un email parfait avec Objet en premi\xE8re ligne, salutation, corps \xE9l\xE9gant et signature. Pas de texte superflu.`
              },
              { role: "user", content: text || "Proposer un rendez-vous pour pr\xE9senter nos services IA." }
            ]);
            res.setHeader("Content-Type", "application/json");
            return res.end(JSON.stringify({
              success: true,
              generatedText: groqRes.choices[0].message.content
            }));
          }
          if (pathname === "/api/followup_generate.php") {
            const { fields } = await parseRequestBody(req);
            const groqRes = await callLLM([
              {
                role: "system",
                content: `Tu es un sp\xE9cialiste de la relation client et du recouvrement bienveillant pour MDIV Business.
R\xE9dige un message de relance adapt\xE9 au dossier :
Type: ${fields.type || "Dossier"} | Client: ${fields.clientName} | R\xE9f: ${fields.reference} | Ton: ${fields.tone} | Urgence: ${fields.urgencyLevel}
R\xE9ponds UNIQUEMENT en JSON strict :
{
  "subject": "Objet clair et percutant de la relance",
  "body": "Corps complet du message poli et argument\xE9..."
}`
              },
              { role: "user", content: `G\xE9n\xE8re la relance pour ${fields.clientName} concernant ${fields.reference} sur un ton ${fields.tone}.` }
            ], true);
            res.setHeader("Content-Type", "application/json");
            return res.end(groqRes.choices[0].message.content);
          }
          if (pathname === "/api/followup_send.php") {
            const { fields } = await parseRequestBody(req);
            db.followups.push({
              id: "fol_" + Date.now(),
              targetId: fields.targetId,
              subject: fields.subject,
              sentAt: (/* @__PURE__ */ new Date()).toISOString()
            });
            saveDevDb(db);
            res.setHeader("Content-Type", "application/json");
            return res.end(JSON.stringify({ success: true, message: "Relance enregistr\xE9e et exp\xE9di\xE9e avec succ\xE8s." }));
          }
          if (pathname === "/api/content_generate.php") {
            const { fields } = await parseRequestBody(req);
            const channels = fields.channels || ["LinkedIn", "Twitter/X"];
            const sourceContent = fields.sourceContent || "";
            const targetAudience = fields.targetAudience || "Dirigeants de PME";
            const brandSettings = fields.brandSettings || {};
            const groqRes = await callLLM([
              {
                role: "system",
                content: `Tu es un directeur \xE9ditorial et copywriter B2B d'\xE9lite.
G\xE9n\xE8re une d\xE9clinaison pour les canaux suivants : [${channels.join(", ")}].
Audience : ${targetAudience}
Ton : ${brandSettings.tone || "Professionnel et inspirant"}
Mots-cl\xE9s : ${brandSettings.keywords || ""}
R\xE9ponds UNIQUEMENT en tableau JSON valide :
[
  {
    "channel": "NomDuCanal",
    "title": "Titre accrocheur",
    "body": "Texte engageant complet...",
    "hashtags": ["#Tag1", "#Tag2"]
  }
]`
              },
              { role: "user", content: `Contenu source \xE0 d\xE9cliner :

${sourceContent}` }
            ], true);
            res.setHeader("Content-Type", "application/json");
            return res.end(groqRes.choices[0].message.content);
          }
          if (pathname === "/api/prospecting_generate.php") {
            const { fields } = await parseRequestBody(req);
            const groqRes = await callLLM([
              {
                role: "system",
                content: `Tu es un expert en cold emailing B2B haute conversion pour MDIV Business.
R\xE9dige un message d'outreach personnalis\xE9 dans la langue demand\xE9e (${fields.language || "Fran\xE7ais"}).
Cible : ${fields.targetCompany} (${fields.sector})
Destinataire : ${fields.contactRole}
Offre : ${fields.offer}
Ton : ${fields.tone}
R\xE9ponds UNIQUEMENT en JSON strict :
{
  "id": "camp_${Math.random().toString(36).substring(2, 8)}",
  "subject": "Objet d'email irr\xE9sistible",
  "content": "Corps complet du message...",
  "kpis": {
    "impactScore": 92,
    "clarityScore": 94,
    "personalizationScore": 90,
    "engagementScore": 89,
    "estimatedReadTimeSeconds": 35,
    "persuasionLevel": "\xC9lev\xE9",
    "suggestions": ["Relancer \xE0 J+4", "Mettre en avant une \xE9tude de cas"]
  },
  "date": "${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}"
}`
              },
              { role: "user", content: `G\xE9n\xE8re la campagne d'outreach pour ${fields.targetCompany} (${fields.contactRole}) concernant : ${fields.offer}` }
            ], true);
            res.setHeader("Content-Type", "application/json");
            return res.end(groqRes.choices[0].message.content);
          }
          if (pathname === "/api/leads_search.php") {
            const { fields } = await parseRequestBody(req);
            const groqRes = await callLLM([
              {
                role: "system",
                content: `Tu es un moteur de prospection et d'intelligence commerciale B2B pour MDIV Business.
\xC0 partir des filtres demand\xE9s, g\xE9n\xE8re 4 comptes d'affaires cibles coh\xE9rents et hautement repr\xE9sentatifs du march\xE9 pour tester l'approche commerciale.
R\xC8GLE D'HONN\xCATET\xC9 : Ces fiches sont des suggestions d'entreprises mod\xE9lis\xE9es selon les crit\xE8res saisis.
R\xE9ponds UNIQUEMENT en tableau JSON valide :
[
  {
    "companyName": "Nom de l'entreprise",
    "sector": "${fields.sector || "Industrie"}",
    "size": "${fields.companySize || "50 \xE0 250 salari\xE9s"}",
    "location": "${fields.region || "France"}",
    "website": "https://www.nom-entreprise.fr",
    "digitalMaturityScore": "Moyen",
    "aiPotentialScore": "\xC9lev\xE9",
    "purchaseProbability": "\xC9lev\xE9",
    "decisionMakerName": "Pr\xE9nom Nom",
    "decisionMakerFunction": "${fields.targetFunction || "Directeur G\xE9n\xE9ral"}",
    "technologiesUsed": ["ERP", "Microsoft 365"]
  }
]`
              },
              { role: "user", content: `Secteur : ${fields.sector}, Pays : ${fields.country}, Taille : ${fields.companySize}, D\xE9cideur : ${fields.targetFunction}` }
            ], true);
            res.setHeader("Content-Type", "application/json");
            return res.end(groqRes.choices[0].message.content);
          }
          if (pathname === "/api/meeting_prep_generate.php") {
            const { fields } = await parseRequestBody(req);
            const clientName = fields.clientName || "Prospect MDIV";
            const meetingDate = fields.meetingDate || "Prochainement";
            const meetingContext = fields.meetingContext || "Cadrage initial";
            const meetingObjective = fields.meetingObjective || "D\xE9finir les besoins et convenir des \xE9tapes";
            const groqRes = await callLLM([
              {
                role: "system",
                content: `Tu es un coach en n\xE9gociation strat\xE9gique et directeur d'avant-vente pour MDIV Business.
R\xE9dige un briefing d'avant-RDV complet et imm\xE9diatement exploitable par le commercial ou dirigeant.
Tu dois r\xE9pondre UNIQUEMENT par un objet JSON valide suivant exactement cette structure :
{
  "oneLinerSummary": "Synth\xE8se en une phrase de l'enjeu capital de ce rendez-vous.",
  "clientSummary": "R\xE9sum\xE9 concis de la situation du client et de ses attentes prioritaires.",
  "opportunities": ["Opportunit\xE9 1", "Opportunit\xE9 2"],
  "risks": ["Risque 1 \xE0 anticiper", "Risque 2"],
  "probableObjections": ["Objection pr\xE9visible (ex: co\xFBt, d\xE9lais, s\xE9curit\xE9) et comment y r\xE9pondre."],
  "recommendedQuestions": ["Question ouverte percutante 1", "Question 2"],
  "discoveryStrategy": "Conseil tactique d'\xE9coute active et de posture commerciale...",
  "meetingObjectives": ["Objectif minimum : ...", "Objectif id\xE9al : ..."],
  "recommendedActions": ["Action imm\xE9diate \xE0 engager \xE0 la fin du RDV"]
}`
              },
              {
                role: "user",
                content: `Client : ${clientName}
Date : ${meetingDate}
Objectif : ${meetingObjective}
Contexte : ${meetingContext}`
              }
            ], true);
            res.setHeader("Content-Type", "application/json");
            return res.end(groqRes.choices[0].message.content);
          }
          if (pathname === "/api/quote_ai_assist.php") {
            const { fields } = await parseRequestBody(req);
            const groqRes = await callLLM([
              {
                role: "system",
                content: `Tu es un directeur commercial et tarificateur pour MDIV Business.
D\xE9compose la demande client en prestations valoris\xE9es et coh\xE9rentes.
R\xE9ponds en JSON strict :
{
  "suggestedLines": [
    { "id": "1", "description": "Prestation d\xE9taill\xE9e 1", "quantity": 1, "unitPriceHT": 1500, "vatRate": 20, "discountPercentage": 0 },
    { "id": "2", "description": "Prestation d\xE9taill\xE9e 2", "quantity": 1, "unitPriceHT": 2500, "vatRate": 20, "discountPercentage": 0 }
  ],
  "executiveSummary": "Pr\xE9sentation percutante de l'offre...",
  "paymentTerms": "Acompte de 30% \xE0 la commande, solde \xE0 la livraison."
}`
              },
              { role: "user", content: `Client: ${fields.clientContext || "Client"}
Projet: ${fields.projectDescription || "Accompagnement digital"}` }
            ], true);
            res.setHeader("Content-Type", "application/json");
            return res.end(groqRes.choices[0].message.content);
          }
          if (pathname === "/api/benchmark_stats.php") {
            const sector = urlObj.searchParams.get("sector") || "Industrie";
            res.setHeader("Content-Type", "application/json");
            return res.end(JSON.stringify({
              sector,
              global_avg: 54,
              global_top10: 86,
              ai_avg: 42,
              data_avg: 48,
              process_avg: 61,
              infra_avg: 57,
              culture_avg: 49,
              strategy_avg: 55
            }));
          }
          if (pathname === "/api/benchmark_submit.php") {
            res.setHeader("Content-Type", "application/json");
            return res.end(JSON.stringify({
              success: true,
              message: "Audit de maturit\xE9 enregistr\xE9 avec succ\xE8s."
            }));
          }
          next();
        } catch (e) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: e.message || "Erreur interne du serveur de d\xE9veloppement." }));
        }
      });
    }
  };
}

// vite.config.ts
var __vite_injected_original_dirname = "C:\\Users\\mezat\\Desktop\\Famillle\\Eric\\Projet MDIV Business\\Mdiv Business\\Site web\\MDIV_Business";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false
    }
  },
  plugins: [
    devApiPlugin(),
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path2.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAidml0ZS1kZXYtYXBpLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWV6YXRcXFxcRGVza3RvcFxcXFxGYW1pbGxsZVxcXFxFcmljXFxcXFByb2pldCBNRElWIEJ1c2luZXNzXFxcXE1kaXYgQnVzaW5lc3NcXFxcU2l0ZSB3ZWJcXFxcTURJVl9CdXNpbmVzc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWV6YXRcXFxcRGVza3RvcFxcXFxGYW1pbGxsZVxcXFxFcmljXFxcXFByb2pldCBNRElWIEJ1c2luZXNzXFxcXE1kaXYgQnVzaW5lc3NcXFxcU2l0ZSB3ZWJcXFxcTURJVl9CdXNpbmVzc1xcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWV6YXQvRGVza3RvcC9GYW1pbGxsZS9FcmljL1Byb2pldCUyME1ESVYlMjBCdXNpbmVzcy9NZGl2JTIwQnVzaW5lc3MvU2l0ZSUyMHdlYi9NRElWX0J1c2luZXNzL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcbmltcG9ydCB7IGRldkFwaVBsdWdpbiB9IGZyb20gXCIuL3ZpdGUtZGV2LWFwaVwiO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6IFwiOjpcIixcclxuICAgIHBvcnQ6IDgwODAsXHJcbiAgICBobXI6IHtcclxuICAgICAgb3ZlcmxheTogZmFsc2UsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgcGx1Z2luczogW1xyXG4gICAgZGV2QXBpUGx1Z2luKCksXHJcbiAgICByZWFjdCgpLFxyXG4gICAgbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiICYmIGNvbXBvbmVudFRhZ2dlcigpXHJcbiAgXS5maWx0ZXIoQm9vbGVhbiksXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXHJcbiAgICB9LFxyXG4gIH0sXHJcbn0pKTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtZXphdFxcXFxEZXNrdG9wXFxcXEZhbWlsbGxlXFxcXEVyaWNcXFxcUHJvamV0IE1ESVYgQnVzaW5lc3NcXFxcTWRpdiBCdXNpbmVzc1xcXFxTaXRlIHdlYlxcXFxNRElWX0J1c2luZXNzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtZXphdFxcXFxEZXNrdG9wXFxcXEZhbWlsbGxlXFxcXEVyaWNcXFxcUHJvamV0IE1ESVYgQnVzaW5lc3NcXFxcTWRpdiBCdXNpbmVzc1xcXFxTaXRlIHdlYlxcXFxNRElWX0J1c2luZXNzXFxcXHZpdGUtZGV2LWFwaS50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbWV6YXQvRGVza3RvcC9GYW1pbGxsZS9FcmljL1Byb2pldCUyME1ESVYlMjBCdXNpbmVzcy9NZGl2JTIwQnVzaW5lc3MvU2l0ZSUyMHdlYi9NRElWX0J1c2luZXNzL3ZpdGUtZGV2LWFwaS50c1wiO2ltcG9ydCB0eXBlIHsgUGx1Z2luLCBWaXRlRGV2U2VydmVyIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgaHR0cCBmcm9tICdodHRwJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuZnVuY3Rpb24gZ2V0RW52VmFyKGtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKHByb2Nlc3MuZW52W2tleV0pIHJldHVybiBwcm9jZXNzLmVudltrZXldITtcbiAgdHJ5IHtcbiAgICBjb25zdCBlbnZQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICcuZW52Jyk7XG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoZW52UGF0aCkpIHtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZW52UGF0aCwgJ3V0Zi04Jyk7XG4gICAgICBmb3IgKGNvbnN0IGxpbmUgb2YgY29udGVudC5zcGxpdCgnXFxuJykpIHtcbiAgICAgICAgY29uc3QgdHJpbW1lZCA9IGxpbmUudHJpbSgpO1xuICAgICAgICBpZiAoIXRyaW1tZWQgfHwgdHJpbW1lZC5zdGFydHNXaXRoKCcjJykpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBbaywgLi4udl0gPSB0cmltbWVkLnNwbGl0KCc9Jyk7XG4gICAgICAgIGlmIChrLnRyaW0oKSA9PT0ga2V5KSByZXR1cm4gdi5qb2luKCc9JykudHJpbSgpO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCB7fVxuICByZXR1cm4gJyc7XG59XG5cbmNvbnN0IEdST1FfQVBJX0tFWSA9IGdldEVudlZhcignR1JPUV9BUElfS0VZJyk7XG5jb25zdCBPUEVOQUlfQVBJX0tFWSA9IGdldEVudlZhcignT1BFTkFJX0FQSV9LRVknKTtcbmNvbnN0IE1JU1RSQUxfQVBJX0tFWSA9IGdldEVudlZhcignTUlTVFJBTF9BUElfS0VZJyk7XG5jb25zdCBBUFBfTU9ERSA9IGdldEVudlZhcignQVBQX01PREUnKSB8fCAnbGl2ZSc7XG5cbmNvbnN0IEdST1FfVVJMID0gJ2h0dHBzOi8vYXBpLmdyb3EuY29tL29wZW5haS92MS9jaGF0L2NvbXBsZXRpb25zJztcbmNvbnN0IE9QRU5BSV9VUkwgPSAnaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MS9jaGF0L2NvbXBsZXRpb25zJztcbmNvbnN0IE1JU1RSQUxfVVJMID0gJ2h0dHBzOi8vYXBpLm1pc3RyYWwuYWkvdjEvY2hhdC9jb21wbGV0aW9ucyc7XG5cbi8vIEJhc2UgZGUgZG9ublx1MDBFOWVzIGxvY2FsZSBkZSBkXHUwMEU5dmVsb3BwZW1lbnQgcG91ciBwZXJzaXN0ZXIgZGV2aXMsIGZhY3R1cmVzLCBjbGllbnRzIGV0IHJcdTAwRTlnbGFnZXMgSUFcbmNvbnN0IERFVl9EQl9QQVRIID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICdkZXZfZGIuanNvbicpO1xuZnVuY3Rpb24gbG9hZERldkRiKCk6IHsgY2xpZW50czogYW55W107IGludm9pY2VzOiBhbnlbXTsgcXVvdGVzOiBhbnlbXTsgZm9sbG93dXBzOiBhbnlbXTsgYWlTZXR0aW5ncz86IGFueSB9IHtcbiAgdHJ5IHtcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhERVZfREJfUEFUSCkpIHtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhERVZfREJfUEFUSCwgJ3V0Zi04JykpO1xuICAgIH1cbiAgfSBjYXRjaCB7fVxuICByZXR1cm4ge1xuICAgIGNsaWVudHM6IFtdLFxuICAgIGludm9pY2VzOiBbXSxcbiAgICBxdW90ZXM6IFtdLFxuICAgIGZvbGxvd3VwczogW10sXG4gICAgYWlTZXR0aW5nczoge1xuICAgICAgcHJpbWFyeVByb3ZpZGVyOiAnZ3JvcScsXG4gICAgICBncm9xTW9kZWw6ICdxd2VuL3F3ZW4zLjgtMjdiJyxcbiAgICAgIG9wZW5haU1vZGVsOiAnZ3B0LTRvLW1pbmknLFxuICAgICAgbWlzdHJhbE1vZGVsOiAnbWlzdHJhbC1zbWFsbC1sYXRlc3QnLFxuICAgICAgdGVtcGVyYXR1cmU6IDAuNyxcbiAgICAgIGZhbGxiYWNrRW5hYmxlZDogdHJ1ZVxuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gc2F2ZURldkRiKGRhdGE6IGFueSkge1xuICB0cnkge1xuICAgIGZzLndyaXRlRmlsZVN5bmMoREVWX0RCX1BBVEgsIEpTT04uc3RyaW5naWZ5KGRhdGEsIG51bGwsIDIpLCAndXRmLTgnKTtcbiAgfSBjYXRjaCB7fVxufVxuXG5hc3luYyBmdW5jdGlvbiBjYWxsR3JvcVByb3ZpZGVyKG1lc3NhZ2VzOiBhbnlbXSwganNvbk1vZGU6IGJvb2xlYW4sIG1vZGVsID0gJ3F3ZW4vcXdlbjMuOC0yN2InLCB0ZW1wZXJhdHVyZSA9IDAuNykge1xuICBpZiAoIUdST1FfQVBJX0tFWSkgdGhyb3cgbmV3IEVycm9yKCdDbFx1MDBFOSBHUk9RX0FQSV9LRVkgbm9uIGNvbmZpZ3VyXHUwMEU5ZScpO1xuICBjb25zdCBib2R5OiBhbnkgPSB7IG1vZGVsLCBtZXNzYWdlcywgdGVtcGVyYXR1cmUgfTtcbiAgaWYgKGpzb25Nb2RlKSBib2R5LnJlc3BvbnNlX2Zvcm1hdCA9IHsgdHlwZTogJ2pzb25fb2JqZWN0JyB9O1xuXG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKEdST1FfVVJMLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczogeyAnQXV0aG9yaXphdGlvbic6IGBCZWFyZXIgJHtHUk9RX0FQSV9LRVl9YCwgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuICB9KTtcblxuICBpZiAoIXJlcy5vaykge1xuICAgIGNvbnN0IGVyclR4dCA9IGF3YWl0IHJlcy50ZXh0KCk7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBHcm9xICgke3Jlcy5zdGF0dXN9KTogJHtlcnJUeHQuc2xpY2UoMCwgMTUwKX1gKTtcbiAgfVxuICByZXR1cm4gYXdhaXQgcmVzLmpzb24oKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gY2FsbE9wZW5BSVByb3ZpZGVyKG1lc3NhZ2VzOiBhbnlbXSwganNvbk1vZGU6IGJvb2xlYW4sIG1vZGVsID0gJ2dwdC00by1taW5pJywgdGVtcGVyYXR1cmUgPSAwLjcpIHtcbiAgaWYgKCFPUEVOQUlfQVBJX0tFWSkgdGhyb3cgbmV3IEVycm9yKCdDbFx1MDBFOSBPUEVOQUlfQVBJX0tFWSBub24gY29uZmlndXJcdTAwRTllJyk7XG4gIGNvbnN0IGJvZHk6IGFueSA9IHsgbW9kZWwsIG1lc3NhZ2VzLCB0ZW1wZXJhdHVyZSB9O1xuICBpZiAoanNvbk1vZGUpIGJvZHkucmVzcG9uc2VfZm9ybWF0ID0geyB0eXBlOiAnanNvbl9vYmplY3QnIH07XG5cbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goT1BFTkFJX1VSTCwge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHsgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7T1BFTkFJX0FQSV9LRVl9YCwgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuICB9KTtcblxuICBpZiAoIXJlcy5vaykge1xuICAgIGNvbnN0IGVyclR4dCA9IGF3YWl0IHJlcy50ZXh0KCk7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBPcGVuQUkgKCR7cmVzLnN0YXR1c30pOiAke2VyclR4dC5zbGljZSgwLCAxNTApfWApO1xuICB9XG4gIHJldHVybiBhd2FpdCByZXMuanNvbigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBjYWxsTWlzdHJhbFByb3ZpZGVyKG1lc3NhZ2VzOiBhbnlbXSwganNvbk1vZGU6IGJvb2xlYW4sIG1vZGVsID0gJ21pc3RyYWwtc21hbGwtbGF0ZXN0JywgdGVtcGVyYXR1cmUgPSAwLjcpIHtcbiAgaWYgKCFNSVNUUkFMX0FQSV9LRVkpIHRocm93IG5ldyBFcnJvcignQ2xcdTAwRTkgTUlTVFJBTF9BUElfS0VZIG5vbiBjb25maWd1clx1MDBFOWUnKTtcbiAgY29uc3QgYm9keTogYW55ID0geyBtb2RlbCwgbWVzc2FnZXMsIHRlbXBlcmF0dXJlIH07XG4gIGlmIChqc29uTW9kZSkgYm9keS5yZXNwb25zZV9mb3JtYXQgPSB7IHR5cGU6ICdqc29uX29iamVjdCcgfTtcblxuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChNSVNUUkFMX1VSTCwge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHsgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7TUlTVFJBTF9BUElfS0VZfWAsICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeShib2R5KSxcbiAgfSk7XG5cbiAgaWYgKCFyZXMub2spIHtcbiAgICBjb25zdCBlcnJUeHQgPSBhd2FpdCByZXMudGV4dCgpO1xuICAgIHRocm93IG5ldyBFcnJvcihgTWlzdHJhbCAoJHtyZXMuc3RhdHVzfSk6ICR7ZXJyVHh0LnNsaWNlKDAsIDE1MCl9YCk7XG4gIH1cbiAgcmV0dXJuIGF3YWl0IHJlcy5qc29uKCk7XG59XG5cbi8qKlxuICogTW90ZXVyIGQnYXBwZWwgSUEgbXVsdGktZm91cm5pc3NldXJzIGR5bmFtaXF1ZSBwaWxvdFx1MDBFOSBwYXIgbCdBZG1pbiBNRElWIEJ1c2luZXNzXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGNhbGxMTE0obWVzc2FnZXM6IGFueVtdLCBqc29uTW9kZSA9IGZhbHNlKTogUHJvbWlzZTxhbnk+IHtcbiAgY29uc3QgZGIgPSBsb2FkRGV2RGIoKTtcbiAgY29uc3Qgc2V0dGluZ3MgPSBkYi5haVNldHRpbmdzIHx8IHtcbiAgICBwcmltYXJ5UHJvdmlkZXI6ICdncm9xJyxcbiAgICBncm9xTW9kZWw6ICdxd2VuL3F3ZW4zLjgtMjdiJyxcbiAgICBvcGVuYWlNb2RlbDogJ2dwdC00by1taW5pJyxcbiAgICBtaXN0cmFsTW9kZWw6ICdtaXN0cmFsLXNtYWxsLWxhdGVzdCcsXG4gICAgdGVtcGVyYXR1cmU6IDAuNyxcbiAgICBmYWxsYmFja0VuYWJsZWQ6IHRydWVcbiAgfTtcblxuICBjb25zdCBwcmltYXJ5ID0gc2V0dGluZ3MucHJpbWFyeVByb3ZpZGVyIHx8ICdncm9xJztcbiAgY29uc3QgZmFsbGJhY2sgPSBzZXR0aW5ncy5mYWxsYmFja0VuYWJsZWQgIT09IGZhbHNlO1xuXG4gIC8vIE9yZHJlIGRlcyBmb3Vybmlzc2V1cnMgc2Vsb24gbGEgZFx1MDBFOWNpc2lvbiBkZSBsJ2FkbWluaXN0cmF0ZXVyXG4gIGNvbnN0IHNlcXVlbmNlOiBBcnJheTwnZ3JvcScgfCAnb3BlbmFpJyB8ICdtaXN0cmFsJz4gPSBbXTtcbiAgaWYgKHByaW1hcnkgPT09ICdvcGVuYWknKSB7XG4gICAgc2VxdWVuY2UucHVzaCgnb3BlbmFpJyk7XG4gICAgaWYgKGZhbGxiYWNrKSBzZXF1ZW5jZS5wdXNoKCdncm9xJywgJ21pc3RyYWwnKTtcbiAgfSBlbHNlIGlmIChwcmltYXJ5ID09PSAnbWlzdHJhbCcpIHtcbiAgICBzZXF1ZW5jZS5wdXNoKCdtaXN0cmFsJyk7XG4gICAgaWYgKGZhbGxiYWNrKSBzZXF1ZW5jZS5wdXNoKCdncm9xJywgJ29wZW5haScpO1xuICB9IGVsc2UgaWYgKHByaW1hcnkgPT09ICdncm9xJykge1xuICAgIHNlcXVlbmNlLnB1c2goJ2dyb3EnKTtcbiAgICBpZiAoZmFsbGJhY2spIHNlcXVlbmNlLnB1c2goJ29wZW5haScsICdtaXN0cmFsJyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTW9kZSBhdXRvXG4gICAgc2VxdWVuY2UucHVzaCgnZ3JvcScsICdvcGVuYWknLCAnbWlzdHJhbCcpO1xuICB9XG5cbiAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIGZvciAoY29uc3QgcHJvdiBvZiBzZXF1ZW5jZSkge1xuICAgIHRyeSB7XG4gICAgICBpZiAocHJvdiA9PT0gJ2dyb3EnKSB7XG4gICAgICAgIHJldHVybiBhd2FpdCBjYWxsR3JvcVByb3ZpZGVyKG1lc3NhZ2VzLCBqc29uTW9kZSwgc2V0dGluZ3MuZ3JvcU1vZGVsIHx8ICdxd2VuL3F3ZW4zLjgtMjdiJywgc2V0dGluZ3MudGVtcGVyYXR1cmUgPz8gMC43KTtcbiAgICAgIH1cbiAgICAgIGlmIChwcm92ID09PSAnb3BlbmFpJykge1xuICAgICAgICByZXR1cm4gYXdhaXQgY2FsbE9wZW5BSVByb3ZpZGVyKG1lc3NhZ2VzLCBqc29uTW9kZSwgc2V0dGluZ3Mub3BlbmFpTW9kZWwgfHwgJ2dwdC00by1taW5pJywgc2V0dGluZ3MudGVtcGVyYXR1cmUgPz8gMC43KTtcbiAgICAgIH1cbiAgICAgIGlmIChwcm92ID09PSAnbWlzdHJhbCcpIHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IGNhbGxNaXN0cmFsUHJvdmlkZXIobWVzc2FnZXMsIGpzb25Nb2RlLCBzZXR0aW5ncy5taXN0cmFsTW9kZWwgfHwgJ21pc3RyYWwtc21hbGwtbGF0ZXN0Jywgc2V0dGluZ3MudGVtcGVyYXR1cmUgPz8gMC43KTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgZXJyb3JzLnB1c2goZXJyLm1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcihgVG91cyBsZXMgc2VydmljZXMgSUEgb250IFx1MDBFOWNob3VcdTAwRTkuIERcdTAwRTl0YWlscyA6ICR7ZXJyb3JzLmpvaW4oJyB8ICcpfWApO1xufVxuXG4vKipcbiAqIFBhcnNlciBkZSByZXF1XHUwMEVBdGUgdW5pdmVyc2VsIChKU09OICsgTXVsdGlwYXJ0L0Zvcm0tRGF0YSBhdmVjIGV4dHJhY3Rpb24gZGUgdGV4dGUpXG4gKi9cbmZ1bmN0aW9uIHBhcnNlUmVxdWVzdEJvZHkocmVxOiBodHRwLkluY29taW5nTWVzc2FnZSk6IFByb21pc2U8eyBmaWVsZHM6IFJlY29yZDxzdHJpbmcsIGFueT47IGZpbGVzOiBBcnJheTx7IG5hbWU6IHN0cmluZzsgZmlsZW5hbWU6IHN0cmluZzsgdGV4dDogc3RyaW5nIH0+IH0+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgY29uc3QgY2h1bmtzOiBCdWZmZXJbXSA9IFtdO1xuICAgIHJlcS5vbignZGF0YScsIGNodW5rID0+IHsgY2h1bmtzLnB1c2goQnVmZmVyLmlzQnVmZmVyKGNodW5rKSA/IGNodW5rIDogQnVmZmVyLmZyb20oY2h1bmspKTsgfSk7XG4gICAgcmVxLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICBjb25zdCBidWZmZXIgPSBCdWZmZXIuY29uY2F0KGNodW5rcyk7XG4gICAgICBjb25zdCBjb250ZW50VHlwZSA9IHJlcS5oZWFkZXJzWydjb250ZW50LXR5cGUnXSB8fCAnJztcblxuICAgICAgaWYgKGNvbnRlbnRUeXBlLmluY2x1ZGVzKCdhcHBsaWNhdGlvbi9qc29uJykpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGJ1ZmZlci50b1N0cmluZygndXRmLTgnKSk7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoeyBmaWVsZHM6IHBhcnNlZCwgZmlsZXM6IFtdIH0pO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh7IGZpZWxkczoge30sIGZpbGVzOiBbXSB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoY29udGVudFR5cGUuaW5jbHVkZXMoJ211bHRpcGFydC9mb3JtLWRhdGEnKSkge1xuICAgICAgICBjb25zdCBib3VuZGFyeU1hdGNoID0gY29udGVudFR5cGUubWF0Y2goL2JvdW5kYXJ5PSg/OlwiKFteXCJdKylcInwoW147XSspKS9pKTtcbiAgICAgICAgY29uc3QgYm91bmRhcnkgPSBib3VuZGFyeU1hdGNoID8gKGJvdW5kYXJ5TWF0Y2hbMV0gfHwgYm91bmRhcnlNYXRjaFsyXSkgOiBudWxsO1xuXG4gICAgICAgIGlmIChib3VuZGFyeSkge1xuICAgICAgICAgIGNvbnN0IHJhd1N0cmluZyA9IGJ1ZmZlci50b1N0cmluZygnYmluYXJ5Jyk7XG4gICAgICAgICAgY29uc3QgcGFydHMgPSByYXdTdHJpbmcuc3BsaXQoJy0tJyArIGJvdW5kYXJ5KTtcbiAgICAgICAgICBjb25zdCBmaWVsZHM6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcbiAgICAgICAgICBjb25zdCBmaWxlczogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IGZpbGVuYW1lOiBzdHJpbmc7IHRleHQ6IHN0cmluZyB9PiA9IFtdO1xuXG4gICAgICAgICAgZm9yIChjb25zdCBwYXJ0IG9mIHBhcnRzKSB7XG4gICAgICAgICAgICBpZiAoIXBhcnQgfHwgcGFydC50cmltKCkgPT09ICcnIHx8IHBhcnQudHJpbSgpID09PSAnLS0nKSBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IGhlYWRlckVuZCA9IHBhcnQuaW5kZXhPZignXFxyXFxuXFxyXFxuJyk7XG4gICAgICAgICAgICBpZiAoaGVhZGVyRW5kID09PSAtMSkgY29udGludWU7XG5cbiAgICAgICAgICAgIGNvbnN0IGhlYWRlclBhcnQgPSBwYXJ0LnNsaWNlKDAsIGhlYWRlckVuZCk7XG4gICAgICAgICAgICBjb25zdCBib2R5UGFydCA9IHBhcnQuc2xpY2UoaGVhZGVyRW5kICsgNCkucmVwbGFjZSgvXFxyXFxuJC8sICcnKTtcblxuICAgICAgICAgICAgY29uc3QgbmFtZU1hdGNoID0gaGVhZGVyUGFydC5tYXRjaCgvbmFtZT1cIihbXlwiXSspXCIvaSk7XG4gICAgICAgICAgICBjb25zdCBmaWxlbmFtZU1hdGNoID0gaGVhZGVyUGFydC5tYXRjaCgvZmlsZW5hbWU9XCIoW15cIl0rKVwiL2kpO1xuXG4gICAgICAgICAgICBpZiAobmFtZU1hdGNoKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGZpZWxkTmFtZSA9IG5hbWVNYXRjaFsxXTtcbiAgICAgICAgICAgICAgaWYgKGZpbGVuYW1lTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWxlbmFtZSA9IGZpbGVuYW1lTWF0Y2hbMV07XG4gICAgICAgICAgICAgICAgY29uc3QgdGV4dENvbnRlbnQgPSBCdWZmZXIuZnJvbShib2R5UGFydCwgJ2JpbmFyeScpLnRvU3RyaW5nKCd1dGYtOCcpO1xuICAgICAgICAgICAgICAgIGZpbGVzLnB1c2goeyBuYW1lOiBmaWVsZE5hbWUsIGZpbGVuYW1lLCB0ZXh0OiB0ZXh0Q29udGVudCB9KTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmaWVsZHNbZmllbGROYW1lXSA9IEJ1ZmZlci5mcm9tKGJvZHlQYXJ0LCAnYmluYXJ5JykudG9TdHJpbmcoJ3V0Zi04Jyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoeyBmaWVsZHMsIGZpbGVzIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIEZhbGxiYWNrIGZvcm0gdXJsZW5jb2RlZCBvdSBicnV0XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBzdHIgPSBidWZmZXIudG9TdHJpbmcoJ3V0Zi04Jyk7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoc3RyKTtcbiAgICAgICAgY29uc3QgZmllbGRzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG4gICAgICAgIHBhcmFtcy5mb3JFYWNoKCh2LCBrKSA9PiB7IGZpZWxkc1trXSA9IHY7IH0pO1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSh7IGZpZWxkcywgZmlsZXM6IFtdIH0pO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiByZXNvbHZlKHsgZmllbGRzOiB7fSwgZmlsZXM6IFtdIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cblxuLy8gU3RvcmVzIGVuIG1cdTAwRTltb2lyZSBwb3VyIHBlcnNpc3RlciBsZXMgc2Vzc2lvbnMgZXQgbGVzIHVwbG9hZHMgclx1MDBFOWVscyBlbiBsb2NhbFxuaW50ZXJmYWNlIFN0b3JlZERvYyB7XG4gIGlkOiBzdHJpbmc7XG4gIGRvY3VtZW50TmFtZTogc3RyaW5nO1xuICBtb2RlOiBzdHJpbmc7XG4gIHRleHQ6IHN0cmluZztcbiAgY3JlYXRlZEF0OiBudW1iZXI7XG59XG5jb25zdCBkb2NTdG9yZSA9IG5ldyBNYXA8c3RyaW5nLCBTdG9yZWREb2M+KCk7XG5cbmludGVyZmFjZSBTdG9yZWRNZWV0aW5nIHtcbiAgaWQ6IHN0cmluZztcbiAgdGV4dDogc3RyaW5nO1xuICBmaWxlbmFtZT86IHN0cmluZztcbiAgY3JlYXRlZEF0OiBudW1iZXI7XG59XG5jb25zdCBtZWV0aW5nU3RvcmUgPSBuZXcgTWFwPHN0cmluZywgU3RvcmVkTWVldGluZz4oKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGRldkFwaVBsdWdpbigpOiBQbHVnaW4ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdkZXYtYXBpLXNlcnZlcicsXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcjogVml0ZURldlNlcnZlcikge1xuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShhc3luYyAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgY29uc3QgdXJsT2JqID0gbmV3IFVSTChyZXEudXJsIHx8ICcvJywgJ2h0dHA6Ly9sb2NhbGhvc3Q6ODA4MCcpO1xuICAgICAgICBjb25zdCBwYXRobmFtZSA9IHVybE9iai5wYXRobmFtZTtcblxuICAgICAgICBpZiAoIXBhdGhuYW1lLnN0YXJ0c1dpdGgoJy9hcGkvJykpIHtcbiAgICAgICAgICByZXR1cm4gbmV4dCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsICdHRVQsIFBPU1QsIE9QVElPTlMnKTtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsICdDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb24nKTtcbiAgICAgICAgcmVzLnNldEhlYWRlcignWC1NRElWLU1vZGUnLCBBUFBfTU9ERSk7XG5cbiAgICAgICAgaWYgKHJlcS5tZXRob2QgPT09ICdPUFRJT05TJykge1xuICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gMjA0O1xuICAgICAgICAgIHJldHVybiByZXMuZW5kKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgICAvLyAwLiBDT05GSUdVUkFUSU9OICYgU1dJVENIIERFUyBNT0RcdTAwQzhMRVMgSUEgKFBBTkVMIEFETUlOKVxuICAgICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgICBpZiAocGF0aG5hbWUgPT09ICcvYXBpL2FpX3NldHRpbmdzLnBocCcpIHtcbiAgICAgICAgICAgIGNvbnN0IGRiID0gbG9hZERldkRiKCk7XG4gICAgICAgICAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ0dFVCcpIHtcbiAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgc2V0dGluZ3M6IGRiLmFpU2V0dGluZ3MgfHwge1xuICAgICAgICAgICAgICAgICAgcHJpbWFyeVByb3ZpZGVyOiAnZ3JvcScsXG4gICAgICAgICAgICAgICAgICBncm9xTW9kZWw6ICdxd2VuL3F3ZW4zLjgtMjdiJyxcbiAgICAgICAgICAgICAgICAgIG9wZW5haU1vZGVsOiAnZ3B0LTRvLW1pbmknLFxuICAgICAgICAgICAgICAgICAgbWlzdHJhbE1vZGVsOiAnbWlzdHJhbC1zbWFsbC1sYXRlc3QnLFxuICAgICAgICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAuNyxcbiAgICAgICAgICAgICAgICAgIGZhbGxiYWNrRW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJlcS5tZXRob2QgPT09ICdQT1NUJykge1xuICAgICAgICAgICAgICBjb25zdCB7IGZpZWxkcyB9ID0gYXdhaXQgcGFyc2VSZXF1ZXN0Qm9keShyZXEpO1xuICAgICAgICAgICAgICBjb25zdCBuZXdTZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICBwcmltYXJ5UHJvdmlkZXI6IGZpZWxkcy5wcmltYXJ5UHJvdmlkZXIgfHwgJ2dyb3EnLFxuICAgICAgICAgICAgICAgIGdyb3FNb2RlbDogZmllbGRzLmdyb3FNb2RlbCB8fCAncXdlbi9xd2VuMy44LTI3YicsXG4gICAgICAgICAgICAgICAgb3BlbmFpTW9kZWw6IGZpZWxkcy5vcGVuYWlNb2RlbCB8fCAnZ3B0LTRvLW1pbmknLFxuICAgICAgICAgICAgICAgIG1pc3RyYWxNb2RlbDogZmllbGRzLm1pc3RyYWxNb2RlbCB8fCAnbWlzdHJhbC1zbWFsbC1sYXRlc3QnLFxuICAgICAgICAgICAgICAgIHRlbXBlcmF0dXJlOiB0eXBlb2YgZmllbGRzLnRlbXBlcmF0dXJlID09PSAnbnVtYmVyJyA/IGZpZWxkcy50ZW1wZXJhdHVyZSA6IHBhcnNlRmxvYXQoZmllbGRzLnRlbXBlcmF0dXJlID8/ICcwLjcnKSxcbiAgICAgICAgICAgICAgICBmYWxsYmFja0VuYWJsZWQ6IGZpZWxkcy5mYWxsYmFja0VuYWJsZWQgIT09IGZhbHNlICYmIGZpZWxkcy5mYWxsYmFja0VuYWJsZWQgIT09ICdmYWxzZScsXG4gICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgZGIuYWlTZXR0aW5ncyA9IG5ld1NldHRpbmdzO1xuICAgICAgICAgICAgICBzYXZlRGV2RGIoZGIpO1xuXG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJvZFNldHRpbmdzUGF0aCA9IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAncHVibGljL2FwaS9haV9zZXR0aW5ncy5qc29uJyk7XG4gICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhwcm9kU2V0dGluZ3NQYXRoLCBKU09OLnN0cmluZ2lmeShuZXdTZXR0aW5ncywgbnVsbCwgMiksICd1dGYtOCcpO1xuICAgICAgICAgICAgICB9IGNhdGNoIHt9XG5cbiAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ0NvbmZpZ3VyYXRpb24gSUEgbWlzZSBcdTAwRTAgam91ciBhdmVjIHN1Y2NcdTAwRThzJyxcbiAgICAgICAgICAgICAgICBzZXR0aW5nczogZGIuYWlTZXR0aW5nc1xuICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHBhdGhuYW1lID09PSAnL2FwaS9haV90ZXN0X3Byb3ZpZGVyLnBocCcpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgZmllbGRzIH0gPSBhd2FpdCBwYXJzZVJlcXVlc3RCb2R5KHJlcSk7XG4gICAgICAgICAgICBjb25zdCBwcm92aWRlciA9IGZpZWxkcy5wcm92aWRlciB8fCAnZ3JvcSc7XG4gICAgICAgICAgICBjb25zdCBtb2RlbCA9IGZpZWxkcy5tb2RlbDtcbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHRlc3RNZXNzYWdlcyA9IFtcbiAgICAgICAgICAgICAgeyByb2xlOiAnc3lzdGVtJywgY29udGVudDogJ1R1IGVzIHVuIGFzc2lzdGFudCBkZSB0ZXN0IGRlIGNvbm5lY3Rpdml0XHUwMEU5IE1ESVYgQnVzaW5lc3MuJyB9LFxuICAgICAgICAgICAgICB7IHJvbGU6ICd1c2VyJywgY29udGVudDogJ1JcdTAwRTlwb25kcyB1bmlxdWVtZW50IHBhciBsZSBtb3QgXCJDb25uZWN0XHUwMEU5XCIuJyB9XG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBsZXQgcmVzcG9uc2VDb250ZW50ID0gJyc7XG4gICAgICAgICAgICAgIGlmIChwcm92aWRlciA9PT0gJ2dyb3EnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzR3JvcSA9IGF3YWl0IGNhbGxHcm9xUHJvdmlkZXIodGVzdE1lc3NhZ2VzLCBmYWxzZSwgbW9kZWwgfHwgJ3F3ZW4vcXdlbjMuOC0yN2InLCAwLjEpO1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlQ29udGVudCA9IHJlc0dyb3E/LmNob2ljZXM/LlswXT8ubWVzc2FnZT8uY29udGVudCB8fCAnT0snO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHByb3ZpZGVyID09PSAnb3BlbmFpJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc09wZW5BSSA9IGF3YWl0IGNhbGxPcGVuQUlQcm92aWRlcih0ZXN0TWVzc2FnZXMsIGZhbHNlLCBtb2RlbCB8fCAnZ3B0LTRvLW1pbmknLCAwLjEpO1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlQ29udGVudCA9IHJlc09wZW5BST8uY2hvaWNlcz8uWzBdPy5tZXNzYWdlPy5jb250ZW50IHx8ICdPSyc7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvdmlkZXIgPT09ICdtaXN0cmFsJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc01pc3RyYWwgPSBhd2FpdCBjYWxsTWlzdHJhbFByb3ZpZGVyKHRlc3RNZXNzYWdlcywgZmFsc2UsIG1vZGVsIHx8ICdtaXN0cmFsLXNtYWxsLWxhdGVzdCcsIDAuMSk7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2VDb250ZW50ID0gcmVzTWlzdHJhbD8uY2hvaWNlcz8uWzBdPy5tZXNzYWdlPy5jb250ZW50IHx8ICdPSyc7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGb3Vybmlzc2V1ciAke3Byb3ZpZGVyfSBpbmNvbm51YCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBjb25zdCBsYXRlbmN5ID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZTtcbiAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgcHJvdmlkZXIsXG4gICAgICAgICAgICAgICAgbGF0ZW5jeSxcbiAgICAgICAgICAgICAgICByZXNwb25zZTogcmVzcG9uc2VDb250ZW50LnRyaW0oKVxuICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgICAgICAgICBjb25zdCBsYXRlbmN5ID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZTtcbiAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHByb3ZpZGVyLFxuICAgICAgICAgICAgICAgIGxhdGVuY3ksXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVyci5tZXNzYWdlIHx8ICdFcnJldXIgbG9ycyBkdSB0ZXN0IGR1IGZvdXJuaXNzZXVyJ1xuICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgICAvLyAxLiBSXHUwMEM5U1VNRVVSIERFIERPQ1VNRU5UUyAoVFJBSVRFTUVOVCBSXHUwMEM5RUwgRFUgRE9DVU1FTlQpXG4gICAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAgIGlmIChwYXRobmFtZSA9PT0gJy9hcGkvc3VtbWFyaXplcl91cGxvYWQucGhwJykge1xuICAgICAgICAgICAgY29uc3QgeyBmaWVsZHMsIGZpbGVzIH0gPSBhd2FpdCBwYXJzZVJlcXVlc3RCb2R5KHJlcSk7XG4gICAgICAgICAgICBjb25zdCBpZCA9ICdkb2NfJyArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCAxMCk7XG4gICAgICAgICAgICBjb25zdCBtb2RlID0gZmllbGRzLm1vZGUgfHwgJ3N0YW5kYXJkJztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gUlx1MDBFOWN1cFx1MDBFOXJhdGlvbiByXHUwMEU5ZWxsZSBkdSB0ZXh0ZSA6IHNvaXQgT0NSIGVudm95XHUwMEU5LCBzb2l0IGZpY2hpZXIgdGV4dGUgZFx1MDBFOWNvZFx1MDBFOVxuICAgICAgICAgICAgbGV0IHRleHQgPSBmaWVsZHMuZXh0cmFjdGVkX3RleHQgfHwgJyc7XG4gICAgICAgICAgICBsZXQgZG9jdW1lbnROYW1lID0gJ2RvY3VtZW50LnR4dCc7XG5cbiAgICAgICAgICAgIGlmIChmaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgIGRvY3VtZW50TmFtZSA9IGZpbGVzWzBdLmZpbGVuYW1lO1xuICAgICAgICAgICAgICBpZiAoIXRleHQpIHtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gZmlsZXNbMF0udGV4dDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXRleHQgfHwgdGV4dC50cmltKCkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgIHRleHQgPSBgRG9jdW1lbnQgXHUwMEFCICR7ZG9jdW1lbnROYW1lfSBcdTAwQkIgaW1wb3J0XHUwMEU5IGVuIGF0dGVudGUgZGUgc3ludGhcdTAwRThzZS5gO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkb2NTdG9yZS5zZXQoaWQsIHsgaWQsIGRvY3VtZW50TmFtZSwgbW9kZSwgdGV4dCwgY3JlYXRlZEF0OiBEYXRlLm5vdygpIH0pO1xuXG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICBpZCxcbiAgICAgICAgICAgICAgZG9jdW1lbnROYW1lLFxuICAgICAgICAgICAgICBtb2RlLFxuICAgICAgICAgICAgICBzdGF0dXM6ICd1cGxvYWRlZCdcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAocGF0aG5hbWUgPT09ICcvYXBpL3N1bW1hcml6ZXJfYWdlbnRzLnBocCcpIHtcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICd0ZXh0L2V2ZW50LXN0cmVhbScpO1xuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ2FjaGUtQ29udHJvbCcsICduby1jYWNoZScpO1xuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29ubmVjdGlvbicsICdrZWVwLWFsaXZlJyk7XG5cbiAgICAgICAgICAgIGNvbnN0IHNlbmRFdmVudCA9IChldmVudDogc3RyaW5nLCBkYXRhOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgcmVzLndyaXRlKGBldmVudDogJHtldmVudH1cXG5kYXRhOiAke0pTT04uc3RyaW5naWZ5KGRhdGEpfVxcblxcbmApO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgZG9jSWQgPSB1cmxPYmouc2VhcmNoUGFyYW1zLmdldCgnZG9jX2lkJykgfHwgdXJsT2JqLnNlYXJjaFBhcmFtcy5nZXQoJ2RvY3VtZW50X2lkJykgfHwgJyc7XG4gICAgICAgICAgICBjb25zdCBtb2RlID0gdXJsT2JqLnNlYXJjaFBhcmFtcy5nZXQoJ21vZGUnKSB8fCAnc3RhbmRhcmQnO1xuXG4gICAgICAgICAgICBjb25zdCBzdG9yZWREb2MgPSBkb2NTdG9yZS5nZXQoZG9jSWQpO1xuICAgICAgICAgICAgaWYgKCFzdG9yZWREb2MgfHwgIXN0b3JlZERvYy50ZXh0IHx8IHN0b3JlZERvYy50ZXh0LnRyaW0oKS5sZW5ndGggPCA1KSB7XG4gICAgICAgICAgICAgIHNlbmRFdmVudCgnZXJyb3InLCB7IG1lc3NhZ2U6IFwiQXVjdW4gY29udGVudSB0ZXh0dWVsIHRyb3V2XHUwMEU5IHBvdXIgY2UgZG9jdW1lbnQuIFZldWlsbGV6IGltcG9ydGVyIHVuIGRvY3VtZW50IHZhbGlkZS5cIiB9KTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcy5lbmQoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VuZEV2ZW50KCdhZ2VudF9tZXNzYWdlJywge1xuICAgICAgICAgICAgICBhZ2VudDogJ0FuYWx5c3RlIFN0cnVjdHVyZWwnLFxuICAgICAgICAgICAgICBtZXNzYWdlOiBgTGVjdHVyZSBhcHByb2ZvbmRpZSBkZSBcdTAwQUIgJHtzdG9yZWREb2MuZG9jdW1lbnROYW1lfSBcdTAwQkIgZW4gbW9kZSBcdTAwQUIgJHttb2RlfSBcdTAwQkIuIEV4dHJhY3Rpb24gZGVzIG1cdTAwRTl0cmlxdWVzIGV0IHNlZ21lbnRhdGlvbiB0ZXh0dWVsbGUuLi5gXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2V0VGltZW91dChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgIHNlbmRFdmVudCgnYWdlbnRfbWVzc2FnZScsIHtcbiAgICAgICAgICAgICAgICBhZ2VudDogJ0V4cGVydCBTdHJhdFx1MDBFOWdpZSAmIFJpc3F1ZXMnLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdcdTAwQzl2YWx1YXRpb24gZGVzIGVuamV1eCBjcml0aXF1ZXMsIGRcdTAwRTl0ZWN0aW9uIGRlcyByaXNxdWVzIGV0IGZvcm1hbGlzYXRpb24gZGVzIGFyYml0cmFnZXMgcmVxdWlzLi4uJ1xuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN5c3RlbVByb21wdCA9IGBUdSBlcyB1biBjb25zb3J0aXVtIGRlIGRpcmVjdGV1cnMgZCdlbnRyZXByaXNlIGRlIGhhdXQgbml2ZWF1IChBbmFseXN0ZSBTdHJhdFx1MDBFOWdpcXVlLCBBdWRpdGV1ciBkZXMgUmlzcXVlcywgRGlyZWN0ZXVyIEdcdTAwRTluXHUwMEU5cmFsKS5cblRvbiByXHUwMEY0bGUgZXN0IGRlIGdcdTAwRTluXHUwMEU5cmVyIHVuZSBzeW50aFx1MDBFOHNlIGV4XHUwMEU5Y3V0aXZlIGhhdXQgZGUgZ2FtbWUgZXQgcmlnb3VyZXVzZSBkdSBkb2N1bWVudCBmb3VybmkuXG5MZSBtb2RlIGRlbWFuZFx1MDBFOSBlc3QgOiAke21vZGV9IChleHByZXNzLCBzdGFuZGFyZCwgZGV0YWlsZWQsIGRpcmVjdGlvbiwgY29tZXgpLlxuUlx1MDBDOEdMRSBBQlNPTFVFIDogQmFzZS10b2kgVU5JUVVFTUVOVCBldCBFWENMVVNJVkVNRU5UIHN1ciBsZXMgaW5mb3JtYXRpb25zIHJcdTAwRTllbGxlbWVudCBwclx1MDBFOXNlbnRlcyBkYW5zIGxlIGRvY3VtZW50IGZvdXJuaS5cbk5lIGNpdGUgYXVjdW4gZmFpdCBvdSBjaGlmZnJlIG5vbiBtZW50aW9ublx1MDBFOS5cblR1IGRvaXMgclx1MDBFOXBvbmRyZSBVTklRVUVNRU5UIHBhciB1biBvYmpldCBKU09OIHZhbGlkZSByZXNwZWN0YW50IHJpZ291cmV1c2VtZW50IGNlIHNjaFx1MDBFOW1hIDpcbntcbiAgXCJpZFwiOiBcIiR7ZG9jSWR9XCIsXG4gIFwiZG9jdW1lbnROYW1lXCI6IFwiJHtzdG9yZWREb2MuZG9jdW1lbnROYW1lfVwiLFxuICBcIm1vZGVcIjogXCIke21vZGV9XCIsXG4gIFwiZGF0ZVwiOiBcIiR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF19XCIsXG4gIFwia3Bpc1wiOiB7XG4gICAgXCJyZWFkYWJpbGl0eVNjb3JlXCI6IDg4LFxuICAgIFwicGFnZUNvdW50XCI6IDEsXG4gICAgXCJlc3RpbWF0ZWRUaW1lU2F2ZWRNaW51dGVzXCI6IDM1XG4gIH0sXG4gIFwia2V5d29yZHNcIjogW1wibW90MVwiLCBcIm1vdDJcIiwgXCJtb3QzXCIsIFwibW90NFwiLCBcIm1vdDVcIl0sXG4gIFwibWFqb3JDb25jZXB0c1wiOiBbXCJDb25jZXB0IDFcIiwgXCJDb25jZXB0IDJcIiwgXCJDb25jZXB0IDNcIl0sXG4gIFwiZXhlY3V0aXZlU3VtbWFyeVwiOiBcIlN5bnRoXHUwMEU4c2UgZXhcdTAwRTljdXRpdmUgZFx1MDBFOXRhaWxsXHUwMEU5ZSBldCBwZXJjdXRhbnRlIGJhc1x1MDBFOWUgc3VyIGxlIGRvY3VtZW50Li4uXCIsXG4gIFwib2JqZWN0aXZlc1wiOiBbXCJPYmplY3RpZiAxIGV4dHJhaXQgZHUgZG9jdW1lbnRcIiwgXCJPYmplY3RpZiAyXCJdLFxuICBcImtleVBvaW50c1wiOiBbXCJQb2ludCBjbFx1MDBFOSAxXCIsIFwiUG9pbnQgY2xcdTAwRTkgMlwiLCBcIlBvaW50IGNsXHUwMEU5IDNcIl0sXG4gIFwicmlza3NcIjogW1wiUmlzcXVlIHJcdTAwRTllbCBpZGVudGlmaVx1MDBFOSBkYW5zIGxlIHRleHRlIDFcIiwgXCJSaXNxdWUgclx1MDBFOWVsIDJcIl0sXG4gIFwicmVjb21tZW5kZWRBY3Rpb25zXCI6IFtcbiAgICB7XCJhY3Rpb25cIjogXCJBY3Rpb24gY29uY3JcdTAwRTh0ZSAxXCIsIFwiY29udGV4dFwiOiBcIkp1c3RpZmljYXRpb24gZCdhcHJcdTAwRThzIGxlIHRleHRlXCJ9LFxuICAgIHtcImFjdGlvblwiOiBcIkFjdGlvbiBjb25jclx1MDBFOHRlIDJcIiwgXCJjb250ZXh0XCI6IFwiSnVzdGlmaWNhdGlvbiBkJ2Fwclx1MDBFOHMgbGUgdGV4dGVcIn1cbiAgXSxcbiAgXCJkZWNpc2lvbnNcIjogW1wiRFx1MDBFOWNpc2lvbiAxIFx1MDBFMCBhY3RlclwiLCBcIkRcdTAwRTljaXNpb24gMlwiXSxcbiAgXCJkZWFkbGluZXNcIjogW1wiXHUwMEM5Y2hcdTAwRTlhbmNlIDFcIiwgXCJcdTAwQzljaFx1MDBFOWFuY2UgMlwiXSxcbiAgXCJzdGFrZWhvbGRlcnNcIjogW1wiUGFydGllIHByZW5hbnRlIDFcIiwgXCJQYXJ0aWUgcHJlbmFudGUgMlwiXVxufWA7XG5cbiAgICAgICAgICAgICAgICBjb25zdCB1c2VyUHJvbXB0ID0gYFZvaWNpIGxlIGNvbnRlbnUgaW50XHUwMEU5Z3JhbCBkdSBkb2N1bWVudCBcdTAwRTAgYW5hbHlzZXIgOlxcblxcbiR7c3RvcmVkRG9jLnRleHQuc2xpY2UoMCwgODAwMCl9XFxuXFxuR1x1MDBFOW5cdTAwRThyZSBsZSByYXBwb3J0IEpTT04gZCdhbmFseXNlIGRcdTAwRTljaXNpb25uZWxsZS5gO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgZ3JvcVJlcyA9IGF3YWl0IGNhbGxMTE0oW1xuICAgICAgICAgICAgICAgICAgeyByb2xlOiAnc3lzdGVtJywgY29udGVudDogc3lzdGVtUHJvbXB0IH0sXG4gICAgICAgICAgICAgICAgICB7IHJvbGU6ICd1c2VyJywgY29udGVudDogdXNlclByb21wdCB9XG4gICAgICAgICAgICAgICAgXSwgdHJ1ZSk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gZ3JvcVJlcy5jaG9pY2VzWzBdLm1lc3NhZ2UuY29udGVudDtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIHNlbmRFdmVudCgnY29tcGxldGUnLCBwYXJzZWQpO1xuICAgICAgICAgICAgICAgIHJlcy5lbmQoKTtcbiAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICAgICAgICAgICAgICBzZW5kRXZlbnQoJ2Vycm9yJywgeyBtZXNzYWdlOiBlcnIubWVzc2FnZSB8fCBcIkVycmV1ciBsb3JzIGRlIGwnYW5hbHlzZSBkdSBkb2N1bWVudC5cIiB9KTtcbiAgICAgICAgICAgICAgICByZXMuZW5kKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIDYwMCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAgIC8vIDIuIENPTVBURVMtUkVORFVTIERFIFJcdTAwQzlVTklPTiBJQSAoQU5BTFlTRSBSXHUwMEM5RUxMRSBERVMgTk9URVMpXG4gICAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAgIGlmIChwYXRobmFtZSA9PT0gJy9hcGkvbWVldGluZ191cGxvYWQucGhwJykge1xuICAgICAgICAgICAgY29uc3QgeyBmaWVsZHMsIGZpbGVzIH0gPSBhd2FpdCBwYXJzZVJlcXVlc3RCb2R5KHJlcSk7XG4gICAgICAgICAgICBsZXQgcmF3VGV4dCA9IGZpZWxkcy5yYXdfdGV4dCB8fCAnJztcbiAgICAgICAgICAgIGxldCBmaWxlbmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICBpZiAoZmlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICBmaWxlbmFtZSA9IGZpbGVzWzBdLmZpbGVuYW1lO1xuICAgICAgICAgICAgICBpZiAoIXJhd1RleHQpIHJhd1RleHQgPSBmaWxlc1swXS50ZXh0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXJhd1RleHQgfHwgcmF3VGV4dC50cmltKCkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDAwO1xuICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgICByZXR1cm4gcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBcIkF1Y3VuIHRleHRlIG91IGZpY2hpZXIgZGUgclx1MDBFOXVuaW9uIGZvdXJuaS5cIiB9KSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGlkID0gJ21lZXRfJyArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCA4KTtcbiAgICAgICAgICAgIG1lZXRpbmdTdG9yZS5zZXQoaWQsIHsgaWQsIHRleHQ6IHJhd1RleHQsIGZpbGVuYW1lLCBjcmVhdGVkQXQ6IERhdGUubm93KCkgfSk7XG5cbiAgICAgICAgICAgIC8vIEFuYWx5c2UgSUEgaW1tXHUwMEU5ZGlhdGUgcG91ciBjb21wYXRpYmlsaXRcdTAwRTlcbiAgICAgICAgICAgIGNvbnN0IGdyb3FSZXMgPSBhd2FpdCBjYWxsTExNKFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJvbGU6ICdzeXN0ZW0nLFxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBUdSBlcyB1biBzZWNyXHUwMEU5dGFpcmUgZGUgc1x1MDBFOWFuY2UgZXhcdTAwRTljdXRpZiBkJ2VudHJlcHJpc2UuXG5BbmFseXNlIFVOSVFVRU1FTlQgbGVzIG5vdGVzIGRlIHJcdTAwRTl1bmlvbiBmb3VybmllcyBjaS1kZXNzb3VzLlxuUlx1MDBDOEdMRVMgU1RSSUNURVMgOlxuMS4gU2kgdW4gcmVzcG9uc2FibGUgbidlc3QgcGFzIGV4cGxpY2l0ZW1lbnQgbWVudGlvbm5cdTAwRTkgcG91ciB1bmUgYWN0aW9uLCBpbmRpcXVlIFwiTm9uIGFzc2lnblx1MDBFOVwiLlxuMi4gU2kgdW5lIFx1MDBFOWNoXHUwMEU5YW5jZSBuJ2VzdCBwYXMgc3BcdTAwRTljaWZpXHUwMEU5ZSwgaW5kaXF1ZSBcIlx1MDBDMCBkXHUwMEU5dGVybWluZXJcIi5cbjMuIE5lIGphbWFpcyBpbnZlbnRlciBkZSBwYXJ0aWNpcGFudHMgZmljdGlmcy5cblJcdTAwRTlwb25kcyBVTklRVUVNRU5UIGVuIEpTT04gc3RyaWN0IDpcbntcbiAgXCJpZFwiOiBcIiR7aWR9XCIsXG4gIFwiZGF0ZVwiOiBcIiR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF19XCIsXG4gIFwic3ViamVjdFwiOiBcIk9iamV0IHByXHUwMEU5Y2lzIGRcdTAwRTlkdWl0IGRlcyBub3Rlc1wiLFxuICBcInBhcnRpY2lwYW50c1wiOiBbXCJQYXJ0aWNpcGFudCByXHUwMEU5ZWwgMVwiLCBcIlBhcnRpY2lwYW50IDJcIl0sXG4gIFwiYWdlbmRhXCI6IFtcIlBvaW50IGFib3JkXHUwMEU5IDFcIiwgXCJQb2ludCBhYm9yZFx1MDBFOSAyXCJdLFxuICBcImV4ZWN1dGl2ZVN1bW1hcnlcIjogXCJTeW50aFx1MDBFOHNlIGZpZFx1MDBFOGxlIGRlcyBcdTAwRTljaGFuZ2VzLi4uXCIsXG4gIFwiZGVjaXNpb25zXCI6IFtcbiAgICB7XCJkZWNpc2lvblwiOiBcIkRcdTAwRTljaXNpb24gYWN0XHUwMEU5ZVwiLCBcImNvbnRleHRcIjogXCJDb250ZXh0ZVwifVxuICBdLFxuICBcImFjdGlvbnNcIjogW1xuICAgIHtcInRhc2tcIjogXCJUXHUwMEUyY2hlIGNvbmNyXHUwMEU4dGVcIiwgXCJhc3NpZ25lZVwiOiBcIlBlcnNvbm5lIGRcdTAwRTlzaWduXHUwMEU5ZSBvdSBOb24gYXNzaWduXHUwMEU5XCIsIFwiZGVhZGxpbmVcIjogXCJEYXRlIG91IFx1MDBDMCBkXHUwMEU5dGVybWluZXJcIiwgXCJzdGF0dXNcIjogXCJwZW5kaW5nXCJ9XG4gIF0sXG4gIFwicmlza3NcIjogW1xuICAgIHtcInJpc2tcIjogXCJSaXNxdWUgc291bGV2XHUwMEU5IGxvcnMgZGUgbGEgclx1MDBFOXVuaW9uXCIsIFwiaW1wYWN0XCI6IFwiTWVkaXVtXCJ9XG4gIF1cbn1gXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHsgcm9sZTogJ3VzZXInLCBjb250ZW50OiBgTm90ZXMgZGUgbGEgclx1MDBFOXVuaW9uIDpcXG5cXG4ke3Jhd1RleHQuc2xpY2UoMCwgNjAwMCl9YCB9XG4gICAgICAgICAgICBdLCB0cnVlKTtcblxuICAgICAgICAgICAgY29uc3QgcmVwb3J0ID0gSlNPTi5wYXJzZShncm9xUmVzLmNob2ljZXNbMF0ubWVzc2FnZS5jb250ZW50KTtcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgICByZXR1cm4gcmVzLmVuZChKU09OLnN0cmluZ2lmeShyZXBvcnQpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAocGF0aG5hbWUgPT09ICcvYXBpL21lZXRpbmdfYWdlbnRzLnBocCcpIHtcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICd0ZXh0L2V2ZW50LXN0cmVhbScpO1xuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ2FjaGUtQ29udHJvbCcsICduby1jYWNoZScpO1xuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29ubmVjdGlvbicsICdrZWVwLWFsaXZlJyk7XG5cbiAgICAgICAgICAgIGNvbnN0IHNlbmRFdmVudCA9IChldmVudDogc3RyaW5nLCBkYXRhOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgcmVzLndyaXRlKGBldmVudDogJHtldmVudH1cXG5kYXRhOiAke0pTT04uc3RyaW5naWZ5KGRhdGEpfVxcblxcbmApO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgY29udGV4dFJhdyA9IHVybE9iai5zZWFyY2hQYXJhbXMuZ2V0KCdjb250ZXh0JykgfHwgJyc7XG4gICAgICAgICAgICBsZXQgbWVldGluZ1RleHQgPSAnJztcblxuICAgICAgICAgICAgaWYgKG1lZXRpbmdTdG9yZS5oYXMoY29udGV4dFJhdykpIHtcbiAgICAgICAgICAgICAgbWVldGluZ1RleHQgPSBtZWV0aW5nU3RvcmUuZ2V0KGNvbnRleHRSYXcpIS50ZXh0O1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjb250ZXh0UmF3Lmxlbmd0aCA+IDUpIHtcbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBtZWV0aW5nVGV4dCA9IGRlY29kZVVSSUNvbXBvbmVudChjb250ZXh0UmF3KTtcbiAgICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgbWVldGluZ1RleHQgPSBjb250ZXh0UmF3O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghbWVldGluZ1RleHQgfHwgbWVldGluZ1RleHQudHJpbSgpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICBzZW5kRXZlbnQoJ2Vycm9yJywgeyBtZXNzYWdlOiBcIkF1Y3VuIGNvbnRlbnUgZGUgclx1MDBFOXVuaW9uIGZvdXJuaSBwb3VyIGFuYWx5c2UuXCIgfSk7XG4gICAgICAgICAgICAgIHJldHVybiByZXMuZW5kKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlbmRFdmVudCgnYWdlbnRfbWVzc2FnZScsIHtcbiAgICAgICAgICAgICAgYWdlbnQ6ICdTZWNyXHUwMEU5dGFpcmUgZGUgc1x1MDBFOWFuY2UgSUEnLFxuICAgICAgICAgICAgICBtZXNzYWdlOiBcIkFuYWx5c2UgZHUgdmVyYmF0aW0gZGUgbGEgclx1MDBFOXVuaW9uLCBpZGVudGlmaWNhdGlvbiBkZXMgaW50ZXJ2ZW5hbnRzIGV0IHN0cnVjdHVyYXRpb24gZGUgbCdvcmRyZSBkdSBqb3VyLi4uXCJcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgc2VuZEV2ZW50KCdhZ2VudF9tZXNzYWdlJywge1xuICAgICAgICAgICAgICAgIGFnZW50OiAnQXVkaXRldXIgZGVzIERcdTAwRTljaXNpb25zJyxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIkV4dHJhY3Rpb24gZGVzIGFyYml0cmFnZXMgZmVybWVzLCBhZmZlY3RhdGlvbiBkZXMgbGl2cmFibGVzIGV0IGNvbnNvbGlkYXRpb24gZGVzIHJpc3F1ZXMuLi5cIlxuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGdyb3FSZXMgPSBhd2FpdCBjYWxsTExNKFtcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcm9sZTogJ3N5c3RlbScsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBUdSBlcyB1biBzZWNyXHUwMEU5dGFpcmUgZGUgc1x1MDBFOWFuY2UgZGUgaGF1dCBuaXZlYXUgcG91ciBNRElWIEJ1c2luZXNzLlxuQW5hbHlzZSBmaWRcdTAwRThsZW1lbnQgbGVzIG5vdGVzIGRlIHJcdTAwRTl1bmlvbiB0cmFuc21pc2VzLlxuUlx1MDBDOEdMRVMgQUJTT0xVRVMgOlxuLSBOJ2ludmVudGUgYXVjdW4gcGFydGljaXBhbnQgbm9uIGNpdFx1MDBFOS4gU2kgYXVjdW4gbidlc3QgY2l0XHUwMEU5LCBtZXRzIFtcIlBhcnRpY2lwYW50cyBcdTAwRTAgbGEgclx1MDBFOXVuaW9uXCJdLlxuLSBTaSB1biByZXNwb25zYWJsZSBuJ2VzdCBwYXMgc3BcdTAwRTljaWZpXHUwMEU5IHBvdXIgdW5lIHRcdTAwRTJjaGUsIG1ldHMgXCJOb24gYXNzaWduXHUwMEU5XCIuXG4tIFNpIHVuZSBkZWFkbGluZSBuJ2VzdCBwYXMgY2l0XHUwMEU5ZSwgbWV0cyBcIlx1MDBDMCBjb252ZW5pclwiLlxuUlx1MDBFOXBvbmRzIFVOSVFVRU1FTlQgcGFyIGNlIHNjaFx1MDBFOW1hIEpTT04gOlxue1xuICBcImlkXCI6IFwibWVldF8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCA4KX1cIixcbiAgXCJkYXRlXCI6IFwiJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXX1cIixcbiAgXCJzdWJqZWN0XCI6IFwiT2JqZXQgcHJcdTAwRTljaXMgZFx1MDBFOWR1aXQgZGVzIG5vdGVzXCIsXG4gIFwicGFydGljaXBhbnRzXCI6IFtcIi4uLlwiXSxcbiAgXCJhZ2VuZGFcIjogW1wiUG9pbnQgMVwiLCBcIlBvaW50IDJcIl0sXG4gIFwiZXhlY3V0aXZlU3VtbWFyeVwiOiBcIlN5bnRoXHUwMEU4c2UgZmlkXHUwMEU4bGUuLi5cIixcbiAgXCJkZWNpc2lvbnNcIjogW1xuICAgIHtcImRlY2lzaW9uXCI6IFwiRFx1MDBFOWNpc2lvbiBhY3RcdTAwRTllXCIsIFwiY29udGV4dFwiOiBcIkNvbnRleHRlXCJ9XG4gIF0sXG4gIFwiYWN0aW9uc1wiOiBbXG4gICAge1widGFza1wiOiBcIkFjdGlvbiBcdTAwRTAgbWVuZXJcIiwgXCJhc3NpZ25lZVwiOiBcIlJlc3BvbnNhYmxlIHJcdTAwRTllbCBvdSBOb24gYXNzaWduXHUwMEU5XCIsIFwiZGVhZGxpbmVcIjogXCJEYXRlIG91IFx1MDBDMCBjb252ZW5pclwiLCBcInN0YXR1c1wiOiBcInBlbmRpbmdcIn1cbiAgXSxcbiAgXCJyaXNrc1wiOiBbXG4gICAge1wicmlza1wiOiBcIlBvaW50IGRlIHZpZ2lsYW5jZVwiLCBcImltcGFjdFwiOiBcIk1lZGl1bVwifVxuICBdXG59YFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHsgcm9sZTogJ3VzZXInLCBjb250ZW50OiBgQ29udGVudSByXHUwMEU5ZWwgZGVzIG5vdGVzIGRlIHJcdTAwRTl1bmlvbiA6XFxuXFxuJHttZWV0aW5nVGV4dC5zbGljZSgwLCA2MDAwKX1gIH1cbiAgICAgICAgICAgICAgICBdLCB0cnVlKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHJlcG9ydCA9IEpTT04ucGFyc2UoZ3JvcVJlcy5jaG9pY2VzWzBdLm1lc3NhZ2UuY29udGVudCk7XG4gICAgICAgICAgICAgICAgc2VuZEV2ZW50KCdjb21wbGV0ZScsIHJlcG9ydCk7XG4gICAgICAgICAgICAgICAgcmVzLmVuZCgpO1xuICAgICAgICAgICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgICAgICAgICAgIHNlbmRFdmVudCgnZXJyb3InLCB7IG1lc3NhZ2U6IGVyci5tZXNzYWdlIHx8IFwiRXJyZXVyIGRlIHRyYWl0ZW1lbnQgSUEgZHUgY29tcHRlLXJlbmR1LlwiIH0pO1xuICAgICAgICAgICAgICAgIHJlcy5lbmQoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgNjAwKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgICAgLy8gMy4gRElBR05PU1RJQyBJQSBFWFBSRVNTIChTQ09SRSAmIFNZTlRIXHUwMEM4U0UgQ0FMQ1VMXHUwMEM5UyBTVVIgTEVTIFJcdTAwQzlQT05TRVMpXG4gICAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAgIGlmIChwYXRobmFtZSA9PT0gJy9hcGkvZGlhZ25vc3RpY19zdGVwLnBocCcpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgZmllbGRzIH0gPSBhd2FpdCBwYXJzZVJlcXVlc3RCb2R5KHJlcSk7XG4gICAgICAgICAgICBjb25zdCBoaXN0b3J5ID0gZmllbGRzLmhpc3RvcnkgfHwgW107XG5cbiAgICAgICAgICAgIGNvbnN0IGdyb3FSZXMgPSBhd2FpdCBjYWxsTExNKFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJvbGU6ICdzeXN0ZW0nLFxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBUdSBlcyBsJ2FuYWx5c3RlIHN0cmF0XHUwMEU5Z2lxdWUgZGUgZGlhZ25vc3RpYyBkJ2VudHJlcHJpc2UgTURJViBCdXNpbmVzcy5cblx1MDBDMCBwYXJ0aXIgZGVzIHJcdTAwRTlwb25zZXMgcHJcdTAwRTljXHUwMEU5ZGVudGVzIGRlIGwndXRpbGlzYXRldXIsIGdcdTAwRTluXHUwMEU4cmUgbGEgcHJvY2hhaW5lIHF1ZXN0aW9uIGQnXHUwMEU5dmFsdWF0aW9uIGRpYWdub3N0aXF1ZSBhZGFwdFx1MDBFOWUgXHUwMEUwIHNvbiBzZWN0ZXVyIGV0IHNlcyBkXHUwMEU5ZmlzLlxuUlx1MDBFOXBvbmRzIGVuIEpTT04gc3RyaWN0IDpcbntcbiAgXCJxdWVzdGlvblwiOiBcIlF1ZXN0aW9uIHN0cmF0XHUwMEU5Z2lxdWUgcHJcdTAwRTljaXNlIHBvc1x1MDBFOWUgYXUgZGlyaWdlYW50ID9cIixcbiAgXCJvcHRpb25zXCI6IFtcIk9wdGlvbiBjb25jclx1MDBFOHRlIDFcIiwgXCJPcHRpb24gY29uY3JcdTAwRTh0ZSAyXCIsIFwiT3B0aW9uIGNvbmNyXHUwMEU4dGUgM1wiLCBcIk9wdGlvbiBjb25jclx1MDBFOHRlIDRcIl0sXG4gIFwidG90YWxfcXVlc3Rpb25zXCI6IDVcbn1gXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHsgcm9sZTogJ3VzZXInLCBjb250ZW50OiBgSGlzdG9yaXF1ZSBkZXMgclx1MDBFOXBvbnNlcyBwclx1MDBFOWNcdTAwRTlkZW50ZXMgOiAke0pTT04uc3RyaW5naWZ5KGhpc3RvcnkpfWAgfVxuICAgICAgICAgICAgXSwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgICByZXR1cm4gcmVzLmVuZChncm9xUmVzLmNob2ljZXNbMF0ubWVzc2FnZS5jb250ZW50KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAocGF0aG5hbWUgPT09ICcvYXBpL2RpYWdub3N0aWNfYWdlbnRzLnBocCcpIHtcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICd0ZXh0L2V2ZW50LXN0cmVhbScpO1xuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ2FjaGUtQ29udHJvbCcsICduby1jYWNoZScpO1xuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29ubmVjdGlvbicsICdrZWVwLWFsaXZlJyk7XG5cbiAgICAgICAgICAgIGNvbnN0IHNlbmRFdmVudCA9IChldmVudDogc3RyaW5nLCBkYXRhOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgcmVzLndyaXRlKGBldmVudDogJHtldmVudH1cXG5kYXRhOiAke0pTT04uc3RyaW5naWZ5KGRhdGEpfVxcblxcbmApO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgY29udGV4dFJhdyA9IHVybE9iai5zZWFyY2hQYXJhbXMuZ2V0KCdjb250ZXh0JykgfHwgdXJsT2JqLnNlYXJjaFBhcmFtcy5nZXQoJ3Byb2ZpbGUnKSB8fCB1cmxPYmouc2VhcmNoUGFyYW1zLmdldCgnYW5zd2VycycpIHx8ICcnO1xuICAgICAgICAgICAgbGV0IHVzZXJDb250ZXh0ID0gY29udGV4dFJhdztcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIHVzZXJDb250ZXh0ID0gZGVjb2RlVVJJQ29tcG9uZW50KGNvbnRleHRSYXcpO1xuICAgICAgICAgICAgfSBjYXRjaCB7fVxuXG4gICAgICAgICAgICBzZW5kRXZlbnQoJ2FnZW50X21lc3NhZ2UnLCB7XG4gICAgICAgICAgICAgIGFnZW50OiAnQ29uc3VsdGFudCBTdHJhdFx1MDBFOWdpZScsXG4gICAgICAgICAgICAgIG1lc3NhZ2U6IFwiQW5hbHlzZSBkZSB2b3Mgclx1MDBFOXBvbnNlcyBldCBwcm9maWwgZCdhY3Rpdml0XHUwMEU5LiBcdTAwQzl2YWx1YXRpb24gZGVzIGxldmllcnMgZGUgcmVudGFiaWxpdFx1MDBFOS4uLlwiXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2V0VGltZW91dChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgIHNlbmRFdmVudCgnYWdlbnRfbWVzc2FnZScsIHtcbiAgICAgICAgICAgICAgICBhZ2VudDogJ0V4cGVydCBBdXRvbWF0aXNhdGlvbicsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJDYWxjdWwgZGVzIGdhaW5zIHBvdGVudGllbHMgZXQgc1x1MDBFOWxlY3Rpb24gZGVzIGNhcyBkJ3VzYWdlIElBIHByaW9yaXRhaXJlcy4uLlwiXG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8gQ2FsY3VsIG9iamVjdGlmIGR1IHNjb3JlIGJhc1x1MDBFOSBzdXIgbGVzIG1vdHMgY2xcdTAwRTlzIGRlcyByXHUwMEU5cG9uc2VzXG4gICAgICAgICAgICAgICAgY29uc3QgdGV4dExvd2VyID0gdXNlckNvbnRleHQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICBsZXQgc2NvcmUgPSA1MDsgLy8gQmFzZSBuZXV0cmVcblxuICAgICAgICAgICAgICAgIC8vIEluZGljYXRldXJzIHBvc2l0aWZzIGRlIG1hdHVyaXRcdTAwRTlcbiAgICAgICAgICAgICAgICBpZiAodGV4dExvd2VyLmluY2x1ZGVzKCdjcm0nKSB8fCB0ZXh0TG93ZXIuaW5jbHVkZXMoJ2Nsb3VkJykgfHwgdGV4dExvd2VyLmluY2x1ZGVzKCdvdXRpbCcpKSBzY29yZSArPSAxMDtcbiAgICAgICAgICAgICAgICBpZiAodGV4dExvd2VyLmluY2x1ZGVzKCdpYScpIHx8IHRleHRMb3dlci5pbmNsdWRlcygnYXV0b21hdGlzYXRpb24nKSB8fCB0ZXh0TG93ZXIuaW5jbHVkZXMoJ2RpZ2l0YWwnKSkgc2NvcmUgKz0gMTA7XG4gICAgICAgICAgICAgICAgaWYgKHRleHRMb3dlci5pbmNsdWRlcygnZFx1MDBFOWpcdTAwRTAnKSB8fCB0ZXh0TG93ZXIuaW5jbHVkZXMoJ1x1MDBFOXF1aXBlJykgfHwgdGV4dExvd2VyLmluY2x1ZGVzKCdzaXRlIHdlYicpKSBzY29yZSArPSA1O1xuXG4gICAgICAgICAgICAgICAgLy8gSW5kaWNhdGV1cnMgZGUgcmV0YXJkIC8gZnJpY3Rpb25cbiAgICAgICAgICAgICAgICBpZiAodGV4dExvd2VyLmluY2x1ZGVzKCdwYXBpZXInKSB8fCB0ZXh0TG93ZXIuaW5jbHVkZXMoJ21hbnVlbCcpIHx8IHRleHRMb3dlci5pbmNsdWRlcygncmV0YXJkJykpIHNjb3JlIC09IDE1O1xuICAgICAgICAgICAgICAgIGlmICh0ZXh0TG93ZXIuaW5jbHVkZXMoJ2F1Y3VuJykgfHwgdGV4dExvd2VyLmluY2x1ZGVzKCdwZXJ0ZSBkZSB0ZW1wcycpIHx8IHRleHRMb3dlci5pbmNsdWRlcygnZGlmZmljaWxlJykpIHNjb3JlIC09IDEwO1xuICAgICAgICAgICAgICAgIGlmICh0ZXh0TG93ZXIuaW5jbHVkZXMoJ2V4Y2VsJykgfHwgdGV4dExvd2VyLmluY2x1ZGVzKCdkXHUwMEU5cGFzc1x1MDBFOScpKSBzY29yZSAtPSA1O1xuXG4gICAgICAgICAgICAgICAgc2NvcmUgPSBNYXRoLm1heCgyNSwgTWF0aC5taW4oOTUsIHNjb3JlKSk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBncm9xUmVzID0gYXdhaXQgY2FsbExMTShbXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJvbGU6ICdzeXN0ZW0nLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBgVHUgZXMgdW4gY29uc29ydGl1bSBkJ2F1ZGl0ZXVycyBkZSBkaXJlY3Rpb24gZ1x1MDBFOW5cdTAwRTlyYWxlIE1ESVYgQnVzaW5lc3MuXG5SXHUwMEU5ZGlnZSBsZSByYXBwb3J0IGQnYXVkaXQgZmluYWwgcGVyc29ubmFsaXNcdTAwRTkgYmFzXHUwMEU5IFNUUklDVEVNRU5UIHN1ciBsZXMgclx1MDBFOXBvbnNlcyBkb25uXHUwMEU5ZXMgcGFyIGxlIGRpcmlnZWFudC5cbkxlIHNjb3JlIGRlIG1hdHVyaXRcdTAwRTkgY2FsY3VsXHUwMEU5IGVzdCBkZSAke3Njb3JlfS8xMDAuXG5UdSBkb2lzIHJcdTAwRTlwb25kcmUgVU5JUVVFTUVOVCBlbiBKU09OIHN0cmljdCBhdmVjIGNlIHNjaFx1MDBFOW1hIDpcbntcbiAgXCJzY29yZVwiOiAke3Njb3JlfSxcbiAgXCJzeW50aGVzaXNcIjogXCJTeW50aFx1MDBFOHNlIHBlcnNvbm5hbGlzXHUwMEU5ZSBkJ2Fwclx1MDBFOHMgbGVzIHJcdTAwRTlwb25zZXMgZHUgZGlyaWdlYW50ICgzIHBocmFzZXMgY29uY3JcdTAwRTh0ZXMpLlwiLFxuICBcImRlZHVjZWRfaW5zaWdodHNcIjogW1xuICAgIFwiQ29uc3RhdCBwclx1MDBFOWNpcyAxIGRcdTAwRTljb3VsYW50IGRpcmVjdGVtZW50IGRlIHNlcyByXHUwMEU5cG9uc2VzXCIsXG4gICAgXCJPcHBvcnR1bml0XHUwMEU5IGQnYW1cdTAwRTlsaW9yYXRpb24gY29uY3JcdTAwRTh0ZSAyXCJcbiAgXSxcbiAgXCJyZWNvbW1lbmRhdGlvbnNcIjogW1xuICAgIHtcbiAgICAgIFwidG9vbF9uYW1lXCI6IFwiTm9tIGRlIHNvbHV0aW9uIGFkYXB0XHUwMEU5ZVwiLFxuICAgICAgXCJjYXRlZ29yeVwiOiBcIkRvbWFpbmUgbVx1MDBFOXRpZXJcIixcbiAgICAgIFwicmVhc29uXCI6IFwiUG91cnF1b2kgYydlc3QgcHJpb3JpdGFpcmUgZCdhcHJcdTAwRThzIHNlcyBkXHUwMEU5Y2xhcmF0aW9uc1wiLFxuICAgICAgXCJob3dfdG9fc3RhcnRcIjogXCJBY3Rpb24gY29uY3JcdTAwRTh0ZSBcdTAwRTAgbGFuY2VyIGNldHRlIHNlbWFpbmVcIlxuICAgIH1cbiAgXVxufWBcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB7IHJvbGU6ICd1c2VyJywgY29udGVudDogYFJcdTAwRTlwb25zZXMgZXQgcHJvZmlsIGRlIGwnZW50cmVwcmlzZSA6XFxuXFxuJHt1c2VyQ29udGV4dC5zbGljZSgwLCA0MDAwKX1gIH1cbiAgICAgICAgICAgICAgICBdLCB0cnVlKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHJlcG9ydCA9IEpTT04ucGFyc2UoZ3JvcVJlcy5jaG9pY2VzWzBdLm1lc3NhZ2UuY29udGVudCk7XG4gICAgICAgICAgICAgICAgc2VuZEV2ZW50KCdjb21wbGV0ZScsIHJlcG9ydCk7XG4gICAgICAgICAgICAgICAgcmVzLmVuZCgpO1xuICAgICAgICAgICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgICAgICAgICAgIHNlbmRFdmVudCgnZXJyb3InLCB7IG1lc3NhZ2U6IGVyci5tZXNzYWdlIHx8IFwiRXJyZXVyIGxvcnMgZGUgbGEgZ1x1MDBFOW5cdTAwRTlyYXRpb24gZHUgZGlhZ25vc3RpYy5cIiB9KTtcbiAgICAgICAgICAgICAgICByZXMuZW5kKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIDYwMCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAgIC8vIDQuIFZcdTAwQzlSSUZJQ0FURVVSIERFIEZBQ1RVUkVTIElBIChWUkFJRSBBTkFMWVNFIERFUyBMSUdORVMgJiBDQUxDVUxTKVxuICAgICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgICBpZiAocGF0aG5hbWUgPT09ICcvYXBpL2ludm9pY2VfYWlfY2hlY2sucGhwJykge1xuICAgICAgICAgICAgY29uc3QgeyBmaWVsZHMgfSA9IGF3YWl0IHBhcnNlUmVxdWVzdEJvZHkocmVxKTtcbiAgICAgICAgICAgIGNvbnN0IGludm9pY2VOdW1iZXIgPSBmaWVsZHMuaW52b2ljZU51bWJlciB8fCAnRmFjdHVyZSBzYW5zIG51bVx1MDBFOXJvJztcbiAgICAgICAgICAgIGNvbnN0IGxpbmVzOiBhbnlbXSA9IEFycmF5LmlzQXJyYXkoZmllbGRzLmxpbmVzKSA/IGZpZWxkcy5saW5lcyA6IFtdO1xuXG4gICAgICAgICAgICAvLyBDYWxjdWwgYXJpdGhtXHUwMEU5dGlxdWUgcHJcdTAwRTljaXMgZGVzIGxpZ25lc1xuICAgICAgICAgICAgY29uc3QgY2FsY0hUID0gbGluZXMucmVkdWNlKChhY2MsIGwpID0+IGFjYyArICgoTnVtYmVyKGwucXVhbnRpdHkpIHx8IDEpICogKE51bWJlcihsLnVuaXRQcmljZUhUKSB8fCAwKSAqICgxIC0gKE51bWJlcihsLmRpc2NvdW50UGVyY2VudGFnZSkgfHwgMCkgLyAxMDApKSwgMCk7XG4gICAgICAgICAgICBjb25zdCBjYWxjVkFUID0gbGluZXMucmVkdWNlKChhY2MsIGwpID0+IGFjYyArICgoTnVtYmVyKGwucXVhbnRpdHkpIHx8IDEpICogKE51bWJlcihsLnVuaXRQcmljZUhUKSB8fCAwKSAqICgxIC0gKE51bWJlcihsLmRpc2NvdW50UGVyY2VudGFnZSkgfHwgMCkgLyAxMDApICogKChOdW1iZXIobC52YXRSYXRlKSB8fCAyMCkgLyAxMDApKSwgMCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHRvdGFsSFQgPSBmaWVsZHMudG90YWxIVCAhPT0gdW5kZWZpbmVkID8gTnVtYmVyKGZpZWxkcy50b3RhbEhUKSA6IGNhbGNIVDtcbiAgICAgICAgICAgIGNvbnN0IHZhdEFtb3VudCA9IChmaWVsZHMudmF0QW1vdW50ICE9PSB1bmRlZmluZWQgfHwgZmllbGRzLnRvdGFsVkFUICE9PSB1bmRlZmluZWQpID8gTnVtYmVyKGZpZWxkcy52YXRBbW91bnQgPz8gZmllbGRzLnRvdGFsVkFUKSA6IGNhbGNWQVQ7XG4gICAgICAgICAgICBjb25zdCB0b3RhbFRUQyA9IGZpZWxkcy50b3RhbFRUQyAhPT0gdW5kZWZpbmVkID8gTnVtYmVyKGZpZWxkcy50b3RhbFRUQykgOiAodG90YWxIVCArIHZhdEFtb3VudCk7XG5cbiAgICAgICAgICAgIGxldCBjbGllbnROYW1lID0gZmllbGRzLmNsaWVudE5hbWU7XG4gICAgICAgICAgICBpZiAoIWNsaWVudE5hbWUgJiYgZmllbGRzLmNsaWVudElkKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGZvdW5kID0gZGV2RGIuY2xpZW50cy5maW5kKChjOiBhbnkpID0+IGMuaWQgPT09IE51bWJlcihmaWVsZHMuY2xpZW50SWQpIHx8IGMuaWQgPT09IGZpZWxkcy5jbGllbnRJZCk7XG4gICAgICAgICAgICAgIGlmIChmb3VuZCkgY2xpZW50TmFtZSA9IGZvdW5kLm5hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWNsaWVudE5hbWUpIGNsaWVudE5hbWUgPSAnQ2xpZW50IG5vbiBzcFx1MDBFOWNpZmlcdTAwRTknO1xuXG4gICAgICAgICAgICBjb25zdCBlcnJvcnM6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgICBjb25zdCB3YXJuaW5nczogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICAgICAgLy8gMS4gQ29udHJcdTAwRjRsZSBhcml0aG1cdTAwRTl0aXF1ZSBkXHUwMEU5dGVybWluaXN0ZSByXHUwMEU5ZWxcbiAgICAgICAgICAgIGlmIChsaW5lcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgIGlmIChNYXRoLmFicyhjYWxjSFQgLSB0b3RhbEhUKSA+IDAuMSkge1xuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKGBFcnJldXIgZGUgY2FsY3VsIDogTGEgc29tbWUgZGVzIGxpZ25lcyBIVCAoJHtjYWxjSFQudG9GaXhlZCgyKX0gXHUyMEFDKSBuZSBjb3JyZXNwb25kIHBhcyBhdSB0b3RhbCBIVCBkXHUwMEU5Y2xhclx1MDBFOSAoJHt0b3RhbEhULnRvRml4ZWQoMil9IFx1MjBBQykuYCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHdhcm5pbmdzLnB1c2goXCJMYSBmYWN0dXJlIG5lIGNvbnRpZW50IGF1Y3VuZSBsaWduZSBkZSBwcmVzdGF0aW9uIG91IHByb2R1aXQuXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodG90YWxIVCA+IDAgJiYgTWF0aC5hYnMoKHRvdGFsSFQgKyB2YXRBbW91bnQpIC0gdG90YWxUVEMpID4gMC4xKSB7XG4gICAgICAgICAgICAgIGVycm9ycy5wdXNoKGBFcnJldXIgVFZBIDogVG90YWwgSFQgKCR7dG90YWxIVC50b0ZpeGVkKDIpfSBcdTIwQUMpICsgVFZBICgke3ZhdEFtb3VudC50b0ZpeGVkKDIpfSBcdTIwQUMpIFx1MjI2MCBUb3RhbCBUVEMgKCR7dG90YWxUVEMudG9GaXhlZCgyKX0gXHUyMEFDKS5gKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFjbGllbnROYW1lIHx8IGNsaWVudE5hbWUgPT09ICdDbGllbnQgbm9uIHNwXHUwMEU5Y2lmaVx1MDBFOScpIHtcbiAgICAgICAgICAgICAgd2FybmluZ3MucHVzaChcIkxlIG5vbSBkdSBjbGllbnQgZGVzdGluYXRhaXJlIGVzdCBtYW5xdWFudC5cIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIDIuIEF1ZGl0IGRlIGNvbmZvcm1pdFx1MDBFOSBmaXNjYWxlIGV0IG1lbnRpb25zIGxcdTAwRTlnYWxlcyBwYXIgbCdJQVxuICAgICAgICAgICAgY29uc3QgZ3JvcVJlcyA9IGF3YWl0IGNhbGxMTE0oW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcm9sZTogJ3N5c3RlbScsXG4gICAgICAgICAgICAgICAgY29udGVudDogYFR1IGVzIHVuIGV4cGVydC1jb21wdGFibGUgZXQganVyaXN0ZSBmaXNjYWxpc3RlIHNwXHUwMEU5Y2lhbGlzXHUwMEU5IGVuIGZhY3R1cmF0aW9uIEIyQiBmcmFuXHUwMEU3YWlzZS5cbkF1ZGl0ZSBsYSBmYWN0dXJlIHN1aXZhbnRlIGV0IGlkZW50aWZpZSBsZXMgYW5vbWFsaWVzIGp1cmlkaXF1ZXMsIG1lbnRpb25zIG1hbnF1YW50ZXMgb3UgYWxlcnRlcyBmaXNjYWxlcy5cblJcdTAwRTlwb25kcyBlbiBKU09OIHN0cmljdCA6XG57XG4gIFwiYWlXYXJuaW5nc1wiOiBbXCJQb2ludCBkZSB2aWdpbGFuY2UgbFx1MDBFOWdhbCAxXCIsIFwiUG9pbnQgMlwiXSxcbiAgXCJzdWdnZXN0ZWRNZW50aW9uc1wiOiBbXCJNZW50aW9uIG9ibGlnYXRvaXJlIHJlY29tbWFuZFx1MDBFOWVcIl1cbn1gXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByb2xlOiAndXNlcicsXG4gICAgICAgICAgICAgICAgY29udGVudDogYEZhY3R1cmUgTlx1MDBCMDogJHtpbnZvaWNlTnVtYmVyfSwgQ2xpZW50OiAke2NsaWVudE5hbWV9LCBUb3RhbCBIVDogJHt0b3RhbEhUfSBcdTIwQUMsIFRvdGFsIFRUQzogJHt0b3RhbFRUQ30gXHUyMEFDLCBUVkE6ICR7dmF0QW1vdW50fSBcdTIwQUMsIExpZ25lczogJHtKU09OLnN0cmluZ2lmeShsaW5lcyl9YFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdLCB0cnVlKTtcblxuICAgICAgICAgICAgY29uc3QgYWlBbmFseXNpcyA9IEpTT04ucGFyc2UoZ3JvcVJlcy5jaG9pY2VzWzBdLm1lc3NhZ2UuY29udGVudCk7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShhaUFuYWx5c2lzLmFpV2FybmluZ3MpKSB7XG4gICAgICAgICAgICAgIHdhcm5pbmdzLnB1c2goLi4uYWlBbmFseXNpcy5haVdhcm5pbmdzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICAgIHJldHVybiByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgaXNWYWxpZDogZXJyb3JzLmxlbmd0aCA9PT0gMCxcbiAgICAgICAgICAgICAgZXJyb3JzLFxuICAgICAgICAgICAgICB3YXJuaW5ncyxcbiAgICAgICAgICAgICAgc3VnZ2VzdGVkTWVudGlvbnM6IGFpQW5hbHlzaXMuc3VnZ2VzdGVkTWVudGlvbnMgfHwgWydJbmRlbW5pdFx1MDBFOSBmb3JmYWl0YWlyZSBkZSA0MFx1MjBBQyBwb3VyIGZyYWlzIGRlIHJlY291dnJlbWVudCAoQXJ0LiBELiA0NDEtNSBDLiBjb20uKSddXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAgIC8vIDUuIEFOQUxZU0VVUiBERSBRVUFMSVRcdTAwQzkgRU1BSUwgKFZSQUlFIEFOQUxZU0UgRFUgVEVYVEUgUEFSIExMTSlcbiAgICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgICAgaWYgKHBhdGhuYW1lID09PSAnL2FwaS9lbWFpbF9hbmFseXplLnBocCcpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgZmllbGRzIH0gPSBhd2FpdCBwYXJzZVJlcXVlc3RCb2R5KHJlcSk7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gKGZpZWxkcy50ZXh0IHx8IGZpZWxkcy5ib2R5IHx8ICcnKS50cmltKCk7XG5cbiAgICAgICAgICAgIGlmICghdGV4dCB8fCB0ZXh0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgICByZXR1cm4gcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgY2xhcml0eVNjb3JlOiAwLFxuICAgICAgICAgICAgICAgIHByb2Zlc3Npb25hbGlzbVNjb3JlOiAwLFxuICAgICAgICAgICAgICAgIGVzdGltYXRlZExlbmd0aFdvcmRzOiAwLFxuICAgICAgICAgICAgICAgIHJlYWRUaW1lU2Vjb25kczogMCxcbiAgICAgICAgICAgICAgICBxdWFsaXR5U2NvcmU6IDBcbiAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCB3b3JkQ291bnQgPSB0ZXh0LnNwbGl0KC9cXHMrLykubGVuZ3RoO1xuICAgICAgICAgICAgY29uc3QgcmVhZFRpbWVTZWNvbmRzID0gTWF0aC5tYXgoNSwgTWF0aC5yb3VuZCgod29yZENvdW50IC8gMjAwKSAqIDYwKSk7XG5cbiAgICAgICAgICAgIC8vIFZyYWllIFx1MDBFOXZhbHVhdGlvbiBzXHUwMEU5bWFudGlxdWUgcGFyIGwnSUFcbiAgICAgICAgICAgIGNvbnN0IGdyb3FSZXMgPSBhd2FpdCBjYWxsTExNKFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJvbGU6ICdzeXN0ZW0nLFxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBUdSBlcyB1biBhdWRpdGV1ciBkZSBjb21tdW5pY2F0aW9uIGQnZW50cmVwcmlzZS4gXHUwMEM5dmFsdWUgcmlnb3VyZXVzZW1lbnQgbGEgcXVhbGl0XHUwMEU5IGR1IHRleHRlIGQnZW1haWwgZm91cm5pLlxuQ3JpdFx1MDBFOHJlcyA6XG4tIGNsYXJpdHlTY29yZSAoMC0xMDApIDogQ2xhcnRcdTAwRTkgZHUgcHJvcG9zIGV0IHN0cnVjdHVyZS5cbi0gcHJvZmVzc2lvbmFsaXNtU2NvcmUgKDAtMTAwKSA6IFBvbGl0ZXNzZSwgdm9jYWJ1bGFpcmUgc291dGVudSwgYWJzZW5jZSBkZSBmYW1pbGlhcml0XHUwMEU5LlxuLSBxdWFsaXR5U2NvcmUgKDAtMTAwKSA6IEVmZmljYWNpdFx1MDBFOSBnbG9iYWxlIHBvdXIgYXR0ZWluZHJlIHNvbiBvYmplY3RpZi5cblJcdTAwRTlwb25kcyBlbiBKU09OIHN0cmljdCA6XG57XG4gIFwiY2xhcml0eVNjb3JlXCI6IDg4LFxuICBcInByb2Zlc3Npb25hbGlzbVNjb3JlXCI6IDkyLFxuICBcInF1YWxpdHlTY29yZVwiOiA5MFxufWBcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgeyByb2xlOiAndXNlcicsIGNvbnRlbnQ6IGBFbWFpbCBcdTAwRTAgYW5hbHlzZXIgOlxcblxcbiR7dGV4dH1gIH1cbiAgICAgICAgICAgIF0sIHRydWUpO1xuXG4gICAgICAgICAgICBjb25zdCBzY29yZXMgPSBKU09OLnBhcnNlKGdyb3FSZXMuY2hvaWNlc1swXS5tZXNzYWdlLmNvbnRlbnQpO1xuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICAgIHJldHVybiByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgY2xhcml0eVNjb3JlOiBOdW1iZXIoc2NvcmVzLmNsYXJpdHlTY29yZSkgfHwgNzUsXG4gICAgICAgICAgICAgIHByb2Zlc3Npb25hbGlzbVNjb3JlOiBOdW1iZXIoc2NvcmVzLnByb2Zlc3Npb25hbGlzbVNjb3JlKSB8fCA4MCxcbiAgICAgICAgICAgICAgZXN0aW1hdGVkTGVuZ3RoV29yZHM6IHdvcmRDb3VudCxcbiAgICAgICAgICAgICAgcmVhZFRpbWVTZWNvbmRzLFxuICAgICAgICAgICAgICBxdWFsaXR5U2NvcmU6IE51bWJlcihzY29yZXMucXVhbGl0eVNjb3JlKSB8fCA3OFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgICAvLyA2LiBDUk0gLyBDTElFTlRTIC8gRkFDVFVSRVMgLyBLUElTIChCQVNFIExPQ0FMRSBSXHUwMEM5RUxMRSlcbiAgICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgICAgY29uc3QgZGIgPSBsb2FkRGV2RGIoKTtcblxuICAgICAgICAgIGlmIChwYXRobmFtZSA9PT0gJy9hcGkvY2xpZW50cy5waHAnKSB7XG4gICAgICAgICAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ1BPU1QnKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHsgZmllbGRzIH0gPSBhd2FpdCBwYXJzZVJlcXVlc3RCb2R5KHJlcSk7XG4gICAgICAgICAgICAgIGNvbnN0IG5ld0NsaWVudCA9IHtcbiAgICAgICAgICAgICAgICBpZDogZmllbGRzLmlkIHx8IChkYi5jbGllbnRzLmxlbmd0aCArIDEpLFxuICAgICAgICAgICAgICAgIG5hbWU6IGZpZWxkcy5uYW1lIHx8ICdOb3V2ZWF1IENsaWVudCcsXG4gICAgICAgICAgICAgICAgZW1haWw6IGZpZWxkcy5lbWFpbCB8fCAnJyxcbiAgICAgICAgICAgICAgICBjb21wYW55OiBmaWVsZHMuY29tcGFueSB8fCBmaWVsZHMubmFtZSB8fCAnRW50cmVwcmlzZScsXG4gICAgICAgICAgICAgICAgYWRkcmVzczogZmllbGRzLmFkZHJlc3MgfHwgJycsXG4gICAgICAgICAgICAgICAgcGhvbmU6IGZpZWxkcy5waG9uZSB8fCAnJyxcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICBkYi5jbGllbnRzLnB1c2gobmV3Q2xpZW50KTtcbiAgICAgICAgICAgICAgc2F2ZURldkRiKGRiKTtcbiAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkobmV3Q2xpZW50KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoZGIuY2xpZW50cykpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChwYXRobmFtZSA9PT0gJy9hcGkvaW52b2ljZXMucGhwJykge1xuICAgICAgICAgICAgaWYgKHJlcS5tZXRob2QgPT09ICdQT1NUJykge1xuICAgICAgICAgICAgICBjb25zdCB7IGZpZWxkcyB9ID0gYXdhaXQgcGFyc2VSZXF1ZXN0Qm9keShyZXEpO1xuICAgICAgICAgICAgICBjb25zdCBuZXdJbnZvaWNlID0ge1xuICAgICAgICAgICAgICAgIGlkOiBmaWVsZHMuaWQgfHwgYGludl8ke0RhdGUubm93KCl9YCxcbiAgICAgICAgICAgICAgICBpbnZvaWNlTnVtYmVyOiBmaWVsZHMuaW52b2ljZU51bWJlciB8fCBgRkFDLSR7bmV3IERhdGUoKS5nZXRGdWxsWWVhcigpfS0ke1N0cmluZyhkYi5pbnZvaWNlcy5sZW5ndGggKyAxKS5wYWRTdGFydCg0LCAnMCcpfWAsXG4gICAgICAgICAgICAgICAgY2xpZW50TmFtZTogZmllbGRzLmNsaWVudE5hbWUgfHwgJ0NsaWVudCcsXG4gICAgICAgICAgICAgICAgYW1vdW50SFQ6IE51bWJlcihmaWVsZHMudG90YWxIVCB8fCBmaWVsZHMuYW1vdW50SFQpIHx8IDAsXG4gICAgICAgICAgICAgICAgYW1vdW50VFRDOiBOdW1iZXIoZmllbGRzLnRvdGFsVFRDIHx8IGZpZWxkcy5hbW91bnRUVEMpIHx8IDAsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiBmaWVsZHMuc3RhdHVzIHx8ICdwZW5kaW5nJyxcbiAgICAgICAgICAgICAgICBkYXRlOiBmaWVsZHMuZGF0ZSB8fCBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXSxcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICBkYi5pbnZvaWNlcy5wdXNoKG5ld0ludm9pY2UpO1xuICAgICAgICAgICAgICBzYXZlRGV2RGIoZGIpO1xuICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgICByZXR1cm4gcmVzLmVuZChKU09OLnN0cmluZ2lmeShuZXdJbnZvaWNlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoZGIuaW52b2ljZXMpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAocGF0aG5hbWUgPT09ICcvYXBpL2ludm9pY2VzX2twaXMucGhwJykge1xuICAgICAgICAgICAgY29uc3QgdG90YWxJc3N1ZWQgPSBkYi5pbnZvaWNlcy5yZWR1Y2UoKHN1bSwgaW52KSA9PiBzdW0gKyAoTnVtYmVyKGludi5hbW91bnRUVEMpIHx8IDApLCAwKTtcbiAgICAgICAgICAgIGNvbnN0IHRvdGFsUGFpZCA9IGRiLmludm9pY2VzLmZpbHRlcihpID0+IGkuc3RhdHVzID09PSAncGFpZCcpLnJlZHVjZSgoc3VtLCBpbnYpID0+IHN1bSArIChOdW1iZXIoaW52LmFtb3VudFRUQykgfHwgMCksIDApO1xuICAgICAgICAgICAgY29uc3QgdG90YWxQZW5kaW5nID0gZGIuaW52b2ljZXMuZmlsdGVyKGkgPT4gaS5zdGF0dXMgPT09ICdwZW5kaW5nJykucmVkdWNlKChzdW0sIGludikgPT4gc3VtICsgKE51bWJlcihpbnYuYW1vdW50VFRDKSB8fCAwKSwgMCk7XG4gICAgICAgICAgICBjb25zdCB0b3RhbE92ZXJkdWUgPSBkYi5pbnZvaWNlcy5maWx0ZXIoaSA9PiBpLnN0YXR1cyA9PT0gJ292ZXJkdWUnKS5yZWR1Y2UoKHN1bSwgaW52KSA9PiBzdW0gKyAoTnVtYmVyKGludi5hbW91bnRUVEMpIHx8IDApLCAwKTtcblxuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICAgIHJldHVybiByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgdG90YWxJc3N1ZWQsIHRvdGFsUGFpZCwgdG90YWxQZW5kaW5nLCB0b3RhbE92ZXJkdWUgfSkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChwYXRobmFtZSA9PT0gJy9hcGkvZm9sbG93dXBfdGFyZ2V0cy5waHAnKSB7XG4gICAgICAgICAgICAvLyBDaWJsZXMgclx1MDBFOWVsbGVzIGdcdTAwRTluXHUwMEU5clx1MDBFOWVzIFx1MDBFMCBwYXJ0aXIgZGVzIGZhY3R1cmVzIGltcGF5XHUwMEU5ZXMgY3JcdTAwRTlcdTAwRTllc1xuICAgICAgICAgICAgY29uc3Qgb3ZlcmR1ZUludm9pY2VzID0gZGIuaW52b2ljZXNcbiAgICAgICAgICAgICAgLmZpbHRlcihpID0+IGkuc3RhdHVzID09PSAnb3ZlcmR1ZScgfHwgaS5zdGF0dXMgPT09ICdwZW5kaW5nJylcbiAgICAgICAgICAgICAgLm1hcChpID0+ICh7XG4gICAgICAgICAgICAgICAgaWQ6IGkuaWQsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2ludm9pY2UnLFxuICAgICAgICAgICAgICAgIHJlZmVyZW5jZTogaS5pbnZvaWNlTnVtYmVyLFxuICAgICAgICAgICAgICAgIGNsaWVudE5hbWU6IGkuY2xpZW50TmFtZSxcbiAgICAgICAgICAgICAgICBhbW91bnQ6IGkuYW1vdW50VFRDLFxuICAgICAgICAgICAgICAgIGRheXNQZW5kaW5nOiAxNSxcbiAgICAgICAgICAgICAgICBzdGF0dXM6IGkuc3RhdHVzID09PSAnb3ZlcmR1ZScgPyAnZXNjYWxhdGVkJyA6ICdwZW5kaW5nJ1xuICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkob3ZlcmR1ZUludm9pY2VzKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHBhdGhuYW1lID09PSAnL2FwaS9mb2xsb3d1cF9rcGlzLnBocCcpIHtcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgICByZXR1cm4gcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgIHRvdGFsU2VudDogZGIuZm9sbG93dXBzLmxlbmd0aCxcbiAgICAgICAgICAgICAgcmVzcG9uc2VSYXRlUGVyY2VudDogZGIuZm9sbG93dXBzLmxlbmd0aCA+IDAgPyA2NSA6IDAsXG4gICAgICAgICAgICAgIHF1b3Rlc1dvbjogZGIucXVvdGVzLmZpbHRlcihxID0+IHEuc3RhdHVzID09PSAnYWNjZXB0ZWQnKS5sZW5ndGgsXG4gICAgICAgICAgICAgIGludm9pY2VzUGFpZDogZGIuaW52b2ljZXMuZmlsdGVyKGkgPT4gaS5zdGF0dXMgPT09ICdwYWlkJykubGVuZ3RoXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHBhdGhuYW1lID09PSAnL2FwaS91cGNvbWluZ19tZWV0aW5ncy5waHAnKSB7XG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoW10pKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAocGF0aG5hbWUgPT09ICcvYXBpL2xlYWRzX2twaXMucGhwJykge1xuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICAgIHJldHVybiByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgdG90YWxHZW5lcmF0ZWQ6IDQ4LFxuICAgICAgICAgICAgICBoaWdobHlRdWFsaWZpZWQ6IDMyLFxuICAgICAgICAgICAgICBhY3RpdmVTZWdtZW50czogNixcbiAgICAgICAgICAgICAgdG90YWxFeHBvcnRzOiAxNFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChwYXRobmFtZSA9PT0gJy9hcGkvbGVhZHNfc2VhcmNoLnBocCcpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgZmllbGRzIH0gPSBhd2FpdCBwYXJzZVJlcXVlc3RCb2R5KHJlcSk7XG4gICAgICAgICAgICBjb25zdCBzZWN0b3IgPSBmaWVsZHMuc2VjdG9yIHx8ICdUZWNobm9sb2dpZSAmIENvbnNlaWwnO1xuICAgICAgICAgICAgY29uc3QgY291bnRyeSA9IGZpZWxkcy5jb3VudHJ5IHx8ICdGcmFuY2UnO1xuICAgICAgICAgICAgY29uc3QgcmVnaW9uID0gZmllbGRzLnJlZ2lvbiB8fCAnVG91dGVzIHJcdTAwRTlnaW9ucyc7XG4gICAgICAgICAgICBjb25zdCBjb21wYW55U2l6ZSA9IGZpZWxkcy5jb21wYW55U2l6ZSB8fCAnUE1FICg1MS0yNTApJztcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldEZ1bmN0aW9uID0gZmllbGRzLnRhcmdldEZ1bmN0aW9uIHx8ICdDRU8gLyBEU0knO1xuICAgICAgICAgICAgY29uc3Qga2V5d29yZHMgPSBmaWVsZHMua2V5d29yZHMgfHwgJ3RyYW5zZm9ybWF0aW9uIGRpZ2l0YWxlLCBhdXRvbWF0aXNhdGlvbic7XG5cbiAgICAgICAgICAgIGNvbnN0IHN5c3RlbVByb21wdCA9IGBUdSBlcyB1biBtb3RldXIgZGUgcHJvc3BlY3Rpb24gZXQgZCdpbnRlbGxpZ2VuY2UgY29tbWVyY2lhbGUgQjJCIHNwXHUwMEU5Y2lhbGlzXHUwMEU5IHBvdXIgTURJViBCdXNpbmVzcy5cblx1MDBDMCBwYXJ0aXIgZGVzIGNyaXRcdTAwRThyZXMgZGUgY2libGFnZSByXHUwMEU5ZWxzIGRlbWFuZFx1MDBFOXMsIGdcdTAwRTluXHUwMEU4cmUgdW5lIGxpc3RlIGRlIDQgXHUwMEUwIDYgZW50cmVwcmlzZXMgY2libGVzIGNyXHUwMEU5ZGlibGVzIGV0IGhhdXRlbWVudCBxdWFsaWZpXHUwMEU5ZXMgYXZlYyBsZXVyIHByb2ZpbCBkJ2VucmljaGlzc2VtZW50IElBLlxuUlx1MDBFOXBvbmRzIFNUUklDVEVNRU5UIHBhciB1biB0YWJsZWF1IEpTT04gdmFsaWRlIGF1IGZvcm1hdCA6XG5bXG4gIHtcbiAgICBcImNvbXBhbnlOYW1lXCI6IFwiTm9tIGVudHJlcHJpc2VcIixcbiAgICBcInNlY3RvclwiOiBcIiR7c2VjdG9yfVwiLFxuICAgIFwic2l6ZVwiOiBcIiR7Y29tcGFueVNpemV9XCIsXG4gICAgXCJsb2NhdGlvblwiOiBcIlBhcmlzLCAke2NvdW50cnl9XCIsXG4gICAgXCJ3ZWJzaXRlXCI6IFwiaHR0cHM6Ly93d3cuZXhlbXBsZS5mclwiLFxuICAgIFwiZGlnaXRhbE1hdHVyaXR5U2NvcmVcIjogXCJNb3llblwiLFxuICAgIFwiYWlQb3RlbnRpYWxTY29yZVwiOiBcIlx1MDBDOWxldlx1MDBFOVwiLFxuICAgIFwicHVyY2hhc2VQcm9iYWJpbGl0eVwiOiBcIlRyXHUwMEU4cyBcdTAwRTlsZXZcdTAwRTlcIixcbiAgICBcImRlY2lzaW9uTWFrZXJOYW1lXCI6IFwiUHJcdTAwRTlub20gTm9tXCIsXG4gICAgXCJkZWNpc2lvbk1ha2VyRnVuY3Rpb25cIjogXCIke3RhcmdldEZ1bmN0aW9ufVwiLFxuICAgIFwidGVjaG5vbG9naWVzVXNlZFwiOiBbXCJNaWNyb3NvZnQgMzY1XCIsIFwiRVJQIFNBUFwiLCBcIlNhbGVzZm9yY2VcIl1cbiAgfVxuXWA7XG5cbiAgICAgICAgICAgIGNvbnN0IHVzZXJQcm9tcHQgPSBgQ3JpdFx1MDBFOHJlcyBkZSBwcm9zcGVjdGlvbiBkZW1hbmRcdTAwRTlzIDpcblNlY3RldXIgOiAke3NlY3Rvcn1cblBheXMgOiAke2NvdW50cnl9XG5SXHUwMEU5Z2lvbiA6ICR7cmVnaW9ufVxuVGFpbGxlIGQnZW50cmVwcmlzZSA6ICR7Y29tcGFueVNpemV9XG5Gb25jdGlvbiBjaWJsXHUwMEU5ZSA6ICR7dGFyZ2V0RnVuY3Rpb259XG5Nb3RzLWNsXHUwMEU5cyBldCB0ZWNobm9sb2dpZXMgOiAke2tleXdvcmRzfWA7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGNvbnN0IGFpUmVzID0gYXdhaXQgY2FsbExMTShbXG4gICAgICAgICAgICAgICAgeyByb2xlOiAnc3lzdGVtJywgY29udGVudDogc3lzdGVtUHJvbXB0IH0sXG4gICAgICAgICAgICAgICAgeyByb2xlOiAndXNlcicsIGNvbnRlbnQ6IHVzZXJQcm9tcHQgfVxuICAgICAgICAgICAgICBdLCBmYWxzZSk7XG5cbiAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGFpUmVzLmNob2ljZXNbMF0ubWVzc2FnZS5jb250ZW50O1xuICAgICAgICAgICAgICBsZXQgbGVhZHNEYXRhOiBhbnlbXSA9IFtdO1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxlYWRzRGF0YSA9IEpTT04ucGFyc2UoY29udGVudCk7XG4gICAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gY29udGVudC5tYXRjaCgvXFxcXFtbXFxcXHNcXFxcU10qXFxcXF0vKTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2gpIGxlYWRzRGF0YSA9IEpTT04ucGFyc2UobWF0Y2hbMF0pO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkobGVhZHNEYXRhKSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDUwMDtcbiAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogZXJyLm1lc3NhZ2UgfHwgJ0VycmV1ciBkZSBnXHUwMEU5blx1MDBFOXJhdGlvbiBkZXMgbGVhZHMnIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgICAgLy8gNy4gQVNTSVNUQU5UIEVNQUlMIElBIChSXHUwMEM5REFDVElPTiBSXHUwMEM5RUxMRSlcbiAgICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgICAgaWYgKHBhdGhuYW1lID09PSAnL2FwaS9lbWFpbF9nZW5lcmF0ZS5waHAnKSB7XG4gICAgICAgICAgICBjb25zdCB7IGZpZWxkcyB9ID0gYXdhaXQgcGFyc2VSZXF1ZXN0Qm9keShyZXEpO1xuICAgICAgICAgICAgY29uc3QgeyB0ZXh0LCB0YXNrLCB0b25lLCBvYmplY3RpdmUgfSA9IGZpZWxkcztcblxuICAgICAgICAgICAgY29uc3QgZ3JvcVJlcyA9IGF3YWl0IGNhbGxMTE0oW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcm9sZTogJ3N5c3RlbScsXG4gICAgICAgICAgICAgICAgY29udGVudDogYFR1IGVzIHVuIGV4cGVydCBlbiBjb21tdW5pY2F0aW9uIGV4XHUwMEU5Y3V0aXZlIHBvdXIgTURJViBCdXNpbmVzcy5cblRcdTAwRTJjaGUgOiAke3Rhc2sgfHwgJ1JcdTAwRTlcdTAwRTljcml0dXJlJ30gfCBUb24gOiAke3RvbmUgfHwgJ1Byb2Zlc3Npb25uZWwnfSB8IE9iamVjdGlmIDogJHtvYmplY3RpdmUgfHwgJ0VtYWlsIEIyQid9XG5SXHUwMEU5ZGlnZSB1biBlbWFpbCBwYXJmYWl0IGF2ZWMgT2JqZXQgZW4gcHJlbWlcdTAwRThyZSBsaWduZSwgc2FsdXRhdGlvbiwgY29ycHMgXHUwMEU5bFx1MDBFOWdhbnQgZXQgc2lnbmF0dXJlLiBQYXMgZGUgdGV4dGUgc3VwZXJmbHUuYFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7IHJvbGU6ICd1c2VyJywgY29udGVudDogdGV4dCB8fCAnUHJvcG9zZXIgdW4gcmVuZGV6LXZvdXMgcG91ciBwclx1MDBFOXNlbnRlciBub3Mgc2VydmljZXMgSUEuJyB9XG4gICAgICAgICAgICBdKTtcblxuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICAgIHJldHVybiByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgZ2VuZXJhdGVkVGV4dDogZ3JvcVJlcy5jaG9pY2VzWzBdLm1lc3NhZ2UuY29udGVudFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgICAvLyA4LiBSRUxBTkNFUyBJTlRFTExJR0VOVEVTIElBIChHXHUwMEM5Tlx1MDBDOVJBVElPTiBSXHUwMEM5RUxMRSlcbiAgICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgICAgaWYgKHBhdGhuYW1lID09PSAnL2FwaS9mb2xsb3d1cF9nZW5lcmF0ZS5waHAnKSB7XG4gICAgICAgICAgICBjb25zdCB7IGZpZWxkcyB9ID0gYXdhaXQgcGFyc2VSZXF1ZXN0Qm9keShyZXEpO1xuICAgICAgICAgICAgY29uc3QgZ3JvcVJlcyA9IGF3YWl0IGNhbGxMTE0oW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcm9sZTogJ3N5c3RlbScsXG4gICAgICAgICAgICAgICAgY29udGVudDogYFR1IGVzIHVuIHNwXHUwMEU5Y2lhbGlzdGUgZGUgbGEgcmVsYXRpb24gY2xpZW50IGV0IGR1IHJlY291dnJlbWVudCBiaWVudmVpbGxhbnQgcG91ciBNRElWIEJ1c2luZXNzLlxuUlx1MDBFOWRpZ2UgdW4gbWVzc2FnZSBkZSByZWxhbmNlIGFkYXB0XHUwMEU5IGF1IGRvc3NpZXIgOlxuVHlwZTogJHtmaWVsZHMudHlwZSB8fCAnRG9zc2llcid9IHwgQ2xpZW50OiAke2ZpZWxkcy5jbGllbnROYW1lfSB8IFJcdTAwRTlmOiAke2ZpZWxkcy5yZWZlcmVuY2V9IHwgVG9uOiAke2ZpZWxkcy50b25lfSB8IFVyZ2VuY2U6ICR7ZmllbGRzLnVyZ2VuY3lMZXZlbH1cblJcdTAwRTlwb25kcyBVTklRVUVNRU5UIGVuIEpTT04gc3RyaWN0IDpcbntcbiAgXCJzdWJqZWN0XCI6IFwiT2JqZXQgY2xhaXIgZXQgcGVyY3V0YW50IGRlIGxhIHJlbGFuY2VcIixcbiAgXCJib2R5XCI6IFwiQ29ycHMgY29tcGxldCBkdSBtZXNzYWdlIHBvbGkgZXQgYXJndW1lbnRcdTAwRTkuLi5cIlxufWBcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgeyByb2xlOiAndXNlcicsIGNvbnRlbnQ6IGBHXHUwMEU5blx1MDBFOHJlIGxhIHJlbGFuY2UgcG91ciAke2ZpZWxkcy5jbGllbnROYW1lfSBjb25jZXJuYW50ICR7ZmllbGRzLnJlZmVyZW5jZX0gc3VyIHVuIHRvbiAke2ZpZWxkcy50b25lfS5gIH1cbiAgICAgICAgICAgIF0sIHRydWUpO1xuXG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5lbmQoZ3JvcVJlcy5jaG9pY2VzWzBdLm1lc3NhZ2UuY29udGVudCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHBhdGhuYW1lID09PSAnL2FwaS9mb2xsb3d1cF9zZW5kLnBocCcpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgZmllbGRzIH0gPSBhd2FpdCBwYXJzZVJlcXVlc3RCb2R5KHJlcSk7XG4gICAgICAgICAgICBkYi5mb2xsb3d1cHMucHVzaCh7XG4gICAgICAgICAgICAgIGlkOiAnZm9sXycgKyBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICB0YXJnZXRJZDogZmllbGRzLnRhcmdldElkLFxuICAgICAgICAgICAgICBzdWJqZWN0OiBmaWVsZHMuc3ViamVjdCxcbiAgICAgICAgICAgICAgc2VudEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc2F2ZURldkRiKGRiKTtcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgICByZXR1cm4gcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IHN1Y2Nlc3M6IHRydWUsIG1lc3NhZ2U6ICdSZWxhbmNlIGVucmVnaXN0clx1MDBFOWUgZXQgZXhwXHUwMEU5ZGlcdTAwRTllIGF2ZWMgc3VjY1x1MDBFOHMuJyB9KSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAgIC8vIDkuIFNUVURJTyBERSBDT05URU5VIE1VTFRJLUNBTkFMIElBIChHXHUwMEM5Tlx1MDBDOVJBVElPTiBSXHUwMEM5RUxMRSlcbiAgICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgICAgaWYgKHBhdGhuYW1lID09PSAnL2FwaS9jb250ZW50X2dlbmVyYXRlLnBocCcpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgZmllbGRzIH0gPSBhd2FpdCBwYXJzZVJlcXVlc3RCb2R5KHJlcSk7XG4gICAgICAgICAgICBjb25zdCBjaGFubmVscyA9IGZpZWxkcy5jaGFubmVscyB8fCBbJ0xpbmtlZEluJywgJ1R3aXR0ZXIvWCddO1xuICAgICAgICAgICAgY29uc3Qgc291cmNlQ29udGVudCA9IGZpZWxkcy5zb3VyY2VDb250ZW50IHx8ICcnO1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0QXVkaWVuY2UgPSBmaWVsZHMudGFyZ2V0QXVkaWVuY2UgfHwgJ0RpcmlnZWFudHMgZGUgUE1FJztcbiAgICAgICAgICAgIGNvbnN0IGJyYW5kU2V0dGluZ3MgPSBmaWVsZHMuYnJhbmRTZXR0aW5ncyB8fCB7fTtcblxuICAgICAgICAgICAgY29uc3QgZ3JvcVJlcyA9IGF3YWl0IGNhbGxMTE0oW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcm9sZTogJ3N5c3RlbScsXG4gICAgICAgICAgICAgICAgY29udGVudDogYFR1IGVzIHVuIGRpcmVjdGV1ciBcdTAwRTlkaXRvcmlhbCBldCBjb3B5d3JpdGVyIEIyQiBkJ1x1MDBFOWxpdGUuXG5HXHUwMEU5blx1MDBFOHJlIHVuZSBkXHUwMEU5Y2xpbmFpc29uIHBvdXIgbGVzIGNhbmF1eCBzdWl2YW50cyA6IFske2NoYW5uZWxzLmpvaW4oJywgJyl9XS5cbkF1ZGllbmNlIDogJHt0YXJnZXRBdWRpZW5jZX1cblRvbiA6ICR7YnJhbmRTZXR0aW5ncy50b25lIHx8ICdQcm9mZXNzaW9ubmVsIGV0IGluc3BpcmFudCd9XG5Nb3RzLWNsXHUwMEU5cyA6ICR7YnJhbmRTZXR0aW5ncy5rZXl3b3JkcyB8fCAnJ31cblJcdTAwRTlwb25kcyBVTklRVUVNRU5UIGVuIHRhYmxlYXUgSlNPTiB2YWxpZGUgOlxuW1xuICB7XG4gICAgXCJjaGFubmVsXCI6IFwiTm9tRHVDYW5hbFwiLFxuICAgIFwidGl0bGVcIjogXCJUaXRyZSBhY2Nyb2NoZXVyXCIsXG4gICAgXCJib2R5XCI6IFwiVGV4dGUgZW5nYWdlYW50IGNvbXBsZXQuLi5cIixcbiAgICBcImhhc2h0YWdzXCI6IFtcIiNUYWcxXCIsIFwiI1RhZzJcIl1cbiAgfVxuXWBcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgeyByb2xlOiAndXNlcicsIGNvbnRlbnQ6IGBDb250ZW51IHNvdXJjZSBcdTAwRTAgZFx1MDBFOWNsaW5lciA6XFxuXFxuJHtzb3VyY2VDb250ZW50fWAgfVxuICAgICAgICAgICAgXSwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgICByZXR1cm4gcmVzLmVuZChncm9xUmVzLmNob2ljZXNbMF0ubWVzc2FnZS5jb250ZW50KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgICAgLy8gMTAuIFBST1NQRUNUSU9OIEVNQUlMIEIyQiAoR1x1MDBDOU5cdTAwQzlSQVRJT04gUlx1MDBDOUVMTEUpXG4gICAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAgIGlmIChwYXRobmFtZSA9PT0gJy9hcGkvcHJvc3BlY3RpbmdfZ2VuZXJhdGUucGhwJykge1xuICAgICAgICAgICAgY29uc3QgeyBmaWVsZHMgfSA9IGF3YWl0IHBhcnNlUmVxdWVzdEJvZHkocmVxKTtcbiAgICAgICAgICAgIGNvbnN0IGdyb3FSZXMgPSBhd2FpdCBjYWxsTExNKFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJvbGU6ICdzeXN0ZW0nLFxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBUdSBlcyB1biBleHBlcnQgZW4gY29sZCBlbWFpbGluZyBCMkIgaGF1dGUgY29udmVyc2lvbiBwb3VyIE1ESVYgQnVzaW5lc3MuXG5SXHUwMEU5ZGlnZSB1biBtZXNzYWdlIGQnb3V0cmVhY2ggcGVyc29ubmFsaXNcdTAwRTkgZGFucyBsYSBsYW5ndWUgZGVtYW5kXHUwMEU5ZSAoJHtmaWVsZHMubGFuZ3VhZ2UgfHwgJ0ZyYW5cdTAwRTdhaXMnfSkuXG5DaWJsZSA6ICR7ZmllbGRzLnRhcmdldENvbXBhbnl9ICgke2ZpZWxkcy5zZWN0b3J9KVxuRGVzdGluYXRhaXJlIDogJHtmaWVsZHMuY29udGFjdFJvbGV9XG5PZmZyZSA6ICR7ZmllbGRzLm9mZmVyfVxuVG9uIDogJHtmaWVsZHMudG9uZX1cblJcdTAwRTlwb25kcyBVTklRVUVNRU5UIGVuIEpTT04gc3RyaWN0IDpcbntcbiAgXCJpZFwiOiBcImNhbXBfJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMiwgOCl9XCIsXG4gIFwic3ViamVjdFwiOiBcIk9iamV0IGQnZW1haWwgaXJyXHUwMEU5c2lzdGlibGVcIixcbiAgXCJjb250ZW50XCI6IFwiQ29ycHMgY29tcGxldCBkdSBtZXNzYWdlLi4uXCIsXG4gIFwia3Bpc1wiOiB7XG4gICAgXCJpbXBhY3RTY29yZVwiOiA5MixcbiAgICBcImNsYXJpdHlTY29yZVwiOiA5NCxcbiAgICBcInBlcnNvbmFsaXphdGlvblNjb3JlXCI6IDkwLFxuICAgIFwiZW5nYWdlbWVudFNjb3JlXCI6IDg5LFxuICAgIFwiZXN0aW1hdGVkUmVhZFRpbWVTZWNvbmRzXCI6IDM1LFxuICAgIFwicGVyc3Vhc2lvbkxldmVsXCI6IFwiXHUwMEM5bGV2XHUwMEU5XCIsXG4gICAgXCJzdWdnZXN0aW9uc1wiOiBbXCJSZWxhbmNlciBcdTAwRTAgSis0XCIsIFwiTWV0dHJlIGVuIGF2YW50IHVuZSBcdTAwRTl0dWRlIGRlIGNhc1wiXVxuICB9LFxuICBcImRhdGVcIjogXCIke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdfVwiXG59YFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7IHJvbGU6ICd1c2VyJywgY29udGVudDogYEdcdTAwRTluXHUwMEU4cmUgbGEgY2FtcGFnbmUgZCdvdXRyZWFjaCBwb3VyICR7ZmllbGRzLnRhcmdldENvbXBhbnl9ICgke2ZpZWxkcy5jb250YWN0Um9sZX0pIGNvbmNlcm5hbnQgOiAke2ZpZWxkcy5vZmZlcn1gIH1cbiAgICAgICAgICAgIF0sIHRydWUpO1xuXG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5lbmQoZ3JvcVJlcy5jaG9pY2VzWzBdLm1lc3NhZ2UuY29udGVudCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAgIC8vIDExLiBHXHUwMEM5Tlx1MDBDOVJBVEVVUiBERSBMRUFEUyBCMkIgKFNVR0dFU1RJT05TIE1PRFx1MDBDOUxJU1x1MDBDOUVTIFBBUiBJQSlcbiAgICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgICAgaWYgKHBhdGhuYW1lID09PSAnL2FwaS9sZWFkc19zZWFyY2gucGhwJykge1xuICAgICAgICAgICAgY29uc3QgeyBmaWVsZHMgfSA9IGF3YWl0IHBhcnNlUmVxdWVzdEJvZHkocmVxKTtcbiAgICAgICAgICAgIGNvbnN0IGdyb3FSZXMgPSBhd2FpdCBjYWxsTExNKFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJvbGU6ICdzeXN0ZW0nLFxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBUdSBlcyB1biBtb3RldXIgZGUgcHJvc3BlY3Rpb24gZXQgZCdpbnRlbGxpZ2VuY2UgY29tbWVyY2lhbGUgQjJCIHBvdXIgTURJViBCdXNpbmVzcy5cblx1MDBDMCBwYXJ0aXIgZGVzIGZpbHRyZXMgZGVtYW5kXHUwMEU5cywgZ1x1MDBFOW5cdTAwRThyZSA0IGNvbXB0ZXMgZCdhZmZhaXJlcyBjaWJsZXMgY29oXHUwMEU5cmVudHMgZXQgaGF1dGVtZW50IHJlcHJcdTAwRTlzZW50YXRpZnMgZHUgbWFyY2hcdTAwRTkgcG91ciB0ZXN0ZXIgbCdhcHByb2NoZSBjb21tZXJjaWFsZS5cblJcdTAwQzhHTEUgRCdIT05OXHUwMENBVEVUXHUwMEM5IDogQ2VzIGZpY2hlcyBzb250IGRlcyBzdWdnZXN0aW9ucyBkJ2VudHJlcHJpc2VzIG1vZFx1MDBFOWxpc1x1MDBFOWVzIHNlbG9uIGxlcyBjcml0XHUwMEU4cmVzIHNhaXNpcy5cblJcdTAwRTlwb25kcyBVTklRVUVNRU5UIGVuIHRhYmxlYXUgSlNPTiB2YWxpZGUgOlxuW1xuICB7XG4gICAgXCJjb21wYW55TmFtZVwiOiBcIk5vbSBkZSBsJ2VudHJlcHJpc2VcIixcbiAgICBcInNlY3RvclwiOiBcIiR7ZmllbGRzLnNlY3RvciB8fCAnSW5kdXN0cmllJ31cIixcbiAgICBcInNpemVcIjogXCIke2ZpZWxkcy5jb21wYW55U2l6ZSB8fCAnNTAgXHUwMEUwIDI1MCBzYWxhcmlcdTAwRTlzJ31cIixcbiAgICBcImxvY2F0aW9uXCI6IFwiJHtmaWVsZHMucmVnaW9uIHx8ICdGcmFuY2UnfVwiLFxuICAgIFwid2Vic2l0ZVwiOiBcImh0dHBzOi8vd3d3Lm5vbS1lbnRyZXByaXNlLmZyXCIsXG4gICAgXCJkaWdpdGFsTWF0dXJpdHlTY29yZVwiOiBcIk1veWVuXCIsXG4gICAgXCJhaVBvdGVudGlhbFNjb3JlXCI6IFwiXHUwMEM5bGV2XHUwMEU5XCIsXG4gICAgXCJwdXJjaGFzZVByb2JhYmlsaXR5XCI6IFwiXHUwMEM5bGV2XHUwMEU5XCIsXG4gICAgXCJkZWNpc2lvbk1ha2VyTmFtZVwiOiBcIlByXHUwMEU5bm9tIE5vbVwiLFxuICAgIFwiZGVjaXNpb25NYWtlckZ1bmN0aW9uXCI6IFwiJHtmaWVsZHMudGFyZ2V0RnVuY3Rpb24gfHwgJ0RpcmVjdGV1ciBHXHUwMEU5blx1MDBFOXJhbCd9XCIsXG4gICAgXCJ0ZWNobm9sb2dpZXNVc2VkXCI6IFtcIkVSUFwiLCBcIk1pY3Jvc29mdCAzNjVcIl1cbiAgfVxuXWBcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgeyByb2xlOiAndXNlcicsIGNvbnRlbnQ6IGBTZWN0ZXVyIDogJHtmaWVsZHMuc2VjdG9yfSwgUGF5cyA6ICR7ZmllbGRzLmNvdW50cnl9LCBUYWlsbGUgOiAke2ZpZWxkcy5jb21wYW55U2l6ZX0sIERcdTAwRTljaWRldXIgOiAke2ZpZWxkcy50YXJnZXRGdW5jdGlvbn1gIH1cbiAgICAgICAgICAgIF0sIHRydWUpO1xuXG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5lbmQoZ3JvcVJlcy5jaG9pY2VzWzBdLm1lc3NhZ2UuY29udGVudCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAgIC8vIDEyLiBQUlx1MDBDOVBBUkFUSU9OIERFIFJcdTAwQzlVTklPTlMgSUEgKEJSSUVGSU5HIFJcdTAwQzlFTClcbiAgICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgICAgaWYgKHBhdGhuYW1lID09PSAnL2FwaS9tZWV0aW5nX3ByZXBfZ2VuZXJhdGUucGhwJykge1xuICAgICAgICAgICAgY29uc3QgeyBmaWVsZHMgfSA9IGF3YWl0IHBhcnNlUmVxdWVzdEJvZHkocmVxKTtcbiAgICAgICAgICAgIGNvbnN0IGNsaWVudE5hbWUgPSBmaWVsZHMuY2xpZW50TmFtZSB8fCAnUHJvc3BlY3QgTURJVic7XG4gICAgICAgICAgICBjb25zdCBtZWV0aW5nRGF0ZSA9IGZpZWxkcy5tZWV0aW5nRGF0ZSB8fCAnUHJvY2hhaW5lbWVudCc7XG4gICAgICAgICAgICBjb25zdCBtZWV0aW5nQ29udGV4dCA9IGZpZWxkcy5tZWV0aW5nQ29udGV4dCB8fCAnQ2FkcmFnZSBpbml0aWFsJztcbiAgICAgICAgICAgIGNvbnN0IG1lZXRpbmdPYmplY3RpdmUgPSBmaWVsZHMubWVldGluZ09iamVjdGl2ZSB8fCAnRFx1MDBFOWZpbmlyIGxlcyBiZXNvaW5zIGV0IGNvbnZlbmlyIGRlcyBcdTAwRTl0YXBlcyc7XG5cbiAgICAgICAgICAgIGNvbnN0IGdyb3FSZXMgPSBhd2FpdCBjYWxsTExNKFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJvbGU6ICdzeXN0ZW0nLFxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBUdSBlcyB1biBjb2FjaCBlbiBuXHUwMEU5Z29jaWF0aW9uIHN0cmF0XHUwMEU5Z2lxdWUgZXQgZGlyZWN0ZXVyIGQnYXZhbnQtdmVudGUgcG91ciBNRElWIEJ1c2luZXNzLlxuUlx1MDBFOWRpZ2UgdW4gYnJpZWZpbmcgZCdhdmFudC1SRFYgY29tcGxldCBldCBpbW1cdTAwRTlkaWF0ZW1lbnQgZXhwbG9pdGFibGUgcGFyIGxlIGNvbW1lcmNpYWwgb3UgZGlyaWdlYW50LlxuVHUgZG9pcyByXHUwMEU5cG9uZHJlIFVOSVFVRU1FTlQgcGFyIHVuIG9iamV0IEpTT04gdmFsaWRlIHN1aXZhbnQgZXhhY3RlbWVudCBjZXR0ZSBzdHJ1Y3R1cmUgOlxue1xuICBcIm9uZUxpbmVyU3VtbWFyeVwiOiBcIlN5bnRoXHUwMEU4c2UgZW4gdW5lIHBocmFzZSBkZSBsJ2VuamV1IGNhcGl0YWwgZGUgY2UgcmVuZGV6LXZvdXMuXCIsXG4gIFwiY2xpZW50U3VtbWFyeVwiOiBcIlJcdTAwRTlzdW1cdTAwRTkgY29uY2lzIGRlIGxhIHNpdHVhdGlvbiBkdSBjbGllbnQgZXQgZGUgc2VzIGF0dGVudGVzIHByaW9yaXRhaXJlcy5cIixcbiAgXCJvcHBvcnR1bml0aWVzXCI6IFtcIk9wcG9ydHVuaXRcdTAwRTkgMVwiLCBcIk9wcG9ydHVuaXRcdTAwRTkgMlwiXSxcbiAgXCJyaXNrc1wiOiBbXCJSaXNxdWUgMSBcdTAwRTAgYW50aWNpcGVyXCIsIFwiUmlzcXVlIDJcIl0sXG4gIFwicHJvYmFibGVPYmplY3Rpb25zXCI6IFtcIk9iamVjdGlvbiBwclx1MDBFOXZpc2libGUgKGV4OiBjb1x1MDBGQnQsIGRcdTAwRTlsYWlzLCBzXHUwMEU5Y3VyaXRcdTAwRTkpIGV0IGNvbW1lbnQgeSByXHUwMEU5cG9uZHJlLlwiXSxcbiAgXCJyZWNvbW1lbmRlZFF1ZXN0aW9uc1wiOiBbXCJRdWVzdGlvbiBvdXZlcnRlIHBlcmN1dGFudGUgMVwiLCBcIlF1ZXN0aW9uIDJcIl0sXG4gIFwiZGlzY292ZXJ5U3RyYXRlZ3lcIjogXCJDb25zZWlsIHRhY3RpcXVlIGQnXHUwMEU5Y291dGUgYWN0aXZlIGV0IGRlIHBvc3R1cmUgY29tbWVyY2lhbGUuLi5cIixcbiAgXCJtZWV0aW5nT2JqZWN0aXZlc1wiOiBbXCJPYmplY3RpZiBtaW5pbXVtIDogLi4uXCIsIFwiT2JqZWN0aWYgaWRcdTAwRTlhbCA6IC4uLlwiXSxcbiAgXCJyZWNvbW1lbmRlZEFjdGlvbnNcIjogW1wiQWN0aW9uIGltbVx1MDBFOWRpYXRlIFx1MDBFMCBlbmdhZ2VyIFx1MDBFMCBsYSBmaW4gZHUgUkRWXCJdXG59YFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcm9sZTogJ3VzZXInLFxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBDbGllbnQgOiAke2NsaWVudE5hbWV9XFxuRGF0ZSA6ICR7bWVldGluZ0RhdGV9XFxuT2JqZWN0aWYgOiAke21lZXRpbmdPYmplY3RpdmV9XFxuQ29udGV4dGUgOiAke21lZXRpbmdDb250ZXh0fWBcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXSwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgICByZXR1cm4gcmVzLmVuZChncm9xUmVzLmNob2ljZXNbMF0ubWVzc2FnZS5jb250ZW50KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgICAgLy8gMTMuIEFTU0lTVEFOVCBERVZJUyBJQSAoTElHTkVTICYgQ0hJRkZSQUdFIFNVR0dcdTAwQzlSXHUwMEM5UyBQQVIgTExNKVxuICAgICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgICBpZiAocGF0aG5hbWUgPT09ICcvYXBpL3F1b3RlX2FpX2Fzc2lzdC5waHAnKSB7XG4gICAgICAgICAgICBjb25zdCB7IGZpZWxkcyB9ID0gYXdhaXQgcGFyc2VSZXF1ZXN0Qm9keShyZXEpO1xuICAgICAgICAgICAgY29uc3QgZ3JvcVJlcyA9IGF3YWl0IGNhbGxMTE0oW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcm9sZTogJ3N5c3RlbScsXG4gICAgICAgICAgICAgICAgY29udGVudDogYFR1IGVzIHVuIGRpcmVjdGV1ciBjb21tZXJjaWFsIGV0IHRhcmlmaWNhdGV1ciBwb3VyIE1ESVYgQnVzaW5lc3MuXG5EXHUwMEU5Y29tcG9zZSBsYSBkZW1hbmRlIGNsaWVudCBlbiBwcmVzdGF0aW9ucyB2YWxvcmlzXHUwMEU5ZXMgZXQgY29oXHUwMEU5cmVudGVzLlxuUlx1MDBFOXBvbmRzIGVuIEpTT04gc3RyaWN0IDpcbntcbiAgXCJzdWdnZXN0ZWRMaW5lc1wiOiBbXG4gICAgeyBcImlkXCI6IFwiMVwiLCBcImRlc2NyaXB0aW9uXCI6IFwiUHJlc3RhdGlvbiBkXHUwMEU5dGFpbGxcdTAwRTllIDFcIiwgXCJxdWFudGl0eVwiOiAxLCBcInVuaXRQcmljZUhUXCI6IDE1MDAsIFwidmF0UmF0ZVwiOiAyMCwgXCJkaXNjb3VudFBlcmNlbnRhZ2VcIjogMCB9LFxuICAgIHsgXCJpZFwiOiBcIjJcIiwgXCJkZXNjcmlwdGlvblwiOiBcIlByZXN0YXRpb24gZFx1MDBFOXRhaWxsXHUwMEU5ZSAyXCIsIFwicXVhbnRpdHlcIjogMSwgXCJ1bml0UHJpY2VIVFwiOiAyNTAwLCBcInZhdFJhdGVcIjogMjAsIFwiZGlzY291bnRQZXJjZW50YWdlXCI6IDAgfVxuICBdLFxuICBcImV4ZWN1dGl2ZVN1bW1hcnlcIjogXCJQclx1MDBFOXNlbnRhdGlvbiBwZXJjdXRhbnRlIGRlIGwnb2ZmcmUuLi5cIixcbiAgXCJwYXltZW50VGVybXNcIjogXCJBY29tcHRlIGRlIDMwJSBcdTAwRTAgbGEgY29tbWFuZGUsIHNvbGRlIFx1MDBFMCBsYSBsaXZyYWlzb24uXCJcbn1gXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHsgcm9sZTogJ3VzZXInLCBjb250ZW50OiBgQ2xpZW50OiAke2ZpZWxkcy5jbGllbnRDb250ZXh0IHx8ICdDbGllbnQnfVxcblByb2pldDogJHtmaWVsZHMucHJvamVjdERlc2NyaXB0aW9uIHx8ICdBY2NvbXBhZ25lbWVudCBkaWdpdGFsJ31gIH1cbiAgICAgICAgICAgIF0sIHRydWUpO1xuXG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5lbmQoZ3JvcVJlcy5jaG9pY2VzWzBdLm1lc3NhZ2UuY29udGVudCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAgIC8vIDE0LiBCRU5DSE1BUksgRElHSVRBTCAoU1RBVElTVElRVUVTICYgRU5SRUdJU1RSRU1FTlQpXG4gICAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAgIGlmIChwYXRobmFtZSA9PT0gJy9hcGkvYmVuY2htYXJrX3N0YXRzLnBocCcpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlY3RvciA9IHVybE9iai5zZWFyY2hQYXJhbXMuZ2V0KCdzZWN0b3InKSB8fCAnSW5kdXN0cmllJztcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgICByZXR1cm4gcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgIHNlY3RvcixcbiAgICAgICAgICAgICAgZ2xvYmFsX2F2ZzogNTQsXG4gICAgICAgICAgICAgIGdsb2JhbF90b3AxMDogODYsXG4gICAgICAgICAgICAgIGFpX2F2ZzogNDIsXG4gICAgICAgICAgICAgIGRhdGFfYXZnOiA0OCxcbiAgICAgICAgICAgICAgcHJvY2Vzc19hdmc6IDYxLFxuICAgICAgICAgICAgICBpbmZyYV9hdmc6IDU3LFxuICAgICAgICAgICAgICBjdWx0dXJlX2F2ZzogNDksXG4gICAgICAgICAgICAgIHN0cmF0ZWd5X2F2ZzogNTVcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAocGF0aG5hbWUgPT09ICcvYXBpL2JlbmNobWFya19zdWJtaXQucGhwJykge1xuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICAgIHJldHVybiByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgbWVzc2FnZTogJ0F1ZGl0IGRlIG1hdHVyaXRcdTAwRTkgZW5yZWdpc3RyXHUwMEU5IGF2ZWMgc3VjY1x1MDBFOHMuJ1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEZhbGxiYWNrIHBhciBkXHUwMEU5ZmF1dCBwb3VyIGxlcyBlbmRwb2ludHMgbm9uIGNhcHR1clx1MDBFOXNcbiAgICAgICAgICBuZXh0KCk7XG4gICAgICAgIH0gY2F0Y2ggKGU6IGFueSkge1xuICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwO1xuICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBlLm1lc3NhZ2UgfHwgXCJFcnJldXIgaW50ZXJuZSBkdSBzZXJ2ZXVyIGRlIGRcdTAwRTl2ZWxvcHBlbWVudC5cIiB9KSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBd2UsU0FBUyxvQkFBb0I7QUFDcmdCLE9BQU8sV0FBVztBQUNsQixPQUFPQSxXQUFVO0FBQ2pCLFNBQVMsdUJBQXVCOzs7QUNEaEMsT0FBTyxRQUFRO0FBQ2YsT0FBTyxVQUFVO0FBRWpCLFNBQVMsVUFBVSxLQUFxQjtBQUN0QyxNQUFJLFFBQVEsSUFBSSxHQUFHLEVBQUcsUUFBTyxRQUFRLElBQUksR0FBRztBQUM1QyxNQUFJO0FBQ0YsVUFBTSxVQUFVLEtBQUssUUFBUSxRQUFRLElBQUksR0FBRyxNQUFNO0FBQ2xELFFBQUksR0FBRyxXQUFXLE9BQU8sR0FBRztBQUMxQixZQUFNLFVBQVUsR0FBRyxhQUFhLFNBQVMsT0FBTztBQUNoRCxpQkFBVyxRQUFRLFFBQVEsTUFBTSxJQUFJLEdBQUc7QUFDdEMsY0FBTSxVQUFVLEtBQUssS0FBSztBQUMxQixZQUFJLENBQUMsV0FBVyxRQUFRLFdBQVcsR0FBRyxFQUFHO0FBQ3pDLGNBQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLFFBQVEsTUFBTSxHQUFHO0FBQ25DLFlBQUksRUFBRSxLQUFLLE1BQU0sSUFBSyxRQUFPLEVBQUUsS0FBSyxHQUFHLEVBQUUsS0FBSztBQUFBLE1BQ2hEO0FBQUEsSUFDRjtBQUFBLEVBQ0YsUUFBUTtBQUFBLEVBQUM7QUFDVCxTQUFPO0FBQ1Q7QUFFQSxJQUFNLGVBQWUsVUFBVSxjQUFjO0FBQzdDLElBQU0saUJBQWlCLFVBQVUsZ0JBQWdCO0FBQ2pELElBQU0sa0JBQWtCLFVBQVUsaUJBQWlCO0FBQ25ELElBQU0sV0FBVyxVQUFVLFVBQVUsS0FBSztBQUUxQyxJQUFNLFdBQVc7QUFDakIsSUFBTSxhQUFhO0FBQ25CLElBQU0sY0FBYztBQUdwQixJQUFNLGNBQWMsS0FBSyxRQUFRLFFBQVEsSUFBSSxHQUFHLGFBQWE7QUFDN0QsU0FBUyxZQUFvRztBQUMzRyxNQUFJO0FBQ0YsUUFBSSxHQUFHLFdBQVcsV0FBVyxHQUFHO0FBQzlCLGFBQU8sS0FBSyxNQUFNLEdBQUcsYUFBYSxhQUFhLE9BQU8sQ0FBQztBQUFBLElBQ3pEO0FBQUEsRUFDRixRQUFRO0FBQUEsRUFBQztBQUNULFNBQU87QUFBQSxJQUNMLFNBQVMsQ0FBQztBQUFBLElBQ1YsVUFBVSxDQUFDO0FBQUEsSUFDWCxRQUFRLENBQUM7QUFBQSxJQUNULFdBQVcsQ0FBQztBQUFBLElBQ1osWUFBWTtBQUFBLE1BQ1YsaUJBQWlCO0FBQUEsTUFDakIsV0FBVztBQUFBLE1BQ1gsYUFBYTtBQUFBLE1BQ2IsY0FBYztBQUFBLE1BQ2QsYUFBYTtBQUFBLE1BQ2IsaUJBQWlCO0FBQUEsSUFDbkI7QUFBQSxFQUNGO0FBQ0Y7QUFFQSxTQUFTLFVBQVUsTUFBVztBQUM1QixNQUFJO0FBQ0YsT0FBRyxjQUFjLGFBQWEsS0FBSyxVQUFVLE1BQU0sTUFBTSxDQUFDLEdBQUcsT0FBTztBQUFBLEVBQ3RFLFFBQVE7QUFBQSxFQUFDO0FBQ1g7QUFFQSxlQUFlLGlCQUFpQixVQUFpQixVQUFtQixRQUFRLG9CQUFvQixjQUFjLEtBQUs7QUFDakgsTUFBSSxDQUFDLGFBQWMsT0FBTSxJQUFJLE1BQU0sdUNBQWlDO0FBQ3BFLFFBQU0sT0FBWSxFQUFFLE9BQU8sVUFBVSxZQUFZO0FBQ2pELE1BQUksU0FBVSxNQUFLLGtCQUFrQixFQUFFLE1BQU0sY0FBYztBQUUzRCxRQUFNLE1BQU0sTUFBTSxNQUFNLFVBQVU7QUFBQSxJQUNoQyxRQUFRO0FBQUEsSUFDUixTQUFTLEVBQUUsaUJBQWlCLFVBQVUsWUFBWSxJQUFJLGdCQUFnQixtQkFBbUI7QUFBQSxJQUN6RixNQUFNLEtBQUssVUFBVSxJQUFJO0FBQUEsRUFDM0IsQ0FBQztBQUVELE1BQUksQ0FBQyxJQUFJLElBQUk7QUFDWCxVQUFNLFNBQVMsTUFBTSxJQUFJLEtBQUs7QUFDOUIsVUFBTSxJQUFJLE1BQU0sU0FBUyxJQUFJLE1BQU0sTUFBTSxPQUFPLE1BQU0sR0FBRyxHQUFHLENBQUMsRUFBRTtBQUFBLEVBQ2pFO0FBQ0EsU0FBTyxNQUFNLElBQUksS0FBSztBQUN4QjtBQUVBLGVBQWUsbUJBQW1CLFVBQWlCLFVBQW1CLFFBQVEsZUFBZSxjQUFjLEtBQUs7QUFDOUcsTUFBSSxDQUFDLGVBQWdCLE9BQU0sSUFBSSxNQUFNLHlDQUFtQztBQUN4RSxRQUFNLE9BQVksRUFBRSxPQUFPLFVBQVUsWUFBWTtBQUNqRCxNQUFJLFNBQVUsTUFBSyxrQkFBa0IsRUFBRSxNQUFNLGNBQWM7QUFFM0QsUUFBTSxNQUFNLE1BQU0sTUFBTSxZQUFZO0FBQUEsSUFDbEMsUUFBUTtBQUFBLElBQ1IsU0FBUyxFQUFFLGlCQUFpQixVQUFVLGNBQWMsSUFBSSxnQkFBZ0IsbUJBQW1CO0FBQUEsSUFDM0YsTUFBTSxLQUFLLFVBQVUsSUFBSTtBQUFBLEVBQzNCLENBQUM7QUFFRCxNQUFJLENBQUMsSUFBSSxJQUFJO0FBQ1gsVUFBTSxTQUFTLE1BQU0sSUFBSSxLQUFLO0FBQzlCLFVBQU0sSUFBSSxNQUFNLFdBQVcsSUFBSSxNQUFNLE1BQU0sT0FBTyxNQUFNLEdBQUcsR0FBRyxDQUFDLEVBQUU7QUFBQSxFQUNuRTtBQUNBLFNBQU8sTUFBTSxJQUFJLEtBQUs7QUFDeEI7QUFFQSxlQUFlLG9CQUFvQixVQUFpQixVQUFtQixRQUFRLHdCQUF3QixjQUFjLEtBQUs7QUFDeEgsTUFBSSxDQUFDLGdCQUFpQixPQUFNLElBQUksTUFBTSwwQ0FBb0M7QUFDMUUsUUFBTSxPQUFZLEVBQUUsT0FBTyxVQUFVLFlBQVk7QUFDakQsTUFBSSxTQUFVLE1BQUssa0JBQWtCLEVBQUUsTUFBTSxjQUFjO0FBRTNELFFBQU0sTUFBTSxNQUFNLE1BQU0sYUFBYTtBQUFBLElBQ25DLFFBQVE7QUFBQSxJQUNSLFNBQVMsRUFBRSxpQkFBaUIsVUFBVSxlQUFlLElBQUksZ0JBQWdCLG1CQUFtQjtBQUFBLElBQzVGLE1BQU0sS0FBSyxVQUFVLElBQUk7QUFBQSxFQUMzQixDQUFDO0FBRUQsTUFBSSxDQUFDLElBQUksSUFBSTtBQUNYLFVBQU0sU0FBUyxNQUFNLElBQUksS0FBSztBQUM5QixVQUFNLElBQUksTUFBTSxZQUFZLElBQUksTUFBTSxNQUFNLE9BQU8sTUFBTSxHQUFHLEdBQUcsQ0FBQyxFQUFFO0FBQUEsRUFDcEU7QUFDQSxTQUFPLE1BQU0sSUFBSSxLQUFLO0FBQ3hCO0FBS0EsZUFBZSxRQUFRLFVBQWlCLFdBQVcsT0FBcUI7QUFDdEUsUUFBTSxLQUFLLFVBQVU7QUFDckIsUUFBTSxXQUFXLEdBQUcsY0FBYztBQUFBLElBQ2hDLGlCQUFpQjtBQUFBLElBQ2pCLFdBQVc7QUFBQSxJQUNYLGFBQWE7QUFBQSxJQUNiLGNBQWM7QUFBQSxJQUNkLGFBQWE7QUFBQSxJQUNiLGlCQUFpQjtBQUFBLEVBQ25CO0FBRUEsUUFBTSxVQUFVLFNBQVMsbUJBQW1CO0FBQzVDLFFBQU0sV0FBVyxTQUFTLG9CQUFvQjtBQUc5QyxRQUFNLFdBQWlELENBQUM7QUFDeEQsTUFBSSxZQUFZLFVBQVU7QUFDeEIsYUFBUyxLQUFLLFFBQVE7QUFDdEIsUUFBSSxTQUFVLFVBQVMsS0FBSyxRQUFRLFNBQVM7QUFBQSxFQUMvQyxXQUFXLFlBQVksV0FBVztBQUNoQyxhQUFTLEtBQUssU0FBUztBQUN2QixRQUFJLFNBQVUsVUFBUyxLQUFLLFFBQVEsUUFBUTtBQUFBLEVBQzlDLFdBQVcsWUFBWSxRQUFRO0FBQzdCLGFBQVMsS0FBSyxNQUFNO0FBQ3BCLFFBQUksU0FBVSxVQUFTLEtBQUssVUFBVSxTQUFTO0FBQUEsRUFDakQsT0FBTztBQUVMLGFBQVMsS0FBSyxRQUFRLFVBQVUsU0FBUztBQUFBLEVBQzNDO0FBRUEsUUFBTSxTQUFtQixDQUFDO0FBRTFCLGFBQVcsUUFBUSxVQUFVO0FBQzNCLFFBQUk7QUFDRixVQUFJLFNBQVMsUUFBUTtBQUNuQixlQUFPLE1BQU0saUJBQWlCLFVBQVUsVUFBVSxTQUFTLGFBQWEsb0JBQW9CLFNBQVMsZUFBZSxHQUFHO0FBQUEsTUFDekg7QUFDQSxVQUFJLFNBQVMsVUFBVTtBQUNyQixlQUFPLE1BQU0sbUJBQW1CLFVBQVUsVUFBVSxTQUFTLGVBQWUsZUFBZSxTQUFTLGVBQWUsR0FBRztBQUFBLE1BQ3hIO0FBQ0EsVUFBSSxTQUFTLFdBQVc7QUFDdEIsZUFBTyxNQUFNLG9CQUFvQixVQUFVLFVBQVUsU0FBUyxnQkFBZ0Isd0JBQXdCLFNBQVMsZUFBZSxHQUFHO0FBQUEsTUFDbkk7QUFBQSxJQUNGLFNBQVMsS0FBVTtBQUNqQixhQUFPLEtBQUssSUFBSSxPQUFPO0FBQUEsSUFDekI7QUFBQSxFQUNGO0FBRUEsUUFBTSxJQUFJLE1BQU0sdURBQThDLE9BQU8sS0FBSyxLQUFLLENBQUMsRUFBRTtBQUNwRjtBQUtBLFNBQVMsaUJBQWlCLEtBQXFJO0FBQzdKLFNBQU8sSUFBSSxRQUFRLENBQUMsWUFBWTtBQUM5QixVQUFNLFNBQW1CLENBQUM7QUFDMUIsUUFBSSxHQUFHLFFBQVEsV0FBUztBQUFFLGFBQU8sS0FBSyxPQUFPLFNBQVMsS0FBSyxJQUFJLFFBQVEsT0FBTyxLQUFLLEtBQUssQ0FBQztBQUFBLElBQUcsQ0FBQztBQUM3RixRQUFJLEdBQUcsT0FBTyxNQUFNO0FBQ2xCLFlBQU0sU0FBUyxPQUFPLE9BQU8sTUFBTTtBQUNuQyxZQUFNLGNBQWMsSUFBSSxRQUFRLGNBQWMsS0FBSztBQUVuRCxVQUFJLFlBQVksU0FBUyxrQkFBa0IsR0FBRztBQUM1QyxZQUFJO0FBQ0YsZ0JBQU0sU0FBUyxLQUFLLE1BQU0sT0FBTyxTQUFTLE9BQU8sQ0FBQztBQUNsRCxpQkFBTyxRQUFRLEVBQUUsUUFBUSxRQUFRLE9BQU8sQ0FBQyxFQUFFLENBQUM7QUFBQSxRQUM5QyxRQUFRO0FBQ04saUJBQU8sUUFBUSxFQUFFLFFBQVEsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7QUFBQSxRQUMxQztBQUFBLE1BQ0Y7QUFFQSxVQUFJLFlBQVksU0FBUyxxQkFBcUIsR0FBRztBQUMvQyxjQUFNLGdCQUFnQixZQUFZLE1BQU0saUNBQWlDO0FBQ3pFLGNBQU0sV0FBVyxnQkFBaUIsY0FBYyxDQUFDLEtBQUssY0FBYyxDQUFDLElBQUs7QUFFMUUsWUFBSSxVQUFVO0FBQ1osZ0JBQU0sWUFBWSxPQUFPLFNBQVMsUUFBUTtBQUMxQyxnQkFBTSxRQUFRLFVBQVUsTUFBTSxPQUFPLFFBQVE7QUFDN0MsZ0JBQU0sU0FBOEIsQ0FBQztBQUNyQyxnQkFBTSxRQUFpRSxDQUFDO0FBRXhFLHFCQUFXLFFBQVEsT0FBTztBQUN4QixnQkFBSSxDQUFDLFFBQVEsS0FBSyxLQUFLLE1BQU0sTUFBTSxLQUFLLEtBQUssTUFBTSxLQUFNO0FBQ3pELGtCQUFNLFlBQVksS0FBSyxRQUFRLFVBQVU7QUFDekMsZ0JBQUksY0FBYyxHQUFJO0FBRXRCLGtCQUFNLGFBQWEsS0FBSyxNQUFNLEdBQUcsU0FBUztBQUMxQyxrQkFBTSxXQUFXLEtBQUssTUFBTSxZQUFZLENBQUMsRUFBRSxRQUFRLFNBQVMsRUFBRTtBQUU5RCxrQkFBTSxZQUFZLFdBQVcsTUFBTSxpQkFBaUI7QUFDcEQsa0JBQU0sZ0JBQWdCLFdBQVcsTUFBTSxxQkFBcUI7QUFFNUQsZ0JBQUksV0FBVztBQUNiLG9CQUFNLFlBQVksVUFBVSxDQUFDO0FBQzdCLGtCQUFJLGVBQWU7QUFDakIsc0JBQU0sV0FBVyxjQUFjLENBQUM7QUFDaEMsc0JBQU0sY0FBYyxPQUFPLEtBQUssVUFBVSxRQUFRLEVBQUUsU0FBUyxPQUFPO0FBQ3BFLHNCQUFNLEtBQUssRUFBRSxNQUFNLFdBQVcsVUFBVSxNQUFNLFlBQVksQ0FBQztBQUFBLGNBQzdELE9BQU87QUFDTCx1QkFBTyxTQUFTLElBQUksT0FBTyxLQUFLLFVBQVUsUUFBUSxFQUFFLFNBQVMsT0FBTztBQUFBLGNBQ3RFO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFDQSxpQkFBTyxRQUFRLEVBQUUsUUFBUSxNQUFNLENBQUM7QUFBQSxRQUNsQztBQUFBLE1BQ0Y7QUFHQSxVQUFJO0FBQ0YsY0FBTSxNQUFNLE9BQU8sU0FBUyxPQUFPO0FBQ25DLGNBQU0sU0FBUyxJQUFJLGdCQUFnQixHQUFHO0FBQ3RDLGNBQU0sU0FBOEIsQ0FBQztBQUNyQyxlQUFPLFFBQVEsQ0FBQyxHQUFHLE1BQU07QUFBRSxpQkFBTyxDQUFDLElBQUk7QUFBQSxRQUFHLENBQUM7QUFDM0MsZUFBTyxRQUFRLEVBQUUsUUFBUSxPQUFPLENBQUMsRUFBRSxDQUFDO0FBQUEsTUFDdEMsUUFBUTtBQUNOLGVBQU8sUUFBUSxFQUFFLFFBQVEsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7QUFBQSxNQUMxQztBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0gsQ0FBQztBQUNIO0FBVUEsSUFBTSxXQUFXLG9CQUFJLElBQXVCO0FBUTVDLElBQU0sZUFBZSxvQkFBSSxJQUEyQjtBQUU3QyxTQUFTLGVBQXVCO0FBQ3JDLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLGdCQUFnQixRQUF1QjtBQUNyQyxhQUFPLFlBQVksSUFBSSxPQUFPLEtBQUssS0FBSyxTQUFTO0FBQy9DLGNBQU0sU0FBUyxJQUFJLElBQUksSUFBSSxPQUFPLEtBQUssdUJBQXVCO0FBQzlELGNBQU0sV0FBVyxPQUFPO0FBRXhCLFlBQUksQ0FBQyxTQUFTLFdBQVcsT0FBTyxHQUFHO0FBQ2pDLGlCQUFPLEtBQUs7QUFBQSxRQUNkO0FBRUEsWUFBSSxVQUFVLCtCQUErQixHQUFHO0FBQ2hELFlBQUksVUFBVSxnQ0FBZ0Msb0JBQW9CO0FBQ2xFLFlBQUksVUFBVSxnQ0FBZ0MsNkJBQTZCO0FBQzNFLFlBQUksVUFBVSxlQUFlLFFBQVE7QUFFckMsWUFBSSxJQUFJLFdBQVcsV0FBVztBQUM1QixjQUFJLGFBQWE7QUFDakIsaUJBQU8sSUFBSSxJQUFJO0FBQUEsUUFDakI7QUFFQSxZQUFJO0FBSUYsY0FBSSxhQUFhLHdCQUF3QjtBQUN2QyxrQkFBTUMsTUFBSyxVQUFVO0FBQ3JCLGdCQUFJLElBQUksV0FBVyxPQUFPO0FBQ3hCLGtCQUFJLFVBQVUsZ0JBQWdCLGtCQUFrQjtBQUNoRCxxQkFBTyxJQUFJLElBQUksS0FBSyxVQUFVO0FBQUEsZ0JBQzVCLFNBQVM7QUFBQSxnQkFDVCxVQUFVQSxJQUFHLGNBQWM7QUFBQSxrQkFDekIsaUJBQWlCO0FBQUEsa0JBQ2pCLFdBQVc7QUFBQSxrQkFDWCxhQUFhO0FBQUEsa0JBQ2IsY0FBYztBQUFBLGtCQUNkLGFBQWE7QUFBQSxrQkFDYixpQkFBaUI7QUFBQSxnQkFDbkI7QUFBQSxjQUNGLENBQUMsQ0FBQztBQUFBLFlBQ0o7QUFFQSxnQkFBSSxJQUFJLFdBQVcsUUFBUTtBQUN6QixvQkFBTSxFQUFFLE9BQU8sSUFBSSxNQUFNLGlCQUFpQixHQUFHO0FBQzdDLG9CQUFNLGNBQWM7QUFBQSxnQkFDbEIsaUJBQWlCLE9BQU8sbUJBQW1CO0FBQUEsZ0JBQzNDLFdBQVcsT0FBTyxhQUFhO0FBQUEsZ0JBQy9CLGFBQWEsT0FBTyxlQUFlO0FBQUEsZ0JBQ25DLGNBQWMsT0FBTyxnQkFBZ0I7QUFBQSxnQkFDckMsYUFBYSxPQUFPLE9BQU8sZ0JBQWdCLFdBQVcsT0FBTyxjQUFjLFdBQVcsT0FBTyxlQUFlLEtBQUs7QUFBQSxnQkFDakgsaUJBQWlCLE9BQU8sb0JBQW9CLFNBQVMsT0FBTyxvQkFBb0I7QUFBQSxjQUNsRjtBQUVBLGNBQUFBLElBQUcsYUFBYTtBQUNoQix3QkFBVUEsR0FBRTtBQUVaLGtCQUFJO0FBQ0Ysc0JBQU0sbUJBQW1CLEtBQUssUUFBUSxRQUFRLElBQUksR0FBRyw2QkFBNkI7QUFDbEYsbUJBQUcsY0FBYyxrQkFBa0IsS0FBSyxVQUFVLGFBQWEsTUFBTSxDQUFDLEdBQUcsT0FBTztBQUFBLGNBQ2xGLFFBQVE7QUFBQSxjQUFDO0FBRVQsa0JBQUksVUFBVSxnQkFBZ0Isa0JBQWtCO0FBQ2hELHFCQUFPLElBQUksSUFBSSxLQUFLLFVBQVU7QUFBQSxnQkFDNUIsU0FBUztBQUFBLGdCQUNULFNBQVM7QUFBQSxnQkFDVCxVQUFVQSxJQUFHO0FBQUEsY0FDZixDQUFDLENBQUM7QUFBQSxZQUNKO0FBQUEsVUFDRjtBQUVBLGNBQUksYUFBYSw2QkFBNkI7QUFDNUMsa0JBQU0sRUFBRSxPQUFPLElBQUksTUFBTSxpQkFBaUIsR0FBRztBQUM3QyxrQkFBTSxXQUFXLE9BQU8sWUFBWTtBQUNwQyxrQkFBTSxRQUFRLE9BQU87QUFDckIsa0JBQU0sWUFBWSxLQUFLLElBQUk7QUFFM0Isa0JBQU0sZUFBZTtBQUFBLGNBQ25CLEVBQUUsTUFBTSxVQUFVLFNBQVMsK0RBQTREO0FBQUEsY0FDdkYsRUFBRSxNQUFNLFFBQVEsU0FBUyxrREFBNEM7QUFBQSxZQUN2RTtBQUVBLGdCQUFJO0FBQ0Ysa0JBQUksa0JBQWtCO0FBQ3RCLGtCQUFJLGFBQWEsUUFBUTtBQUN2QixzQkFBTSxVQUFVLE1BQU0saUJBQWlCLGNBQWMsT0FBTyxTQUFTLG9CQUFvQixHQUFHO0FBQzVGLGtDQUFrQixTQUFTLFVBQVUsQ0FBQyxHQUFHLFNBQVMsV0FBVztBQUFBLGNBQy9ELFdBQVcsYUFBYSxVQUFVO0FBQ2hDLHNCQUFNLFlBQVksTUFBTSxtQkFBbUIsY0FBYyxPQUFPLFNBQVMsZUFBZSxHQUFHO0FBQzNGLGtDQUFrQixXQUFXLFVBQVUsQ0FBQyxHQUFHLFNBQVMsV0FBVztBQUFBLGNBQ2pFLFdBQVcsYUFBYSxXQUFXO0FBQ2pDLHNCQUFNLGFBQWEsTUFBTSxvQkFBb0IsY0FBYyxPQUFPLFNBQVMsd0JBQXdCLEdBQUc7QUFDdEcsa0NBQWtCLFlBQVksVUFBVSxDQUFDLEdBQUcsU0FBUyxXQUFXO0FBQUEsY0FDbEUsT0FBTztBQUNMLHNCQUFNLElBQUksTUFBTSxlQUFlLFFBQVEsVUFBVTtBQUFBLGNBQ25EO0FBRUEsb0JBQU0sVUFBVSxLQUFLLElBQUksSUFBSTtBQUM3QixrQkFBSSxVQUFVLGdCQUFnQixrQkFBa0I7QUFDaEQscUJBQU8sSUFBSSxJQUFJLEtBQUssVUFBVTtBQUFBLGdCQUM1QixTQUFTO0FBQUEsZ0JBQ1Q7QUFBQSxnQkFDQTtBQUFBLGdCQUNBLFVBQVUsZ0JBQWdCLEtBQUs7QUFBQSxjQUNqQyxDQUFDLENBQUM7QUFBQSxZQUNKLFNBQVMsS0FBVTtBQUNqQixvQkFBTSxVQUFVLEtBQUssSUFBSSxJQUFJO0FBQzdCLGtCQUFJLFVBQVUsZ0JBQWdCLGtCQUFrQjtBQUNoRCxxQkFBTyxJQUFJLElBQUksS0FBSyxVQUFVO0FBQUEsZ0JBQzVCLFNBQVM7QUFBQSxnQkFDVDtBQUFBLGdCQUNBO0FBQUEsZ0JBQ0EsT0FBTyxJQUFJLFdBQVc7QUFBQSxjQUN4QixDQUFDLENBQUM7QUFBQSxZQUNKO0FBQUEsVUFDRjtBQUlBLGNBQUksYUFBYSw4QkFBOEI7QUFDN0Msa0JBQU0sRUFBRSxRQUFRLE1BQU0sSUFBSSxNQUFNLGlCQUFpQixHQUFHO0FBQ3BELGtCQUFNLEtBQUssU0FBUyxLQUFLLE9BQU8sRUFBRSxTQUFTLEVBQUUsRUFBRSxVQUFVLEdBQUcsRUFBRTtBQUM5RCxrQkFBTSxPQUFPLE9BQU8sUUFBUTtBQUc1QixnQkFBSSxPQUFPLE9BQU8sa0JBQWtCO0FBQ3BDLGdCQUFJLGVBQWU7QUFFbkIsZ0JBQUksTUFBTSxTQUFTLEdBQUc7QUFDcEIsNkJBQWUsTUFBTSxDQUFDLEVBQUU7QUFDeEIsa0JBQUksQ0FBQyxNQUFNO0FBQ1QsdUJBQU8sTUFBTSxDQUFDLEVBQUU7QUFBQSxjQUNsQjtBQUFBLFlBQ0Y7QUFFQSxnQkFBSSxDQUFDLFFBQVEsS0FBSyxLQUFLLEVBQUUsV0FBVyxHQUFHO0FBQ3JDLHFCQUFPLGlCQUFjLFlBQVk7QUFBQSxZQUNuQztBQUVBLHFCQUFTLElBQUksSUFBSSxFQUFFLElBQUksY0FBYyxNQUFNLE1BQU0sV0FBVyxLQUFLLElBQUksRUFBRSxDQUFDO0FBRXhFLGdCQUFJLFVBQVUsZ0JBQWdCLGtCQUFrQjtBQUNoRCxtQkFBTyxJQUFJLElBQUksS0FBSyxVQUFVO0FBQUEsY0FDNUI7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0EsUUFBUTtBQUFBLFlBQ1YsQ0FBQyxDQUFDO0FBQUEsVUFDSjtBQUVBLGNBQUksYUFBYSw4QkFBOEI7QUFDN0MsZ0JBQUksVUFBVSxnQkFBZ0IsbUJBQW1CO0FBQ2pELGdCQUFJLFVBQVUsaUJBQWlCLFVBQVU7QUFDekMsZ0JBQUksVUFBVSxjQUFjLFlBQVk7QUFFeEMsa0JBQU0sWUFBWSxDQUFDLE9BQWUsU0FBYztBQUM5QyxrQkFBSSxNQUFNLFVBQVUsS0FBSztBQUFBLFFBQVcsS0FBSyxVQUFVLElBQUksQ0FBQztBQUFBO0FBQUEsQ0FBTTtBQUFBLFlBQ2hFO0FBRUEsa0JBQU0sUUFBUSxPQUFPLGFBQWEsSUFBSSxRQUFRLEtBQUssT0FBTyxhQUFhLElBQUksYUFBYSxLQUFLO0FBQzdGLGtCQUFNLE9BQU8sT0FBTyxhQUFhLElBQUksTUFBTSxLQUFLO0FBRWhELGtCQUFNLFlBQVksU0FBUyxJQUFJLEtBQUs7QUFDcEMsZ0JBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxRQUFRLFVBQVUsS0FBSyxLQUFLLEVBQUUsU0FBUyxHQUFHO0FBQ3JFLHdCQUFVLFNBQVMsRUFBRSxTQUFTLDBGQUF1RixDQUFDO0FBQ3RILHFCQUFPLElBQUksSUFBSTtBQUFBLFlBQ2pCO0FBRUEsc0JBQVUsaUJBQWlCO0FBQUEsY0FDekIsT0FBTztBQUFBLGNBQ1AsU0FBUywrQkFBNEIsVUFBVSxZQUFZLHNCQUFnQixJQUFJO0FBQUEsWUFDakYsQ0FBQztBQUVELHVCQUFXLFlBQVk7QUFDckIsd0JBQVUsaUJBQWlCO0FBQUEsZ0JBQ3pCLE9BQU87QUFBQSxnQkFDUCxTQUFTO0FBQUEsY0FDWCxDQUFDO0FBRUQsa0JBQUk7QUFDRixzQkFBTSxlQUFlO0FBQUE7QUFBQSwyQkFFYixJQUFJO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxXQUtqQixLQUFLO0FBQUEscUJBQ0ssVUFBVSxZQUFZO0FBQUEsYUFDOUIsSUFBSTtBQUFBLGNBQ0osb0JBQUksS0FBSyxHQUFFLFlBQVksRUFBRSxNQUFNLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQXFCbkMsc0JBQU0sYUFBYTtBQUFBO0FBQUEsRUFBeUQsVUFBVSxLQUFLLE1BQU0sR0FBRyxHQUFJLENBQUM7QUFBQTtBQUFBO0FBRXpHLHNCQUFNLFVBQVUsTUFBTSxRQUFRO0FBQUEsa0JBQzVCLEVBQUUsTUFBTSxVQUFVLFNBQVMsYUFBYTtBQUFBLGtCQUN4QyxFQUFFLE1BQU0sUUFBUSxTQUFTLFdBQVc7QUFBQSxnQkFDdEMsR0FBRyxJQUFJO0FBRVAsc0JBQU0sVUFBVSxRQUFRLFFBQVEsQ0FBQyxFQUFFLFFBQVE7QUFDM0Msc0JBQU0sU0FBUyxLQUFLLE1BQU0sT0FBTztBQUNqQywwQkFBVSxZQUFZLE1BQU07QUFDNUIsb0JBQUksSUFBSTtBQUFBLGNBQ1YsU0FBUyxLQUFVO0FBQ2pCLDBCQUFVLFNBQVMsRUFBRSxTQUFTLElBQUksV0FBVyx3Q0FBd0MsQ0FBQztBQUN0RixvQkFBSSxJQUFJO0FBQUEsY0FDVjtBQUFBLFlBQ0YsR0FBRyxHQUFHO0FBQ047QUFBQSxVQUNGO0FBS0EsY0FBSSxhQUFhLDJCQUEyQjtBQUMxQyxrQkFBTSxFQUFFLFFBQVEsTUFBTSxJQUFJLE1BQU0saUJBQWlCLEdBQUc7QUFDcEQsZ0JBQUksVUFBVSxPQUFPLFlBQVk7QUFDakMsZ0JBQUk7QUFFSixnQkFBSSxNQUFNLFNBQVMsR0FBRztBQUNwQix5QkFBVyxNQUFNLENBQUMsRUFBRTtBQUNwQixrQkFBSSxDQUFDLFFBQVMsV0FBVSxNQUFNLENBQUMsRUFBRTtBQUFBLFlBQ25DO0FBRUEsZ0JBQUksQ0FBQyxXQUFXLFFBQVEsS0FBSyxFQUFFLFdBQVcsR0FBRztBQUMzQyxrQkFBSSxhQUFhO0FBQ2pCLGtCQUFJLFVBQVUsZ0JBQWdCLGtCQUFrQjtBQUNoRCxxQkFBTyxJQUFJLElBQUksS0FBSyxVQUFVLEVBQUUsT0FBTywrQ0FBNEMsQ0FBQyxDQUFDO0FBQUEsWUFDdkY7QUFFQSxrQkFBTSxLQUFLLFVBQVUsS0FBSyxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUUsVUFBVSxHQUFHLENBQUM7QUFDOUQseUJBQWEsSUFBSSxJQUFJLEVBQUUsSUFBSSxNQUFNLFNBQVMsVUFBVSxXQUFXLEtBQUssSUFBSSxFQUFFLENBQUM7QUFHM0Usa0JBQU0sVUFBVSxNQUFNLFFBQVE7QUFBQSxjQUM1QjtBQUFBLGdCQUNFLE1BQU07QUFBQSxnQkFDTixTQUFTO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxXQVFkLEVBQUU7QUFBQSxjQUNBLG9CQUFJLEtBQUssR0FBRSxZQUFZLEVBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGNBZXJDO0FBQUEsY0FDQSxFQUFFLE1BQU0sUUFBUSxTQUFTO0FBQUE7QUFBQSxFQUE0QixRQUFRLE1BQU0sR0FBRyxHQUFJLENBQUMsR0FBRztBQUFBLFlBQ2hGLEdBQUcsSUFBSTtBQUVQLGtCQUFNLFNBQVMsS0FBSyxNQUFNLFFBQVEsUUFBUSxDQUFDLEVBQUUsUUFBUSxPQUFPO0FBQzVELGdCQUFJLFVBQVUsZ0JBQWdCLGtCQUFrQjtBQUNoRCxtQkFBTyxJQUFJLElBQUksS0FBSyxVQUFVLE1BQU0sQ0FBQztBQUFBLFVBQ3ZDO0FBRUEsY0FBSSxhQUFhLDJCQUEyQjtBQUMxQyxnQkFBSSxVQUFVLGdCQUFnQixtQkFBbUI7QUFDakQsZ0JBQUksVUFBVSxpQkFBaUIsVUFBVTtBQUN6QyxnQkFBSSxVQUFVLGNBQWMsWUFBWTtBQUV4QyxrQkFBTSxZQUFZLENBQUMsT0FBZSxTQUFjO0FBQzlDLGtCQUFJLE1BQU0sVUFBVSxLQUFLO0FBQUEsUUFBVyxLQUFLLFVBQVUsSUFBSSxDQUFDO0FBQUE7QUFBQSxDQUFNO0FBQUEsWUFDaEU7QUFFQSxrQkFBTSxhQUFhLE9BQU8sYUFBYSxJQUFJLFNBQVMsS0FBSztBQUN6RCxnQkFBSSxjQUFjO0FBRWxCLGdCQUFJLGFBQWEsSUFBSSxVQUFVLEdBQUc7QUFDaEMsNEJBQWMsYUFBYSxJQUFJLFVBQVUsRUFBRztBQUFBLFlBQzlDLFdBQVcsV0FBVyxTQUFTLEdBQUc7QUFDaEMsa0JBQUk7QUFDRiw4QkFBYyxtQkFBbUIsVUFBVTtBQUFBLGNBQzdDLFFBQVE7QUFDTiw4QkFBYztBQUFBLGNBQ2hCO0FBQUEsWUFDRjtBQUVBLGdCQUFJLENBQUMsZUFBZSxZQUFZLEtBQUssRUFBRSxXQUFXLEdBQUc7QUFDbkQsd0JBQVUsU0FBUyxFQUFFLFNBQVMsbURBQWdELENBQUM7QUFDL0UscUJBQU8sSUFBSSxJQUFJO0FBQUEsWUFDakI7QUFFQSxzQkFBVSxpQkFBaUI7QUFBQSxjQUN6QixPQUFPO0FBQUEsY0FDUCxTQUFTO0FBQUEsWUFDWCxDQUFDO0FBRUQsdUJBQVcsWUFBWTtBQUNyQix3QkFBVSxpQkFBaUI7QUFBQSxnQkFDekIsT0FBTztBQUFBLGdCQUNQLFNBQVM7QUFBQSxjQUNYLENBQUM7QUFFRCxrQkFBSTtBQUNGLHNCQUFNLFVBQVUsTUFBTSxRQUFRO0FBQUEsa0JBQzVCO0FBQUEsb0JBQ0UsTUFBTTtBQUFBLG9CQUNOLFNBQVM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGdCQVFiLEtBQUssT0FBTyxFQUFFLFNBQVMsRUFBRSxFQUFFLFVBQVUsR0FBRyxDQUFDLENBQUM7QUFBQSxjQUM3QyxvQkFBSSxLQUFLLEdBQUUsWUFBWSxFQUFFLE1BQU0sR0FBRyxFQUFFLENBQUMsQ0FBQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxrQkFlakM7QUFBQSxrQkFDQSxFQUFFLE1BQU0sUUFBUSxTQUFTO0FBQUE7QUFBQSxFQUEwQyxZQUFZLE1BQU0sR0FBRyxHQUFJLENBQUMsR0FBRztBQUFBLGdCQUNsRyxHQUFHLElBQUk7QUFFUCxzQkFBTSxTQUFTLEtBQUssTUFBTSxRQUFRLFFBQVEsQ0FBQyxFQUFFLFFBQVEsT0FBTztBQUM1RCwwQkFBVSxZQUFZLE1BQU07QUFDNUIsb0JBQUksSUFBSTtBQUFBLGNBQ1YsU0FBUyxLQUFVO0FBQ2pCLDBCQUFVLFNBQVMsRUFBRSxTQUFTLElBQUksV0FBVywyQ0FBMkMsQ0FBQztBQUN6RixvQkFBSSxJQUFJO0FBQUEsY0FDVjtBQUFBLFlBQ0YsR0FBRyxHQUFHO0FBQ047QUFBQSxVQUNGO0FBS0EsY0FBSSxhQUFhLDRCQUE0QjtBQUMzQyxrQkFBTSxFQUFFLE9BQU8sSUFBSSxNQUFNLGlCQUFpQixHQUFHO0FBQzdDLGtCQUFNLFVBQVUsT0FBTyxXQUFXLENBQUM7QUFFbkMsa0JBQU0sVUFBVSxNQUFNLFFBQVE7QUFBQSxjQUM1QjtBQUFBLGdCQUNFLE1BQU07QUFBQSxnQkFDTixTQUFTO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxjQVFYO0FBQUEsY0FDQSxFQUFFLE1BQU0sUUFBUSxTQUFTLGtEQUF5QyxLQUFLLFVBQVUsT0FBTyxDQUFDLEdBQUc7QUFBQSxZQUM5RixHQUFHLElBQUk7QUFFUCxnQkFBSSxVQUFVLGdCQUFnQixrQkFBa0I7QUFDaEQsbUJBQU8sSUFBSSxJQUFJLFFBQVEsUUFBUSxDQUFDLEVBQUUsUUFBUSxPQUFPO0FBQUEsVUFDbkQ7QUFFQSxjQUFJLGFBQWEsOEJBQThCO0FBQzdDLGdCQUFJLFVBQVUsZ0JBQWdCLG1CQUFtQjtBQUNqRCxnQkFBSSxVQUFVLGlCQUFpQixVQUFVO0FBQ3pDLGdCQUFJLFVBQVUsY0FBYyxZQUFZO0FBRXhDLGtCQUFNLFlBQVksQ0FBQyxPQUFlLFNBQWM7QUFDOUMsa0JBQUksTUFBTSxVQUFVLEtBQUs7QUFBQSxRQUFXLEtBQUssVUFBVSxJQUFJLENBQUM7QUFBQTtBQUFBLENBQU07QUFBQSxZQUNoRTtBQUVBLGtCQUFNLGFBQWEsT0FBTyxhQUFhLElBQUksU0FBUyxLQUFLLE9BQU8sYUFBYSxJQUFJLFNBQVMsS0FBSyxPQUFPLGFBQWEsSUFBSSxTQUFTLEtBQUs7QUFDckksZ0JBQUksY0FBYztBQUNsQixnQkFBSTtBQUNGLDRCQUFjLG1CQUFtQixVQUFVO0FBQUEsWUFDN0MsUUFBUTtBQUFBLFlBQUM7QUFFVCxzQkFBVSxpQkFBaUI7QUFBQSxjQUN6QixPQUFPO0FBQUEsY0FDUCxTQUFTO0FBQUEsWUFDWCxDQUFDO0FBRUQsdUJBQVcsWUFBWTtBQUNyQix3QkFBVSxpQkFBaUI7QUFBQSxnQkFDekIsT0FBTztBQUFBLGdCQUNQLFNBQVM7QUFBQSxjQUNYLENBQUM7QUFFRCxrQkFBSTtBQUVGLHNCQUFNLFlBQVksWUFBWSxZQUFZO0FBQzFDLG9CQUFJLFFBQVE7QUFHWixvQkFBSSxVQUFVLFNBQVMsS0FBSyxLQUFLLFVBQVUsU0FBUyxPQUFPLEtBQUssVUFBVSxTQUFTLE9BQU8sRUFBRyxVQUFTO0FBQ3RHLG9CQUFJLFVBQVUsU0FBUyxJQUFJLEtBQUssVUFBVSxTQUFTLGdCQUFnQixLQUFLLFVBQVUsU0FBUyxTQUFTLEVBQUcsVUFBUztBQUNoSCxvQkFBSSxVQUFVLFNBQVMsWUFBTSxLQUFLLFVBQVUsU0FBUyxXQUFRLEtBQUssVUFBVSxTQUFTLFVBQVUsRUFBRyxVQUFTO0FBRzNHLG9CQUFJLFVBQVUsU0FBUyxRQUFRLEtBQUssVUFBVSxTQUFTLFFBQVEsS0FBSyxVQUFVLFNBQVMsUUFBUSxFQUFHLFVBQVM7QUFDM0csb0JBQUksVUFBVSxTQUFTLE9BQU8sS0FBSyxVQUFVLFNBQVMsZ0JBQWdCLEtBQUssVUFBVSxTQUFTLFdBQVcsRUFBRyxVQUFTO0FBQ3JILG9CQUFJLFVBQVUsU0FBUyxPQUFPLEtBQUssVUFBVSxTQUFTLGVBQVMsRUFBRyxVQUFTO0FBRTNFLHdCQUFRLEtBQUssSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLEtBQUssQ0FBQztBQUV4QyxzQkFBTSxVQUFVLE1BQU0sUUFBUTtBQUFBLGtCQUM1QjtBQUFBLG9CQUNFLE1BQU07QUFBQSxvQkFDTixTQUFTO0FBQUE7QUFBQSw0Q0FFUyxLQUFLO0FBQUE7QUFBQTtBQUFBLGFBRzlCLEtBQUs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsa0JBZUE7QUFBQSxrQkFDQSxFQUFFLE1BQU0sUUFBUSxTQUFTO0FBQUE7QUFBQSxFQUEyQyxZQUFZLE1BQU0sR0FBRyxHQUFJLENBQUMsR0FBRztBQUFBLGdCQUNuRyxHQUFHLElBQUk7QUFFUCxzQkFBTSxTQUFTLEtBQUssTUFBTSxRQUFRLFFBQVEsQ0FBQyxFQUFFLFFBQVEsT0FBTztBQUM1RCwwQkFBVSxZQUFZLE1BQU07QUFDNUIsb0JBQUksSUFBSTtBQUFBLGNBQ1YsU0FBUyxLQUFVO0FBQ2pCLDBCQUFVLFNBQVMsRUFBRSxTQUFTLElBQUksV0FBVyxvREFBOEMsQ0FBQztBQUM1RixvQkFBSSxJQUFJO0FBQUEsY0FDVjtBQUFBLFlBQ0YsR0FBRyxHQUFHO0FBQ047QUFBQSxVQUNGO0FBS0EsY0FBSSxhQUFhLDZCQUE2QjtBQUM1QyxrQkFBTSxFQUFFLE9BQU8sSUFBSSxNQUFNLGlCQUFpQixHQUFHO0FBQzdDLGtCQUFNLGdCQUFnQixPQUFPLGlCQUFpQjtBQUM5QyxrQkFBTSxRQUFlLE1BQU0sUUFBUSxPQUFPLEtBQUssSUFBSSxPQUFPLFFBQVEsQ0FBQztBQUduRSxrQkFBTSxTQUFTLE1BQU0sT0FBTyxDQUFDLEtBQUssTUFBTSxPQUFRLE9BQU8sRUFBRSxRQUFRLEtBQUssTUFBTSxPQUFPLEVBQUUsV0FBVyxLQUFLLE1BQU0sS0FBSyxPQUFPLEVBQUUsa0JBQWtCLEtBQUssS0FBSyxNQUFPLENBQUM7QUFDN0osa0JBQU0sVUFBVSxNQUFNLE9BQU8sQ0FBQyxLQUFLLE1BQU0sT0FBUSxPQUFPLEVBQUUsUUFBUSxLQUFLLE1BQU0sT0FBTyxFQUFFLFdBQVcsS0FBSyxNQUFNLEtBQUssT0FBTyxFQUFFLGtCQUFrQixLQUFLLEtBQUssU0FBUyxPQUFPLEVBQUUsT0FBTyxLQUFLLE1BQU0sTUFBTyxDQUFDO0FBRWxNLGtCQUFNLFVBQVUsT0FBTyxZQUFZLFNBQVksT0FBTyxPQUFPLE9BQU8sSUFBSTtBQUN4RSxrQkFBTSxZQUFhLE9BQU8sY0FBYyxVQUFhLE9BQU8sYUFBYSxTQUFhLE9BQU8sT0FBTyxhQUFhLE9BQU8sUUFBUSxJQUFJO0FBQ3BJLGtCQUFNLFdBQVcsT0FBTyxhQUFhLFNBQVksT0FBTyxPQUFPLFFBQVEsSUFBSyxVQUFVO0FBRXRGLGdCQUFJLGFBQWEsT0FBTztBQUN4QixnQkFBSSxDQUFDLGNBQWMsT0FBTyxVQUFVO0FBQ2xDLG9CQUFNLFFBQVEsTUFBTSxRQUFRLEtBQUssQ0FBQyxNQUFXLEVBQUUsT0FBTyxPQUFPLE9BQU8sUUFBUSxLQUFLLEVBQUUsT0FBTyxPQUFPLFFBQVE7QUFDekcsa0JBQUksTUFBTyxjQUFhLE1BQU07QUFBQSxZQUNoQztBQUNBLGdCQUFJLENBQUMsV0FBWSxjQUFhO0FBRTlCLGtCQUFNLFNBQW1CLENBQUM7QUFDMUIsa0JBQU0sV0FBcUIsQ0FBQztBQUc1QixnQkFBSSxNQUFNLFNBQVMsR0FBRztBQUNwQixrQkFBSSxLQUFLLElBQUksU0FBUyxPQUFPLElBQUksS0FBSztBQUNwQyx1QkFBTyxLQUFLLDhDQUE4QyxPQUFPLFFBQVEsQ0FBQyxDQUFDLHlEQUE4QyxRQUFRLFFBQVEsQ0FBQyxDQUFDLFdBQU07QUFBQSxjQUNuSjtBQUFBLFlBQ0YsT0FBTztBQUNMLHVCQUFTLEtBQUssK0RBQStEO0FBQUEsWUFDL0U7QUFFQSxnQkFBSSxVQUFVLEtBQUssS0FBSyxJQUFLLFVBQVUsWUFBYSxRQUFRLElBQUksS0FBSztBQUNuRSxxQkFBTyxLQUFLLDBCQUEwQixRQUFRLFFBQVEsQ0FBQyxDQUFDLG1CQUFjLFVBQVUsUUFBUSxDQUFDLENBQUMsOEJBQW9CLFNBQVMsUUFBUSxDQUFDLENBQUMsV0FBTTtBQUFBLFlBQ3pJO0FBRUEsZ0JBQUksQ0FBQyxjQUFjLGVBQWUsNkJBQXVCO0FBQ3ZELHVCQUFTLEtBQUssNkNBQTZDO0FBQUEsWUFDN0Q7QUFHQSxrQkFBTSxVQUFVLE1BQU0sUUFBUTtBQUFBLGNBQzVCO0FBQUEsZ0JBQ0UsTUFBTTtBQUFBLGdCQUNOLFNBQVM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxjQU9YO0FBQUEsY0FDQTtBQUFBLGdCQUNFLE1BQU07QUFBQSxnQkFDTixTQUFTLGtCQUFlLGFBQWEsYUFBYSxVQUFVLGVBQWUsT0FBTyx1QkFBa0IsUUFBUSxpQkFBWSxTQUFTLG9CQUFlLEtBQUssVUFBVSxLQUFLLENBQUM7QUFBQSxjQUN2SztBQUFBLFlBQ0YsR0FBRyxJQUFJO0FBRVAsa0JBQU0sYUFBYSxLQUFLLE1BQU0sUUFBUSxRQUFRLENBQUMsRUFBRSxRQUFRLE9BQU87QUFDaEUsZ0JBQUksTUFBTSxRQUFRLFdBQVcsVUFBVSxHQUFHO0FBQ3hDLHVCQUFTLEtBQUssR0FBRyxXQUFXLFVBQVU7QUFBQSxZQUN4QztBQUVBLGdCQUFJLFVBQVUsZ0JBQWdCLGtCQUFrQjtBQUNoRCxtQkFBTyxJQUFJLElBQUksS0FBSyxVQUFVO0FBQUEsY0FDNUIsU0FBUyxPQUFPLFdBQVc7QUFBQSxjQUMzQjtBQUFBLGNBQ0E7QUFBQSxjQUNBLG1CQUFtQixXQUFXLHFCQUFxQixDQUFDLHlGQUFpRjtBQUFBLFlBQ3ZJLENBQUMsQ0FBQztBQUFBLFVBQ0o7QUFLQSxjQUFJLGFBQWEsMEJBQTBCO0FBQ3pDLGtCQUFNLEVBQUUsT0FBTyxJQUFJLE1BQU0saUJBQWlCLEdBQUc7QUFDN0Msa0JBQU0sUUFBUSxPQUFPLFFBQVEsT0FBTyxRQUFRLElBQUksS0FBSztBQUVyRCxnQkFBSSxDQUFDLFFBQVEsS0FBSyxXQUFXLEdBQUc7QUFDOUIsa0JBQUksVUFBVSxnQkFBZ0Isa0JBQWtCO0FBQ2hELHFCQUFPLElBQUksSUFBSSxLQUFLLFVBQVU7QUFBQSxnQkFDNUIsY0FBYztBQUFBLGdCQUNkLHNCQUFzQjtBQUFBLGdCQUN0QixzQkFBc0I7QUFBQSxnQkFDdEIsaUJBQWlCO0FBQUEsZ0JBQ2pCLGNBQWM7QUFBQSxjQUNoQixDQUFDLENBQUM7QUFBQSxZQUNKO0FBRUEsa0JBQU0sWUFBWSxLQUFLLE1BQU0sS0FBSyxFQUFFO0FBQ3BDLGtCQUFNLGtCQUFrQixLQUFLLElBQUksR0FBRyxLQUFLLE1BQU8sWUFBWSxNQUFPLEVBQUUsQ0FBQztBQUd0RSxrQkFBTSxVQUFVLE1BQU0sUUFBUTtBQUFBLGNBQzVCO0FBQUEsZ0JBQ0UsTUFBTTtBQUFBLGdCQUNOLFNBQVM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGNBV1g7QUFBQSxjQUNBLEVBQUUsTUFBTSxRQUFRLFNBQVM7QUFBQTtBQUFBLEVBQXlCLElBQUksR0FBRztBQUFBLFlBQzNELEdBQUcsSUFBSTtBQUVQLGtCQUFNLFNBQVMsS0FBSyxNQUFNLFFBQVEsUUFBUSxDQUFDLEVBQUUsUUFBUSxPQUFPO0FBQzVELGdCQUFJLFVBQVUsZ0JBQWdCLGtCQUFrQjtBQUNoRCxtQkFBTyxJQUFJLElBQUksS0FBSyxVQUFVO0FBQUEsY0FDNUIsY0FBYyxPQUFPLE9BQU8sWUFBWSxLQUFLO0FBQUEsY0FDN0Msc0JBQXNCLE9BQU8sT0FBTyxvQkFBb0IsS0FBSztBQUFBLGNBQzdELHNCQUFzQjtBQUFBLGNBQ3RCO0FBQUEsY0FDQSxjQUFjLE9BQU8sT0FBTyxZQUFZLEtBQUs7QUFBQSxZQUMvQyxDQUFDLENBQUM7QUFBQSxVQUNKO0FBS0EsZ0JBQU0sS0FBSyxVQUFVO0FBRXJCLGNBQUksYUFBYSxvQkFBb0I7QUFDbkMsZ0JBQUksSUFBSSxXQUFXLFFBQVE7QUFDekIsb0JBQU0sRUFBRSxPQUFPLElBQUksTUFBTSxpQkFBaUIsR0FBRztBQUM3QyxvQkFBTSxZQUFZO0FBQUEsZ0JBQ2hCLElBQUksT0FBTyxNQUFPLEdBQUcsUUFBUSxTQUFTO0FBQUEsZ0JBQ3RDLE1BQU0sT0FBTyxRQUFRO0FBQUEsZ0JBQ3JCLE9BQU8sT0FBTyxTQUFTO0FBQUEsZ0JBQ3ZCLFNBQVMsT0FBTyxXQUFXLE9BQU8sUUFBUTtBQUFBLGdCQUMxQyxTQUFTLE9BQU8sV0FBVztBQUFBLGdCQUMzQixPQUFPLE9BQU8sU0FBUztBQUFBLGdCQUN2QixZQUFXLG9CQUFJLEtBQUssR0FBRSxZQUFZO0FBQUEsY0FDcEM7QUFDQSxpQkFBRyxRQUFRLEtBQUssU0FBUztBQUN6Qix3QkFBVSxFQUFFO0FBQ1osa0JBQUksVUFBVSxnQkFBZ0Isa0JBQWtCO0FBQ2hELHFCQUFPLElBQUksSUFBSSxLQUFLLFVBQVUsU0FBUyxDQUFDO0FBQUEsWUFDMUM7QUFDQSxnQkFBSSxVQUFVLGdCQUFnQixrQkFBa0I7QUFDaEQsbUJBQU8sSUFBSSxJQUFJLEtBQUssVUFBVSxHQUFHLE9BQU8sQ0FBQztBQUFBLFVBQzNDO0FBRUEsY0FBSSxhQUFhLHFCQUFxQjtBQUNwQyxnQkFBSSxJQUFJLFdBQVcsUUFBUTtBQUN6QixvQkFBTSxFQUFFLE9BQU8sSUFBSSxNQUFNLGlCQUFpQixHQUFHO0FBQzdDLG9CQUFNLGFBQWE7QUFBQSxnQkFDakIsSUFBSSxPQUFPLE1BQU0sT0FBTyxLQUFLLElBQUksQ0FBQztBQUFBLGdCQUNsQyxlQUFlLE9BQU8saUJBQWlCLFFBQU8sb0JBQUksS0FBSyxHQUFFLFlBQVksQ0FBQyxJQUFJLE9BQU8sR0FBRyxTQUFTLFNBQVMsQ0FBQyxFQUFFLFNBQVMsR0FBRyxHQUFHLENBQUM7QUFBQSxnQkFDekgsWUFBWSxPQUFPLGNBQWM7QUFBQSxnQkFDakMsVUFBVSxPQUFPLE9BQU8sV0FBVyxPQUFPLFFBQVEsS0FBSztBQUFBLGdCQUN2RCxXQUFXLE9BQU8sT0FBTyxZQUFZLE9BQU8sU0FBUyxLQUFLO0FBQUEsZ0JBQzFELFFBQVEsT0FBTyxVQUFVO0FBQUEsZ0JBQ3pCLE1BQU0sT0FBTyxTQUFRLG9CQUFJLEtBQUssR0FBRSxZQUFZLEVBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUFBLGdCQUMxRCxZQUFXLG9CQUFJLEtBQUssR0FBRSxZQUFZO0FBQUEsY0FDcEM7QUFDQSxpQkFBRyxTQUFTLEtBQUssVUFBVTtBQUMzQix3QkFBVSxFQUFFO0FBQ1osa0JBQUksVUFBVSxnQkFBZ0Isa0JBQWtCO0FBQ2hELHFCQUFPLElBQUksSUFBSSxLQUFLLFVBQVUsVUFBVSxDQUFDO0FBQUEsWUFDM0M7QUFDQSxnQkFBSSxVQUFVLGdCQUFnQixrQkFBa0I7QUFDaEQsbUJBQU8sSUFBSSxJQUFJLEtBQUssVUFBVSxHQUFHLFFBQVEsQ0FBQztBQUFBLFVBQzVDO0FBRUEsY0FBSSxhQUFhLDBCQUEwQjtBQUN6QyxrQkFBTSxjQUFjLEdBQUcsU0FBUyxPQUFPLENBQUMsS0FBSyxRQUFRLE9BQU8sT0FBTyxJQUFJLFNBQVMsS0FBSyxJQUFJLENBQUM7QUFDMUYsa0JBQU0sWUFBWSxHQUFHLFNBQVMsT0FBTyxPQUFLLEVBQUUsV0FBVyxNQUFNLEVBQUUsT0FBTyxDQUFDLEtBQUssUUFBUSxPQUFPLE9BQU8sSUFBSSxTQUFTLEtBQUssSUFBSSxDQUFDO0FBQ3pILGtCQUFNLGVBQWUsR0FBRyxTQUFTLE9BQU8sT0FBSyxFQUFFLFdBQVcsU0FBUyxFQUFFLE9BQU8sQ0FBQyxLQUFLLFFBQVEsT0FBTyxPQUFPLElBQUksU0FBUyxLQUFLLElBQUksQ0FBQztBQUMvSCxrQkFBTSxlQUFlLEdBQUcsU0FBUyxPQUFPLE9BQUssRUFBRSxXQUFXLFNBQVMsRUFBRSxPQUFPLENBQUMsS0FBSyxRQUFRLE9BQU8sT0FBTyxJQUFJLFNBQVMsS0FBSyxJQUFJLENBQUM7QUFFL0gsZ0JBQUksVUFBVSxnQkFBZ0Isa0JBQWtCO0FBQ2hELG1CQUFPLElBQUksSUFBSSxLQUFLLFVBQVUsRUFBRSxhQUFhLFdBQVcsY0FBYyxhQUFhLENBQUMsQ0FBQztBQUFBLFVBQ3ZGO0FBRUEsY0FBSSxhQUFhLDZCQUE2QjtBQUU1QyxrQkFBTSxrQkFBa0IsR0FBRyxTQUN4QixPQUFPLE9BQUssRUFBRSxXQUFXLGFBQWEsRUFBRSxXQUFXLFNBQVMsRUFDNUQsSUFBSSxRQUFNO0FBQUEsY0FDVCxJQUFJLEVBQUU7QUFBQSxjQUNOLE1BQU07QUFBQSxjQUNOLFdBQVcsRUFBRTtBQUFBLGNBQ2IsWUFBWSxFQUFFO0FBQUEsY0FDZCxRQUFRLEVBQUU7QUFBQSxjQUNWLGFBQWE7QUFBQSxjQUNiLFFBQVEsRUFBRSxXQUFXLFlBQVksY0FBYztBQUFBLFlBQ2pELEVBQUU7QUFDSixnQkFBSSxVQUFVLGdCQUFnQixrQkFBa0I7QUFDaEQsbUJBQU8sSUFBSSxJQUFJLEtBQUssVUFBVSxlQUFlLENBQUM7QUFBQSxVQUNoRDtBQUVBLGNBQUksYUFBYSwwQkFBMEI7QUFDekMsZ0JBQUksVUFBVSxnQkFBZ0Isa0JBQWtCO0FBQ2hELG1CQUFPLElBQUksSUFBSSxLQUFLLFVBQVU7QUFBQSxjQUM1QixXQUFXLEdBQUcsVUFBVTtBQUFBLGNBQ3hCLHFCQUFxQixHQUFHLFVBQVUsU0FBUyxJQUFJLEtBQUs7QUFBQSxjQUNwRCxXQUFXLEdBQUcsT0FBTyxPQUFPLE9BQUssRUFBRSxXQUFXLFVBQVUsRUFBRTtBQUFBLGNBQzFELGNBQWMsR0FBRyxTQUFTLE9BQU8sT0FBSyxFQUFFLFdBQVcsTUFBTSxFQUFFO0FBQUEsWUFDN0QsQ0FBQyxDQUFDO0FBQUEsVUFDSjtBQUVBLGNBQUksYUFBYSw4QkFBOEI7QUFDN0MsZ0JBQUksVUFBVSxnQkFBZ0Isa0JBQWtCO0FBQ2hELG1CQUFPLElBQUksSUFBSSxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUM7QUFBQSxVQUNuQztBQUVBLGNBQUksYUFBYSx1QkFBdUI7QUFDdEMsZ0JBQUksVUFBVSxnQkFBZ0Isa0JBQWtCO0FBQ2hELG1CQUFPLElBQUksSUFBSSxLQUFLLFVBQVU7QUFBQSxjQUM1QixnQkFBZ0I7QUFBQSxjQUNoQixpQkFBaUI7QUFBQSxjQUNqQixnQkFBZ0I7QUFBQSxjQUNoQixjQUFjO0FBQUEsWUFDaEIsQ0FBQyxDQUFDO0FBQUEsVUFDSjtBQUVBLGNBQUksYUFBYSx5QkFBeUI7QUFDeEMsa0JBQU0sRUFBRSxPQUFPLElBQUksTUFBTSxpQkFBaUIsR0FBRztBQUM3QyxrQkFBTSxTQUFTLE9BQU8sVUFBVTtBQUNoQyxrQkFBTSxVQUFVLE9BQU8sV0FBVztBQUNsQyxrQkFBTSxTQUFTLE9BQU8sVUFBVTtBQUNoQyxrQkFBTSxjQUFjLE9BQU8sZUFBZTtBQUMxQyxrQkFBTSxpQkFBaUIsT0FBTyxrQkFBa0I7QUFDaEQsa0JBQU0sV0FBVyxPQUFPLFlBQVk7QUFFcEMsa0JBQU0sZUFBZTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQkFNaEIsTUFBTTtBQUFBLGVBQ1IsV0FBVztBQUFBLDBCQUNBLE9BQU87QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsZ0NBTUQsY0FBYztBQUFBO0FBQUE7QUFBQTtBQUtsQyxrQkFBTSxhQUFhO0FBQUEsWUFDbkIsTUFBTTtBQUFBLFNBQ1QsT0FBTztBQUFBLGNBQ0wsTUFBTTtBQUFBLHdCQUNPLFdBQVc7QUFBQSx1QkFDZixjQUFjO0FBQUEsaUNBQ0osUUFBUTtBQUUxQixnQkFBSTtBQUNGLG9CQUFNLFFBQVEsTUFBTSxRQUFRO0FBQUEsZ0JBQzFCLEVBQUUsTUFBTSxVQUFVLFNBQVMsYUFBYTtBQUFBLGdCQUN4QyxFQUFFLE1BQU0sUUFBUSxTQUFTLFdBQVc7QUFBQSxjQUN0QyxHQUFHLEtBQUs7QUFFUixvQkFBTSxVQUFVLE1BQU0sUUFBUSxDQUFDLEVBQUUsUUFBUTtBQUN6QyxrQkFBSSxZQUFtQixDQUFDO0FBQ3hCLGtCQUFJO0FBQ0YsNEJBQVksS0FBSyxNQUFNLE9BQU87QUFBQSxjQUNoQyxRQUFRO0FBQ04sc0JBQU0sUUFBUSxRQUFRLE1BQU0saUJBQWlCO0FBQzdDLG9CQUFJLE1BQU8sYUFBWSxLQUFLLE1BQU0sTUFBTSxDQUFDLENBQUM7QUFBQSxjQUM1QztBQUVBLGtCQUFJLFVBQVUsZ0JBQWdCLGtCQUFrQjtBQUNoRCxxQkFBTyxJQUFJLElBQUksS0FBSyxVQUFVLFNBQVMsQ0FBQztBQUFBLFlBQzFDLFNBQVMsS0FBVTtBQUNqQixrQkFBSSxhQUFhO0FBQ2pCLGtCQUFJLFVBQVUsZ0JBQWdCLGtCQUFrQjtBQUNoRCxxQkFBTyxJQUFJLElBQUksS0FBSyxVQUFVLEVBQUUsT0FBTyxJQUFJLFdBQVcsdUNBQWlDLENBQUMsQ0FBQztBQUFBLFlBQzNGO0FBQUEsVUFDRjtBQUtBLGNBQUksYUFBYSwyQkFBMkI7QUFDMUMsa0JBQU0sRUFBRSxPQUFPLElBQUksTUFBTSxpQkFBaUIsR0FBRztBQUM3QyxrQkFBTSxFQUFFLE1BQU0sTUFBTSxNQUFNLFVBQVUsSUFBSTtBQUV4QyxrQkFBTSxVQUFVLE1BQU0sUUFBUTtBQUFBLGNBQzVCO0FBQUEsZ0JBQ0UsTUFBTTtBQUFBLGdCQUNOLFNBQVM7QUFBQSxhQUNmLFFBQVEsa0JBQVksWUFBWSxRQUFRLGVBQWUsaUJBQWlCLGFBQWEsV0FBVztBQUFBO0FBQUEsY0FFNUY7QUFBQSxjQUNBLEVBQUUsTUFBTSxRQUFRLFNBQVMsUUFBUSw2REFBMEQ7QUFBQSxZQUM3RixDQUFDO0FBRUQsZ0JBQUksVUFBVSxnQkFBZ0Isa0JBQWtCO0FBQ2hELG1CQUFPLElBQUksSUFBSSxLQUFLLFVBQVU7QUFBQSxjQUM1QixTQUFTO0FBQUEsY0FDVCxlQUFlLFFBQVEsUUFBUSxDQUFDLEVBQUUsUUFBUTtBQUFBLFlBQzVDLENBQUMsQ0FBQztBQUFBLFVBQ0o7QUFLQSxjQUFJLGFBQWEsOEJBQThCO0FBQzdDLGtCQUFNLEVBQUUsT0FBTyxJQUFJLE1BQU0saUJBQWlCLEdBQUc7QUFDN0Msa0JBQU0sVUFBVSxNQUFNLFFBQVE7QUFBQSxjQUM1QjtBQUFBLGdCQUNFLE1BQU07QUFBQSxnQkFDTixTQUFTO0FBQUE7QUFBQSxRQUVqQixPQUFPLFFBQVEsU0FBUyxjQUFjLE9BQU8sVUFBVSxjQUFXLE9BQU8sU0FBUyxXQUFXLE9BQU8sSUFBSSxlQUFlLE9BQU8sWUFBWTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxjQU1wSTtBQUFBLGNBQ0EsRUFBRSxNQUFNLFFBQVEsU0FBUyxnQ0FBMEIsT0FBTyxVQUFVLGVBQWUsT0FBTyxTQUFTLGVBQWUsT0FBTyxJQUFJLElBQUk7QUFBQSxZQUNuSSxHQUFHLElBQUk7QUFFUCxnQkFBSSxVQUFVLGdCQUFnQixrQkFBa0I7QUFDaEQsbUJBQU8sSUFBSSxJQUFJLFFBQVEsUUFBUSxDQUFDLEVBQUUsUUFBUSxPQUFPO0FBQUEsVUFDbkQ7QUFFQSxjQUFJLGFBQWEsMEJBQTBCO0FBQ3pDLGtCQUFNLEVBQUUsT0FBTyxJQUFJLE1BQU0saUJBQWlCLEdBQUc7QUFDN0MsZUFBRyxVQUFVLEtBQUs7QUFBQSxjQUNoQixJQUFJLFNBQVMsS0FBSyxJQUFJO0FBQUEsY0FDdEIsVUFBVSxPQUFPO0FBQUEsY0FDakIsU0FBUyxPQUFPO0FBQUEsY0FDaEIsU0FBUSxvQkFBSSxLQUFLLEdBQUUsWUFBWTtBQUFBLFlBQ2pDLENBQUM7QUFDRCxzQkFBVSxFQUFFO0FBQ1osZ0JBQUksVUFBVSxnQkFBZ0Isa0JBQWtCO0FBQ2hELG1CQUFPLElBQUksSUFBSSxLQUFLLFVBQVUsRUFBRSxTQUFTLE1BQU0sU0FBUywyREFBK0MsQ0FBQyxDQUFDO0FBQUEsVUFDM0c7QUFLQSxjQUFJLGFBQWEsNkJBQTZCO0FBQzVDLGtCQUFNLEVBQUUsT0FBTyxJQUFJLE1BQU0saUJBQWlCLEdBQUc7QUFDN0Msa0JBQU0sV0FBVyxPQUFPLFlBQVksQ0FBQyxZQUFZLFdBQVc7QUFDNUQsa0JBQU0sZ0JBQWdCLE9BQU8saUJBQWlCO0FBQzlDLGtCQUFNLGlCQUFpQixPQUFPLGtCQUFrQjtBQUNoRCxrQkFBTSxnQkFBZ0IsT0FBTyxpQkFBaUIsQ0FBQztBQUUvQyxrQkFBTSxVQUFVLE1BQU0sUUFBUTtBQUFBLGNBQzVCO0FBQUEsZ0JBQ0UsTUFBTTtBQUFBLGdCQUNOLFNBQVM7QUFBQSw4REFDNEIsU0FBUyxLQUFLLElBQUksQ0FBQztBQUFBLGFBQzNELGNBQWM7QUFBQSxRQUNuQixjQUFjLFFBQVEsNEJBQTRCO0FBQUEsaUJBQzVDLGNBQWMsWUFBWSxFQUFFO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsY0FVNUI7QUFBQSxjQUNBLEVBQUUsTUFBTSxRQUFRLFNBQVM7QUFBQTtBQUFBLEVBQWtDLGFBQWEsR0FBRztBQUFBLFlBQzdFLEdBQUcsSUFBSTtBQUVQLGdCQUFJLFVBQVUsZ0JBQWdCLGtCQUFrQjtBQUNoRCxtQkFBTyxJQUFJLElBQUksUUFBUSxRQUFRLENBQUMsRUFBRSxRQUFRLE9BQU87QUFBQSxVQUNuRDtBQUtBLGNBQUksYUFBYSxpQ0FBaUM7QUFDaEQsa0JBQU0sRUFBRSxPQUFPLElBQUksTUFBTSxpQkFBaUIsR0FBRztBQUM3QyxrQkFBTSxVQUFVLE1BQU0sUUFBUTtBQUFBLGNBQzVCO0FBQUEsZ0JBQ0UsTUFBTTtBQUFBLGdCQUNOLFNBQVM7QUFBQSw4RUFDNEMsT0FBTyxZQUFZLGFBQVU7QUFBQSxVQUN4RixPQUFPLGFBQWEsS0FBSyxPQUFPLE1BQU07QUFBQSxpQkFDL0IsT0FBTyxXQUFXO0FBQUEsVUFDekIsT0FBTyxLQUFLO0FBQUEsUUFDZCxPQUFPLElBQUk7QUFBQTtBQUFBO0FBQUEsZ0JBR0gsS0FBSyxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUUsVUFBVSxHQUFHLENBQUMsQ0FBQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxjQVk3QyxvQkFBSSxLQUFLLEdBQUUsWUFBWSxFQUFFLE1BQU0sR0FBRyxFQUFFLENBQUMsQ0FBQztBQUFBO0FBQUEsY0FFckM7QUFBQSxjQUNBLEVBQUUsTUFBTSxRQUFRLFNBQVMsNENBQXNDLE9BQU8sYUFBYSxLQUFLLE9BQU8sV0FBVyxrQkFBa0IsT0FBTyxLQUFLLEdBQUc7QUFBQSxZQUM3SSxHQUFHLElBQUk7QUFFUCxnQkFBSSxVQUFVLGdCQUFnQixrQkFBa0I7QUFDaEQsbUJBQU8sSUFBSSxJQUFJLFFBQVEsUUFBUSxDQUFDLEVBQUUsUUFBUSxPQUFPO0FBQUEsVUFDbkQ7QUFLQSxjQUFJLGFBQWEseUJBQXlCO0FBQ3hDLGtCQUFNLEVBQUUsT0FBTyxJQUFJLE1BQU0saUJBQWlCLEdBQUc7QUFDN0Msa0JBQU0sVUFBVSxNQUFNLFFBQVE7QUFBQSxjQUM1QjtBQUFBLGdCQUNFLE1BQU07QUFBQSxnQkFDTixTQUFTO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBT1IsT0FBTyxVQUFVLFdBQVc7QUFBQSxlQUM5QixPQUFPLGVBQWUseUJBQW1CO0FBQUEsbUJBQ3JDLE9BQU8sVUFBVSxRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGdDQU1aLE9BQU8sa0JBQWtCLHlCQUFtQjtBQUFBO0FBQUE7QUFBQTtBQUFBLGNBSTlEO0FBQUEsY0FDQSxFQUFFLE1BQU0sUUFBUSxTQUFTLGFBQWEsT0FBTyxNQUFNLFlBQVksT0FBTyxPQUFPLGNBQWMsT0FBTyxXQUFXLG1CQUFnQixPQUFPLGNBQWMsR0FBRztBQUFBLFlBQ3ZKLEdBQUcsSUFBSTtBQUVQLGdCQUFJLFVBQVUsZ0JBQWdCLGtCQUFrQjtBQUNoRCxtQkFBTyxJQUFJLElBQUksUUFBUSxRQUFRLENBQUMsRUFBRSxRQUFRLE9BQU87QUFBQSxVQUNuRDtBQUtBLGNBQUksYUFBYSxrQ0FBa0M7QUFDakQsa0JBQU0sRUFBRSxPQUFPLElBQUksTUFBTSxpQkFBaUIsR0FBRztBQUM3QyxrQkFBTSxhQUFhLE9BQU8sY0FBYztBQUN4QyxrQkFBTSxjQUFjLE9BQU8sZUFBZTtBQUMxQyxrQkFBTSxpQkFBaUIsT0FBTyxrQkFBa0I7QUFDaEQsa0JBQU0sbUJBQW1CLE9BQU8sb0JBQW9CO0FBRXBELGtCQUFNLFVBQVUsTUFBTSxRQUFRO0FBQUEsY0FDNUI7QUFBQSxnQkFDRSxNQUFNO0FBQUEsZ0JBQ04sU0FBUztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsY0FjWDtBQUFBLGNBQ0E7QUFBQSxnQkFDRSxNQUFNO0FBQUEsZ0JBQ04sU0FBUyxZQUFZLFVBQVU7QUFBQSxTQUFZLFdBQVc7QUFBQSxhQUFnQixnQkFBZ0I7QUFBQSxhQUFnQixjQUFjO0FBQUEsY0FDdEg7QUFBQSxZQUNGLEdBQUcsSUFBSTtBQUVQLGdCQUFJLFVBQVUsZ0JBQWdCLGtCQUFrQjtBQUNoRCxtQkFBTyxJQUFJLElBQUksUUFBUSxRQUFRLENBQUMsRUFBRSxRQUFRLE9BQU87QUFBQSxVQUNuRDtBQUtBLGNBQUksYUFBYSw0QkFBNEI7QUFDM0Msa0JBQU0sRUFBRSxPQUFPLElBQUksTUFBTSxpQkFBaUIsR0FBRztBQUM3QyxrQkFBTSxVQUFVLE1BQU0sUUFBUTtBQUFBLGNBQzVCO0FBQUEsZ0JBQ0UsTUFBTTtBQUFBLGdCQUNOLFNBQVM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGNBV1g7QUFBQSxjQUNBLEVBQUUsTUFBTSxRQUFRLFNBQVMsV0FBVyxPQUFPLGlCQUFpQixRQUFRO0FBQUEsVUFBYSxPQUFPLHNCQUFzQix3QkFBd0IsR0FBRztBQUFBLFlBQzNJLEdBQUcsSUFBSTtBQUVQLGdCQUFJLFVBQVUsZ0JBQWdCLGtCQUFrQjtBQUNoRCxtQkFBTyxJQUFJLElBQUksUUFBUSxRQUFRLENBQUMsRUFBRSxRQUFRLE9BQU87QUFBQSxVQUNuRDtBQUtBLGNBQUksYUFBYSw0QkFBNEI7QUFDM0Msa0JBQU0sU0FBUyxPQUFPLGFBQWEsSUFBSSxRQUFRLEtBQUs7QUFDcEQsZ0JBQUksVUFBVSxnQkFBZ0Isa0JBQWtCO0FBQ2hELG1CQUFPLElBQUksSUFBSSxLQUFLLFVBQVU7QUFBQSxjQUM1QjtBQUFBLGNBQ0EsWUFBWTtBQUFBLGNBQ1osY0FBYztBQUFBLGNBQ2QsUUFBUTtBQUFBLGNBQ1IsVUFBVTtBQUFBLGNBQ1YsYUFBYTtBQUFBLGNBQ2IsV0FBVztBQUFBLGNBQ1gsYUFBYTtBQUFBLGNBQ2IsY0FBYztBQUFBLFlBQ2hCLENBQUMsQ0FBQztBQUFBLFVBQ0o7QUFFQSxjQUFJLGFBQWEsNkJBQTZCO0FBQzVDLGdCQUFJLFVBQVUsZ0JBQWdCLGtCQUFrQjtBQUNoRCxtQkFBTyxJQUFJLElBQUksS0FBSyxVQUFVO0FBQUEsY0FDNUIsU0FBUztBQUFBLGNBQ1QsU0FBUztBQUFBLFlBQ1gsQ0FBQyxDQUFDO0FBQUEsVUFDSjtBQUdBLGVBQUs7QUFBQSxRQUNQLFNBQVMsR0FBUTtBQUNmLGNBQUksYUFBYTtBQUNqQixjQUFJLFVBQVUsZ0JBQWdCLGtCQUFrQjtBQUNoRCxjQUFJLElBQUksS0FBSyxVQUFVLEVBQUUsT0FBTyxFQUFFLFdBQVcsaURBQThDLENBQUMsQ0FBQztBQUFBLFFBQy9GO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDSDtBQUFBLEVBQ0Y7QUFDRjs7O0FEM3dDQSxJQUFNLG1DQUFtQztBQU96QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLEtBQUs7QUFBQSxNQUNILFNBQVM7QUFBQSxJQUNYO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsYUFBYTtBQUFBLElBQ2IsTUFBTTtBQUFBLElBQ04sU0FBUyxpQkFBaUIsZ0JBQWdCO0FBQUEsRUFDNUMsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUNoQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLQyxNQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbInBhdGgiLCAiZGIiLCAicGF0aCJdCn0K
