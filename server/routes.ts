import type { Express } from "express";
import { createServer, type Server } from "node:http";
import {
  getInnovations,
  getInnovationById,
  getTaxonomy,
  getDataSources,
  getStats,
} from "./data/atio-loader";
import { initAuthDB, registerAuthRoutes } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  await initAuthDB();
  registerAuthRoutes(app);

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
