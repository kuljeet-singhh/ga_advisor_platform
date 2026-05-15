import { query } from "../config/db.js";

export async function upsertUserByGoogleId({ googleId, email, name }) {
  const result = await query(
    `INSERT INTO users (google_id, email, name)
     VALUES ($1, $2, $3)
     ON CONFLICT (google_id) DO UPDATE
       SET email = COALESCE(EXCLUDED.email, users.email),
           name = COALESCE(EXCLUDED.name, users.name)
     RETURNING id, google_id, email, name, created_at`,
    [googleId, email ?? null, name ?? null]
  );
  return result.rows[0];
}

export async function getUserByGoogleId(googleId) {
  const result = await query(`SELECT id, google_id, email, name, created_at FROM users WHERE google_id = $1`, [
    googleId,
  ]);
  return result.rows[0] ?? null;
}
