export type ApiAuth = { accessToken?: string };

export type ApiFetchError = Error & { status: number; data: unknown };

function getBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

export function getAuthHeaders(accessToken?: string): Record<string, string> {
  if (!accessToken) return {};
  return { Authorization: `Bearer ${accessToken}` };
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
  auth?: ApiAuth
): Promise<T> {
  const url = `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeaders(auth?.accessToken),
    ...(options.headers as Record<string, string> | undefined),
  };
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const message =
      typeof data === "string"
        ? data
        : typeof data === "object" &&
            data !== null &&
            "error" in data &&
            typeof (data as { error: unknown }).error === "string"
          ? (data as { error: string }).error
          : res.statusText;
    const err = new Error(message) as ApiFetchError;
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data as T;
}
