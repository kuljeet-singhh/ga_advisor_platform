import { googleConfig } from "../config/google.config.js";

const TOKEN_URL = "https://oauth2.googleapis.com/token";

export async function exchangeGoogleRefreshToken(refreshTokenPlain) {
  if (!googleConfig.clientId || !googleConfig.clientSecret) {
    const err = new Error("Google OAuth client credentials are not configured");
    err.status = 503;
    throw err;
  }
  if (!refreshTokenPlain) {
    const err = new Error("No refresh token available");
    err.status = 401;
    throw err;
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshTokenPlain,
    client_id: googleConfig.clientId,
    client_secret: googleConfig.clientSecret,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error_description || data.error || "token_refresh_failed";
    const err = new Error(msg);
    err.status = res.status === 400 || res.status === 401 ? 401 : res.status;
    throw err;
  }
  if (!data.access_token) {
    const err = new Error("Token refresh returned no access_token");
    err.status = 502;
    throw err;
  }
  return data;
}
