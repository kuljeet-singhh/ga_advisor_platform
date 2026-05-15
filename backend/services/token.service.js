import { decryptSecret } from "../utils/crypto.js";

export function getAccessTokenFromConnection(connectionRow) {
  if (!connectionRow?.access_token_encrypted) {
    throw new Error("No stored access token for this connection");
  }
  return decryptSecret(connectionRow.access_token_encrypted);
}

export function resolveAccessTokenForSync(connectionRow, bearerFromRequest) {
  if (bearerFromRequest) {
    return bearerFromRequest;
  }
  const expiresAt = connectionRow?.token_expires_at
    ? new Date(connectionRow.token_expires_at).getTime()
    : 0;
  if (expiresAt && Date.now() > expiresAt) {
    const err = new Error("Google access token expired. Sign out and sign in again.");
    err.status = 401;
    throw err;
  }
  return getAccessTokenFromConnection(connectionRow);
}
