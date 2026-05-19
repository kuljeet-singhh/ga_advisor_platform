import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

function getApiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

export async function POST(req: NextRequest) {
  const jwt = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const accessToken = jwt?.googleAccessToken;
  const refreshToken = jwt?.googleRefreshToken;

  if (!accessToken || typeof accessToken !== "string") {
    return NextResponse.json({ error: "Not signed in with Google" }, { status: 401 });
  }
  if (!refreshToken || typeof refreshToken !== "string") {
    return NextResponse.json(
      {
        error:
          "Offline access not granted. Sign out, sign in again with Google, then reconnect your property.",
      },
      { status: 401 }
    );
  }

  let body: { propertyId?: string; propertyName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { propertyId, propertyName } = body;
  if (!propertyId || typeof propertyId !== "string") {
    return NextResponse.json({ error: "propertyId is required" }, { status: 400 });
  }

  const apiBase = getApiBase();
  if (!apiBase) {
    return NextResponse.json({ error: "NEXT_PUBLIC_API_URL is not configured" }, { status: 503 });
  }

  const expiresAtMs =
    typeof jwt.googleAccessTokenExpires === "number" ? jwt.googleAccessTokenExpires : undefined;

  const res = await fetch(`${apiBase}/ga/connections`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      propertyId,
      propertyName,
      refreshToken,
      accessTokenExpiresAtMs: expiresAtMs,
    }),
  });

  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text || res.statusText };
  }

  return NextResponse.json(data, { status: res.status });
}
