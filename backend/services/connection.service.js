import { query } from "../config/db.js";
import { encryptSecret, defaultAccessTokenExpiryMs } from "../utils/crypto.js";

export async function upsertConnectionForUser({
  userId,
  propertyId,
  propertyName,
  accessTokenPlain,
  refreshTokenPlain,
  accessTokenExpiresAtMs,
}) {
  const accessEnc = encryptSecret(accessTokenPlain);
  const refreshEnc = refreshTokenPlain ? encryptSecret(refreshTokenPlain) : null;
  const expiresAt = new Date(defaultAccessTokenExpiryMs(accessTokenExpiresAtMs));

  const result = await query(
    `INSERT INTO ga_connections (user_id, property_id, property_name, access_token_encrypted, refresh_token_encrypted, token_expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (user_id) DO UPDATE SET
       property_id = EXCLUDED.property_id,
       property_name = EXCLUDED.property_name,
       access_token_encrypted = EXCLUDED.access_token_encrypted,
       refresh_token_encrypted = COALESCE(EXCLUDED.refresh_token_encrypted, ga_connections.refresh_token_encrypted),
       token_expires_at = EXCLUDED.token_expires_at,
       connected_at = now()
     RETURNING id, user_id, property_id, property_name, token_expires_at, connected_at`,
    [userId, propertyId, propertyName, accessEnc, refreshEnc, expiresAt]
  );
  return result.rows[0];
}
