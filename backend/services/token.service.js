import { decryptSecret } from "../utils/crypto.js";
import { exchangeGoogleRefreshToken } from "./google-oauth.service.js";
import { updateConnectionTokens } from "./connection.service.js";

const EXPIRY_BUFFER_MS = 60_000;

export function getAccessTokenFromConnection(connectionRow) {
  if (!connectionRow?.access_token_encrypted) {
    throw new Error("No stored access token for this connection");
  }
  return decryptSecret(connectionRow.access_token_encrypted);
}

function tokenExpiresWithinBuffer(connectionRow) {
  const expiresAt = connectionRow?.token_expires_at
    ? new Date(connectionRow.token_expires_at).getTime()
    : 0;
  if (!expiresAt) return true;
  return Date.now() > expiresAt - EXPIRY_BUFFER_MS;
}

export async function refreshAccessToken(connectionRow) {
  if (!connectionRow?.refresh_token_encrypted) {
    const err = new Error(
      "No refresh token stored. Sign out, sign in with Google again, and reconnect your GA property."
    );
    err.status = 401;
    throw err;
  }

  const refreshPlain = decryptSecret(connectionRow.refresh_token_encrypted);
  const data = await exchangeGoogleRefreshToken(refreshPlain);
  const expiresIn = Number(data.expires_in) || 3600;

  return updateConnectionTokens(connectionRow.id, {
    accessTokenPlain: data.access_token,
    refreshTokenPlain: data.refresh_token ?? refreshPlain,
    accessTokenExpiresAtMs: Date.now() + expiresIn * 1000,
  });
}

export async function getValidAccessToken(connectionRow) {
  if (connectionRow?.refresh_token_encrypted && tokenExpiresWithinBuffer(connectionRow)) {
    const updated = await refreshAccessToken(connectionRow);
    return getAccessTokenFromConnection(updated);
  }

  const expiresAt = connectionRow?.token_expires_at
    ? new Date(connectionRow.token_expires_at).getTime()
    : 0;
  if (expiresAt && Date.now() > expiresAt) {
    if (connectionRow?.refresh_token_encrypted) {
      const updated = await refreshAccessToken(connectionRow);
      return getAccessTokenFromConnection(updated);
    }
    const err = new Error("Google access token expired. Sign out and sign in again.");
    err.status = 401;
    throw err;
  }

  return getAccessTokenFromConnection(connectionRow);
}

export async function resolveAccessTokenForSync(connectionRow, bearerFromRequest) {
  if (connectionRow?.refresh_token_encrypted) {
    return getValidAccessToken(connectionRow);
  }
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
