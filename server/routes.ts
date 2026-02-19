import type { Express } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";
import {
  getInnovations,
  getInnovationById,
  getTaxonomy,
  getDataSources,
  getStats,
} from "./data/atio-loader";
import { initAuthDB, registerAuthRoutes } from "./auth";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(app: Express): Promise<Server> {
  await initAuthDB();
  registerAuthRoutes(app);

  app.post("/api/ai/ask", async (req, res) => {
    try {
      const { question, context } = req.body;
      if (!question) {
        return res.status(400).json({ error: "Question is required" });
      }

      const stats = getStats();
      const sampleInnovations = getInnovations(1, 5, { search: question });

      const systemPrompt = `You are SEEDi AI, an expert agricultural innovation assistant. You help farmers, policymakers, investors, and researchers find the right agricultural innovations for their unique situation.

You have access to the ATIO Knowledge Base with ${stats.totalInnovations} innovations across ${stats.totalCountries}+ countries aligned with ${stats.totalSdgs} SDGs.

${sampleInnovations.data.length > 0 ? `Here are some relevant innovations from the database:\n${sampleInnovations.data.slice(0, 3).map((inn: any) => `- ${inn.title}: ${inn.description?.substring(0, 150) || 'No description'}`).join('\n')}` : ''}

${context ? `User context: ${context}` : ''}

Keep responses concise (2-4 paragraphs max). Be practical and actionable. When relevant, mention specific innovations from the knowledge base.`;

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-5-nano",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
        stream: true,
        max_completion_tokens: 1024,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("AI ask error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "AI request failed" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "AI request failed" });
      }
    }
  });

  app.get("/api/innovations", (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filters = {
      search: (req.query.search as string) || undefined,
      type: (req.query.type as string) || undefined,
      use_case: (req.query.use_case as string) || undefined,
      readiness_level: (req.query.readiness_level as string) || undefined,
      adoption_level: (req.query.adoption_level as string) || undefined,
      region: (req.query.region as string) || undefined,
      country: (req.query.country as string) || undefined,
      sdg: (req.query.sdg as string) || undefined,
    };
    const result = getInnovations(page, limit, filters);
    res.json(result);
  });

  app.get("/api/innovations/:id", (req, res) => {
    const innovation = getInnovationById(req.params.id);
    if (!innovation) {
      return res.status(404).json({ error: "Innovation not found" });
    }
    res.json(innovation);
  });

  app.get("/api/taxonomy", (req, res) => {
    const vocabulary = (req.query.vocabulary as string) || undefined;
    const terms = getTaxonomy(vocabulary);
    res.json(terms);
  });

  app.get("/api/data-sources", (_req, res) => {
    const sources = getDataSources();
    res.json(sources);
  });

  app.get("/api/stats", (_req, res) => {
    const stats = getStats();
    res.json(stats);
  });

  const httpServer = createServer(app);

  return httpServer;
}
