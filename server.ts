import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import pLimit from "p-limit";
import NodeCache from "node-cache";
import * as cheerio from "cheerio";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("election.db");
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS provinces (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS districts (
    id INTEGER PRIMARY KEY,
    province_id INTEGER,
    name TEXT UNIQUE,
    FOREIGN KEY(province_id) REFERENCES provinces(id)
  );

  CREATE TABLE IF NOT EXISTS candidates (
    id INTEGER PRIMARY KEY,
    district_id INTEGER,
    name TEXT,
    party TEXT,
    votes INTEGER,
    image_url TEXT,
    is_leading BOOLEAN,
    FOREIGN KEY(district_id) REFERENCES districts(id)
  );
`);

// Seed Data (Simplified for demo)
const provincesData = [
  {
    name: "Koshi",
    districts: ["Bhojpur", "Dhankuta", "Ilam", "Jhapa", "Khotang", "Morang", "Okhaldhunga", "Panchthar", "Sankhuwasabha", "Solukhumbu", "Sunsari", "Taplejung", "Terhathum", "Udayapur"]
  },
  {
    name: "Madhesh",
    districts: ["Bara", "Dhanusha", "Mahottari", "Parsa", "Rautahat", "Saptari", "Sarlahi", "Siraha"]
  },
  {
    name: "Bagmati",
    districts: ["Bhaktapur", "Chitwan", "Dhading", "Dolakha", "Kathmandu", "Kavrepalanchok", "Lalitpur", "Makwanpur", "Nuwakot", "Ramechhap", "Rasuwa", "Sindhuli", "Sindhupalchok"]
  },
  {
    name: "Gandaki",
    districts: ["Baglung", "Gorkha", "Kaski", "Lamjung", "Manang", "Mustang", "Myagdi", "Nawalpur", "Parbat", "Syangja", "Tanahun"]
  },
  {
    name: "Lumbini",
    districts: ["Arghakhanchi", "Banke", "Bardiya", "Dang", "Gulmi", "Kapilvastu", "Parasi", "Palpa", "Pyuthan", "Rolpa", "Rukum East", "Rupandehi"]
  },
  {
    name: "Karnali",
    districts: ["Dailekh", "Dolpa", "Humla", "Jajarkot", "Jumla", "Kalikot", "Mugu", "Rukum West", "Salyan", "Surkhet"]
  },
  {
    name: "Sudurpashchim",
    districts: ["Achham", "Baitadi", "Bajhang", "Bajura", "Dadeldhura", "Darchula", "Doti", "Kailali", "Kanchanpur"]
  }
];

const parties = ["Nepali Congress (NC)", "CPN-UML", "CPN-Maoist Center", "Rastriya Swatantra Party (RSP)", "Rastriya Prajatantra Party (RPP)", "Janata Samajbadi Party (JSP)", "Loktantrik Samajbadi Party (LSP)", "CPN-Unified Socialist"];

const firstNames = ["Ram", "Shyam", "Hari", "Sita", "Gita", "Rita", "Krishna", "Radha", "Bishnu", "Laxmi", "Arjun", "Bhim", "Nakul", "Sahadev", "Kushal", "Sandeep", "Paras", "Gyanendra", "Sher", "KP", "Pushpa", "Madhav", "Baburam", "Gagan", "Rabi", "Sagar", "Anil", "Sunil", "Binod", "Upendra"];
const lastNames = ["Sharma", "Adhikari", "Paudel", "Thapa", "Basnet", "Karki", "Bista", "Rana", "Shah", "Shrestha", "Maharjan", "Bajracharya", "Tamang", "Gurung", "Magar", "Rai", "Limbu", "Yadav", "Jha", "Thakur", "Mandal", "Chaudhary", "Dahal", "Oli", "Deuba", "Prachanda", "Lamichhane", "Thapa", "Bhattarai", "Nembang"];

const getRandomName = () => {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${first} ${last}`;
};

const seedData = () => {
  const provinceCount = db.prepare("SELECT COUNT(*) as count FROM provinces").get() as { count: number };
  if (provinceCount.count === 0) {
    const insertProvince = db.prepare("INSERT INTO provinces (name) VALUES (?)");
    const insertDistrict = db.prepare("INSERT INTO districts (province_id, name) VALUES (?, ?)");
    const insertCandidate = db.prepare("INSERT INTO candidates (district_id, name, party, votes, image_url, is_leading) VALUES (?, ?, ?, ?, ?, ?)");

    provincesData.forEach((pData) => {
      const provinceId = insertProvince.run(pData.name).lastInsertRowid as number;
      
      pData.districts.forEach(dName => {
        const districtId = insertDistrict.run(provinceId, dName).lastInsertRowid as number;
        
        // Add 2-3 candidates per district
        const numCandidates = 2 + Math.floor(Math.random() * 2);
        const shuffledParties = [...parties].sort(() => 0.5 - Math.random());
        
        let maxVotes = 0;
        let leadingCandidateId = -1;
        const candidates = [];

        for (let i = 0; i < numCandidates; i++) {
          const votes = 5000 + Math.floor(Math.random() * 35000);
          const name = getRandomName();
          candidates.push({ name, party: shuffledParties[i], votes });
          if (votes > maxVotes) {
            maxVotes = votes;
            leadingCandidateId = i;
          }
        }

        candidates.forEach((c, i) => {
          insertCandidate.run(
            districtId, 
            c.name, 
            c.party, 
            c.votes, 
            `https://picsum.photos/seed/${c.name.replace(/\s+/g, '')}/200/200`, 
            i === leadingCandidateId ? 1 : 0
          );
        });
      });
    });
  }
};

seedData();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/data", (req, res) => {
    const districts = db.prepare(`
      SELECT 
        d.id,
        d.name as district,
        p.name as province
      FROM districts d
      JOIN provinces p ON d.province_id = p.id
    `).all() as any[];

    const result = districts.map(d => {
      const candidates = db.prepare(`
        SELECT name, party, votes, image_url, is_leading
        FROM candidates
        WHERE district_id = ?
        ORDER BY votes DESC
      `).all(d.id) as any[];

      return {
        ...d,
        leading: candidates[0],
        runner_up: candidates[1] || null
      };
    });

    res.json(result);
  });

  app.get("/api/summary", (req, res) => {
    const summary = db.prepare(`
      SELECT 
        p.name as province,
        COUNT(DISTINCT d.id) as district_count,
        SUM(c.votes) as total_votes
      FROM provinces p
      LEFT JOIN districts d ON p.id = d.province_id
      LEFT JOIN candidates c ON d.id = c.district_id
      GROUP BY p.id
    `).all();
    res.json(summary);
  });

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
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
