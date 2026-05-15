const TOKENINFO = "https://www.googleapis.com/oauth2/v3/tokeninfo";

export async function verifyGoogleAccessToken(accessToken) {
  if (!accessToken || typeof accessToken !== "string") return null;
  const url = `${TOKENINFO}?access_token=${encodeURIComponent(accessToken)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (clientId && data.aud && data.aud !== clientId) return null;
  if (!data.sub) return null;
  return { sub: data.sub, email: data.email || null };
}
