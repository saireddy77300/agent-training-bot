var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  let currentKeyIndex = 0;
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, knowledgeBase } = req.body;
      const apiKeysStr = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
      const baseKeys = apiKeysStr.split(",").map((k) => k.trim()).filter((k) => k.length > 0);
      const extraKeys = [
        process.env.GEMINI_API_KEY_1,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3,
        process.env.GEMINI_API_KEY_4
      ].filter((k) => !!k);
      const availableKeys = Array.from(/* @__PURE__ */ new Set([...baseKeys, ...extraKeys]));
      if (availableKeys.length === 0) {
        return res.status(500).json({ error: "No API keys configured. Set GEMINI_API_KEYS (comma separated) or GEMINI_API_KEY_1, 2, 3, 4." });
      }
      const systemInstruction = `You are the Agent Training AI Bot for Lohithadharma Projects PVT, LTD.
You help sales agents by answering their questions regarding company training material, policies, and operations.
You must answer the agent's questions based ONLY on the following custom knowledge base. 
You must explicitly provide responses in Telugu if the user asks in Telugu. Default to English for all other queries.
If the answer is not explicitly stated or inferable from the knowledge base, politely inform the agent that you don't have that information.

<knowledge_base>
${knowledgeBase || "No knowledge base provided."}
</knowledge_base>`;
      const formattedMessages = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash-8b", "gemini-1.5-flash"];
      let response;
      let lastError;
      for (const modelName of modelsToTry) {
        let attempts = 0;
        const numKeys = availableKeys.length;
        while (attempts < numKeys) {
          const keyIndex = currentKeyIndex % numKeys;
          const key = availableKeys[keyIndex];
          currentKeyIndex = (currentKeyIndex + 1) % numKeys;
          try {
            const ai = new import_genai.GoogleGenAI({ apiKey: key });
            response = await ai.models.generateContent({
              model: modelName,
              contents: formattedMessages,
              config: {
                systemInstruction,
                temperature: 0.1
              }
            });
            break;
          } catch (error) {
            lastError = error;
            const isQuotaError = error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("quota") || error?.message?.includes("RESOURCE_EXHAUSTED");
            if (isQuotaError) {
              console.warn(`${modelName} with API key at index ${keyIndex} hit quota.`);
              attempts++;
            } else {
              throw error;
            }
          }
        }
        if (response) break;
      }
      if (!response) {
        if (lastError?.status === 429 || lastError?.message?.includes("429") || lastError?.message?.includes("quota") || lastError?.message?.includes("RESOURCE_EXHAUSTED")) {
          throw new Error("I am currently experiencing high traffic and have reached my limit. Please wait a moment and try again.");
        }
        throw lastError || new Error("All API keys failed due to rate limits.");
      }
      res.json({
        text: response.text,
        usage: response.usageMetadata
      });
    } catch (error) {
      console.error("Chat API error:", error);
      res.status(500).json({ error: error.message || "Failed to generate response" });
    }
  });
  app.get("/api/download", (req, res) => {
    res.download(import_path.default.join(process.cwd(), "source-code.tar.gz"));
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
