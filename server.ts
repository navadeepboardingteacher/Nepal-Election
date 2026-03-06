import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import pLimit from "p-limit";
import NodeCache from "node-cache";
import * as cheerio from "cheerio";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache

const app = express();
app.use(express.json());

// API proxy for election data
  app.get("/api/proxy/home", async (req, res) => {
    try {
      const response = await fetch("https://electionadmin.psbnepal.gov.np/api/v1/home_api/", {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch initial data" });
    }
  });

  app.post("/api/proxy/search", express.json(), async (req, res) => {
    try {
      const response = await fetch("https://electionadmin.psbnepal.gov.np/api/v1/search", {
        method: "POST",
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch search results" });
    }
  });

  app.get("/api/proxy/parties", async (req, res) => {
    try {
      const response = await fetch("https://electionadmin.psbnepal.gov.np/api/v1/home_api/party", {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch party data" });
    }
  });

  app.get("/api/proxy/provinces", async (req, res) => {
    try {
      const response = await fetch("https://election.ratopati.com/api/address/province", {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch provinces map data" });
    }
  });

  app.get("/api/proxy/summary", async (req, res) => {
    try {
      const cachedSummary = cache.get("summary");
      if (cachedSummary) {
        return res.json(cachedSummary);
      }

      // 1. Get districts
      const homeRes = await fetch("https://electionadmin.psbnepal.gov.np/api/v1/home_api/", {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      const homeData = await homeRes.json();
      const districts = homeData.find((d: any) => d.type === 'district')?.data || [];

      if (districts.length === 0) {
        throw new Error("No districts found");
      }

      // 2. Fetch results for all districts in parallel (limit 5)
      const limit = pLimit(5);
      const districtPromises = districts.map((d: any) => limit(async () => {
        try {
          const res = await fetch("https://electionadmin.psbnepal.gov.np/api/v1/search", {
            method: "POST",
            headers: {
              "User-Agent": "Mozilla/5.0",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ election_type: 1, district: d.disrict_number })
          });
          const data = await res.json();
          return { district: d, data: data.data };
        } catch (e) {
          console.error(`Failed to fetch district ${d.disrict_name}`, e);
          return null;
        }
      }));

      const results = await Promise.all(districtPromises);
      
      // 3. Aggregate
      const partyStats: Record<string, { wins: number, leads: number, total_votes: number }> = {};
      
      results.forEach((r: any) => {
        if (!r || !r.data) return;
        
        Object.values(r.data).forEach((candidates: any) => {
          if (!Array.isArray(candidates) || candidates.length === 0) return;
          
          // Sort by votes
          const sorted = [...candidates].sort((a: any, b: any) => (Number(b.vote) || 0) - (Number(a.vote) || 0));
          const top = sorted[0];
          
          // Aggregate votes for all candidates
          candidates.forEach((c: any) => {
            if (!partyStats[c.party]) {
              partyStats[c.party] = { wins: 0, leads: 0, total_votes: 0 };
            }
            partyStats[c.party].total_votes += (Number(c.vote) || 0);
          });

          // Count wins/leads
          if (top) {
            if (top.is_elected) {
              partyStats[top.party].wins++;
            } else {
              partyStats[top.party].leads++;
            }
          }
        });
      });

      const summary = Object.entries(partyStats).map(([party, stats]) => ({
        party,
        ...stats
      })).sort((a, b) => (b.wins + b.leads) - (a.wins + a.leads));

      cache.set("summary", summary);
      res.json(summary);
    } catch (error) {
      console.error("Summary fetch error:", error);
      res.status(500).json({ error: "Failed to fetch summary" });
    }
  });

  app.get("/api/proxy/news", async (req, res) => {
    try {
      const cachedNews = cache.get("news");
      if (cachedNews) {
        return res.json(cachedNews);
      }

      const response = await fetch("https://www.ratopati.com/segment/parliament-election-2082", {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      const html = await response.text();
      const $ = cheerio.load(html);
      const news: any[] = [];

      $(".column-news-list .item").each((i, el) => {
        if (i >= 10) return;
        const title = $(el).find("h3 a").text().trim();
        const link = "https://www.ratopati.com" + $(el).find("h3 a").attr("href");
        const image = $(el).find("img").attr("src");
        const time = $(el).find(".time").text().trim();
        news.push({ title, link, image, time });
      });

      cache.set("news", news, 600); // 10 minutes cache
      res.json(news);
    } catch (error) {
      console.error("News fetch error:", error);
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

// Vite middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      if (req.path.startsWith('/api')) return;
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }
}

setupVite();

const PORT = 3000;
if (!process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
