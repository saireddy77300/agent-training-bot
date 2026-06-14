import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

let currentKeyIndex = 0;

  // API endpoints that use external APIs must be registered FIRST
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, knowledgeBase } = req.body;
      
      const apiKeysStr = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
      const baseKeys = apiKeysStr.split(',').map(k => k.trim()).filter(k => k.length > 0);
      const extraKeys = [
        process.env.GEMINI_API_KEY_1,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3,
        process.env.GEMINI_API_KEY_4
      ].filter(k => !!k) as string[];

      const availableKeys = Array.from(new Set([...baseKeys, ...extraKeys]));

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

      // Map our messages to the format expected by the Gemini API
      // Since it expects standard Chat API payload: 
      // role: 'user' | 'model'
      const formattedMessages = messages.map((m: any) => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-flash'];
      let response;
      let lastError: any;

      for (const modelName of modelsToTry) {
        let attempts = 0;
        const numKeys = availableKeys.length;

        while (attempts < numKeys) {
          const keyIndex = currentKeyIndex % numKeys;
          const key = availableKeys[keyIndex];
          currentKeyIndex = (currentKeyIndex + 1) % numKeys;
          
          try {
            const ai = new GoogleGenAI({ apiKey: key });
            response = await ai.models.generateContent({
                model: modelName,
                contents: formattedMessages,
                config: {
                    systemInstruction,
                    temperature: 0.1,
                }
            });
            break; // Success
          } catch (error: any) {
            lastError = error;
            const isQuotaError = error?.status === 429 || 
                                 error?.message?.includes('429') || 
                                 error?.message?.includes('quota') ||
                                 error?.message?.includes('RESOURCE_EXHAUSTED');
            
            if (isQuotaError) {
              console.warn(`${modelName} with API key at index ${keyIndex} hit quota.`);
              attempts++;
            } else {
              throw error; // Not a quota error, bubble up
            }
          }
        }
        if (response) break;
      }

      if (!response) {
         if (lastError?.status === 429 || lastError?.message?.includes('429') || lastError?.message?.includes('quota') || lastError?.message?.includes('RESOURCE_EXHAUSTED')) {
            throw new Error("I am currently experiencing high traffic and have reached my limit. Please wait a moment and try again.");
         }
         throw lastError || new Error("All API keys failed due to rate limits.");
      }

      res.json({ 
        text: response.text,
        usage: response.usageMetadata
      });
    } catch (error: any) {
      console.error("Chat API error:", error);
      res.status(500).json({ error: error.message || "Failed to generate response" });
    }
  });

  app.get("/api/download", (req, res) => {
    res.download(path.join(process.cwd(), 'source-code.tar.gz'));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
