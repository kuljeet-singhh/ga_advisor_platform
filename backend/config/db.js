import pg from "pg";

/**
 * When DATABASE_SSL_REJECT_UNAUTHORIZED=0 (typical Supabase + Node dev), rewrite sslmode so
 * pg v8 does not treat "require" as verify-full (which breaks with some cloud cert chains).
 */
export function getConnectionString() {
  const u = process.env.DATABASE_URL;
  if (!u) return u;
  if (process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "0") return u;
  let out = u.replace(/([?&])sslmode=require\b/gi, "$1sslmode=no-verify");
  if (out === u) {
    out = u.replace(/\bsslmode=require\b/gi, "sslmode=no-verify");
  }
  if (!/sslmode=/i.test(out)) {
    out += (out.includes("?") ? "&" : "?") + "sslmode=no-verify";
  }
  return out;
}

let pool;
let poolConnectionString;

function getPoolMaxConnections() {
  const raw = process.env.DATABASE_POOL_MAX;
  if (raw !== undefined && raw !== "") {
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 1) return Math.min(Math.floor(n), 100);
  }
  if (process.env.VERCEL === "1") return 2;
  return 10;
}

export function getPool() {
  const connectionString = getConnectionString();
  if (!connectionString) {
    return null;
  }
  if (pool && poolConnectionString !== connectionString) {
    pool.end().catch(() => {});
    pool = null;
  }
  if (!pool) {
    poolConnectionString = connectionString;
    pool = new pg.Pool({
      connectionString,
      max: getPoolMaxConnections(),
      idleTimeoutMillis: 30_000,
    });
  }
  return pool;
}

export async function query(text, params) {
  const p = getPool();
  if (!p) throw new Error("DATABASE_URL is not configured");
  return p.query(text, params);
}



