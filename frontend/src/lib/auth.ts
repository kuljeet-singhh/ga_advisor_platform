import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

async function refreshGoogleAccessToken(token: JWT) {
  const refresh = token.googleRefreshToken;
  if (!refresh) throw new Error("no_refresh_token");
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    grant_type: "refresh_token",
    refresh_token: refresh,
  });
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  const data = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    refresh_token?: string;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(data.error || "refresh_failed");
  }
  if (!data.access_token) throw new Error("no_access_token");
  return {
    googleAccessToken: data.access_token,
    googleAccessTokenExpires: Date.now() + (data.expires_in ?? 3600) * 1000,
    googleRefreshToken: data.refresh_token ?? refresh,
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/analytics.manage.users.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET ?? "",
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.googleAccessToken = account.access_token;
        token.googleRefreshToken = account.refresh_token ?? token.googleRefreshToken;
        token.googleAccessTokenExpires = account.expires_at
          ? Number(account.expires_at) * 1000
          : Date.now() + Number(account.expires_in ?? 3600) * 1000;
        delete token.error;
        return token;
      }
      if (
        token.googleRefreshToken &&
        typeof token.googleAccessTokenExpires === "number" &&
        Date.now() > token.googleAccessTokenExpires - 60_000
      ) {
        try {
          const refreshed = await refreshGoogleAccessToken(token);
          return { ...token, ...refreshed };
        } catch {
          return {
            ...token,
            error: "RefreshAccessTokenError",
            googleAccessToken: undefined,
          };
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.googleAccessToken = token.googleAccessToken;
      if (token.error) session.error = token.error;
      return session;
    },
  },
};
