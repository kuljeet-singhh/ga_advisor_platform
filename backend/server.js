import "dotenv/config";
import http from "node:http";
import express from "express";
import cors from "cors";
import { errorMiddleware } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import gaRoutes from "./routes/ga.routes.js";
import analyseRoutes from "./routes/analyse.routes.js";
import { getPool } from "./config/db.js";

const app = express();
const basePort = Number(process.env.PORT) || 4000;
const origin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
const allowPortFallback =
  process.env.DEV_PORT_FALLBACK === "1" && process.env.NODE_ENV !== "production";
const maxAttempts = allowPortFallback ? 5 : 1;

app.use(cors({ origin, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/health/db", async (_req, res) => {
  const pool = getPool();
  if (!pool) {
    return res.status(503).json({ ok: false, db: "not_configured" });
  }
  try {
    const r = await pool.query("SELECT 1 AS ok");
    if (r.rows[0]?.ok === 1) {
      return res.json({ ok: true, db: "up" });
    }
    return res.status(500).json({ ok: false, db: "unexpected" });
  } catch (e) {
    return res.status(503).json({ ok: false, db: "error", error: e.message });
  }
});

app.use("/auth", authRoutes);
app.use("/ga", gaRoutes);
app.use("/", analyseRoutes);

app.use(errorMiddleware);

const server = http.createServer(app);

let attempt = 0;

server.on("error", (err) => {
  if (err.code !== "EADDRINUSE") {
    console.error("[ga-advisor-backend] Server error:", err);
    process.exit(1);
    return;
  }

  attempt++;
  if (attempt >= maxAttempts) {
    const lastTried = basePort + attempt - 1;
    const rangeHint = allowPortFallback
      ? ""
      : `\n  Local dev: set DEV_PORT_FALLBACK=1 in .env to try ports ${basePort} through ${basePort + 4} when the default port is busy.`;
    console.error(
      `[ga-advisor-backend] Port ${lastTried} is already in use (gave up after ${maxAttempts} attempt(s)).\n` +
        `  Fix: stop the other process (Windows: netstat -ano | findstr :${lastTried} then taskkill /PID <pid> /F)\n` +
        `  Or set PORT in .env and update NEXT_PUBLIC_API_URL on the frontend.${rangeHint}`
    );
    process.exit(1);
    return;
  }

  const nextPort = basePort + attempt;
  console.warn(
    `[ga-advisor-backend] Port ${nextPort - 1} in use, retrying on ${nextPort} (DEV_PORT_FALLBACK)...`
  );
  server.listen(nextPort);
});

server.listen(basePort, () => {
  const addr = server.address();
  const p = typeof addr === "object" && addr && "port" in addr ? addr.port : basePort;
  console.log(`API listening on http://localhost:${p}`);
});
