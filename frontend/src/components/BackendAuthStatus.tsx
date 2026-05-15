"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";

type MeResponse = { userId: string; email: string | null };

export default function BackendAuthStatus() {
  const { data: session, status } = useSession();
  const accessToken = session?.googleAccessToken;
  const [me, setMe] = useState<MeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !accessToken) {
      setMe(null);
      setError(null);
      return;
    }
    let cancelled = false;
    api<MeResponse>("/auth/me", {}, { accessToken })
      .then((data) => {
        if (!cancelled) {
          setMe(data);
          setError(null);
        }
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setMe(null);
          setError(e.message || "Request failed");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [status, accessToken]);

  if (status === "loading") return null;
  if (status !== "authenticated") return null;
  if (!accessToken) {
    return (
      <p className="text-sm text-amber-700 dark:text-amber-400">
        Signed in; waiting for Google access token. Try signing out and back in.
      </p>
    );
  }
  if (error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        API auth check failed: {error}
      </p>
    );
  }
  if (!me) return <p className="text-sm text-slate-500">Checking API…</p>;
  return (
    <p className="text-sm text-slate-600 dark:text-slate-400">
      API session: <span className="font-mono">{me.userId}</span>
      {me.email ? ` (${me.email})` : ""}
    </p>
  );
}
