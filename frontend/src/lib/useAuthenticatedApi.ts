"use client";

import { useCallback } from "react";
import { useSession } from "next-auth/react";
import { api } from "./api";

export function useAuthenticatedApi() {
  const { data: session, status } = useSession();
  const accessToken = session?.googleAccessToken;
  const boundApi = useCallback(
    <T = unknown>    (path: string, options?: RequestInit) =>
      api<T>(path, options ?? {}, accessToken ? { accessToken } : undefined),
    [accessToken]
  );
  return {
    status,
    accessToken,
    api: boundApi,
  };
}
