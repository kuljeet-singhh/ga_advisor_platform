"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import SelectPropertyView from "@/components/select-property/SelectPropertyView";
import type { GaPropertyOption } from "@/components/PropertySelector";
import { api, type ApiFetchError } from "@/lib/api";
import type { ConnectionResponse } from "@/types/recommendations";

function formatApiError(e: unknown, fallback: string): string {
  if (e instanceof Error && "status" in e) {
    const err = e as ApiFetchError;
    if (err.status === 503) {
      return "Database not configured. Set DATABASE_URL on the backend and restart.";
    }
  }
  return e instanceof Error ? e.message : fallback;
}

export default function SelectPropertyPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = session?.googleAccessToken;
  const [properties, setProperties] = useState<GaPropertyOption[]>([]);
  const [defaultPropertyId, setDefaultPropertyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [propsRes, connRes] = await Promise.all([
        api<{ properties: GaPropertyOption[] }>("/ga/properties", {}, { accessToken: token }),
        api<ConnectionResponse>("/ga/connection", {}, { accessToken: token }).catch((e) => {
          const err = e as ApiFetchError;
          if (err.status === 404) return null;
          throw e;
        }),
      ]);
      const list = propsRes.properties ?? [];
      setProperties(list);
      const savedId = connRes?.connection?.propertyId ?? null;
      setDefaultPropertyId(savedId);
      if (savedId && list.some((p) => (p.id ?? p.propertyId) === savedId)) {
        setSelectedId(savedId);
      } else if (list.length > 0) {
        setSelectedId(list[0].id ?? list[0].propertyId);
      }
    } catch (e) {
      setError(formatApiError(e, "Failed to load properties"));
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (status === "authenticated" && token) void load();
    if (status === "unauthenticated") setLoading(false);
  }, [status, token, load]);

  async function handleSave() {
    if (!token || !selectedId) return;
    const row = properties.find((x) => (x.id ?? x.propertyId) === selectedId);
    try {
      setSaving(true);
      setError(null);
      const res = await fetch("/api/ga/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: selectedId,
          propertyName: row?.displayName ?? row?.name ?? selectedId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Save failed";
        throw new Error(message);
      }
      router.push("/dashboard");
    } catch (e) {
      setError(formatApiError(e, "Save failed"));
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  }

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-center text-sm text-slate-600">Loading session…</p>
      </div>
    );
  }

  if (status !== "authenticated" || !token) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Select GA4 property</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in with Google (header) to list your properties.
        </p>
      </div>
    );
  }

  return (
    <SelectPropertyView
      properties={properties}
      selectedId={selectedId}
      defaultPropertyId={defaultPropertyId}
      loading={loading}
      saving={saving}
      error={error}
      onSelect={setSelectedId}
      onSave={() => void handleSave()}
      onBack={handleBack}
      onRetry={() => void load()}
    />
  );
}
