import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middleware for parsing JSON
  app.use(express.json());

  // In-memory mock database (replace with MySQL for persistence)
  // Key: openid, Value: user data
  const db: Record<string, { records: any[], goal: any, projects: any[], expenseCategories: any[] }> = {};

  const getUserData = (req: express.Request) => {
    // WeChat Cloud Run automatically injects 'x-wx-openid' header
    const openid = (req.headers['x-wx-openid'] || 'default-user') as string;
    if (!db[openid]) {
      db[openid] = { 
        records: [], 
        goal: null, 
        projects: [],
        expenseCategories: [] 
      };
    }
    return db[openid];
  };

  // 获取所有记账记录
  app.get("/api/records", (req, res) => {
    const data = getUserData(req);
    res.json(data.records);
  });

  app.post("/api/records", (req, res) => {
    const data = getUserData(req);
    data.records.unshift(req.body);
    res.json({ success: true });
  });

  app.delete("/api/records/:id", (req, res) => {
    const data = getUserData(req);
    data.records = data.records.filter((r: any) => r.id !== req.params.id);
    res.json({ success: true });
  });

  app.get("/api/goal", (req, res) => {
    res.json(getUserData(req).goal);
  });

  app.post("/api/goal", (req, res) => {
    getUserData(req).goal = req.body;
    res.json({ success: true });
  });

  app.get("/api/projects", (req, res) => {
    res.json(getUserData(req).projects);
  });

  app.post("/api/projects", (req, res) => {
    getUserData(req).projects = req.body.projects;
    res.json({ success: true });
  });

  app.get("/api/expense-categories", (req, res) => {
    res.json(getUserData(req).expenseCategories);
  });

  app.post("/api/expense-categories", (req, res) => {
    getUserData(req).expenseCategories = req.body.categories;
    res.json({ success: true });
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Error starting server:", err);
});
