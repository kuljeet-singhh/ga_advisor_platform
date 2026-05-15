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

export function getPool() {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  if (!pool) {
    pool = new pg.Pool({
      connectionString: getConnectionString(),
      max: 10,
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
