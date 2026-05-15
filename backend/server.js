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

function getCorsOptions() {
  const raw = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
  const origins = raw.split(",").map((s) => s.trim()).filter(Boolean);
  const allowVercelPreview =
    process.env.CORS_ALLOW_VERCEL_PREVIEW_ORIGINS === "1";
  const credentials = true;

  if (origins.length === 1 && !allowVercelPreview) {
    return { origin: origins[0], credentials };
  }

  return {
    credentials,
    origin(originHeader, cb) {
      if (!originHeader) {
        return cb(null, false);
      }
      if (origins.includes(originHeader)) {
        return cb(null, originHeader);
      }
      if (allowVercelPreview) {
        try {
          const { hostname } = new URL(originHeader);
          if (hostname === "vercel.app" || hostname.endsWith(".vercel.app")) {
            return cb(null, originHeader);
          }
        } catch {
          /* ignore */
        }
      }
      cb(null, false);
    },
  };
}

app.use(cors(getCorsOptions()));
app.use(express.json());

// Health routes
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

// Routes
app.use("/auth", authRoutes);
app.use("/ga", gaRoutes);
app.use("/", analyseRoutes);

// Error middleware
app.use(errorMiddleware);

// ── Local development only ──────────────────────────────
// Vercel does not use this block — it just uses the export below
if (process.env.NODE_ENV !== "production") {
  const basePort = Number(process.env.PORT) || 4000;
  const allowPortFallback =
    process.env.DEV_PORT_FALLBACK === "1";
  const maxAttempts = allowPortFallback ? 5 : 1;

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
        : `\n  Local dev: set DEV_PORT_FALLBACK=1 in .env to try ports ${basePort} through ${basePort + 4}.`;
      console.error(
        `[ga-advisor-backend] Port ${lastTried} is already in use.\n` +
        `  Fix: stop the other process or set PORT in .env.${rangeHint}`
      );
      process.exit(1);
      return;
    }

    const nextPort = basePort + attempt;
    console.warn(
      `[ga-advisor-backend] Port ${nextPort - 1} in use, retrying on ${nextPort}...`
    );
    server.listen(nextPort);
  });

  server.listen(basePort, () => {
    const addr = server.address();
    const p = typeof addr === "object" && addr && "port" in addr ? addr.port : basePort;
    console.log(`API listening on http://localhost:${p}`);
  });
}

// ── Required for Vercel ─────────────────────────────────
export default app;