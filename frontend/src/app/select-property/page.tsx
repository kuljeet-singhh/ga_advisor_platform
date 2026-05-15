"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import PropertySelector, { type GaPropertyOption } from "@/components/PropertySelector";
import { api } from "@/lib/api";

export default function SelectPropertyPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = session?.googleAccessToken;
  const [properties, setProperties] = useState<GaPropertyOption[]>([]);
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
      const data = await api<{ properties: GaPropertyOption[] }>(
        "/ga/properties",
        {},
        { accessToken: token }
      );
      setProperties(data.properties ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load properties");
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
      await api(
        "/ga/connections",
        {
          method: "POST",
          body: JSON.stringify({
            propertyId: selectedId,
            propertyName: row?.displayName ?? row?.name ?? selectedId,
          }),
        },
        { accessToken: token }
      );
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading") {
    return <p className="text-sm text-zinc-600">Loading session…</p>;
  }

  if (status !== "authenticated" || !token) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Select GA4 property</h1>
        <p className="text-sm text-zinc-600">Sign in with Google (header) to list your properties.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Select GA4 property</h1>
      <p className="text-sm text-zinc-600">
        Choose the property to analyze (MVP: one property per account). Data loads from the
        backend.
      </p>
      {loading ? <p className="text-sm text-zinc-500">Loading properties…</p> : null}
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <PropertySelector
        properties={properties}
        selectedId={selectedId}
        onSelect={(id) => setSelectedId(id)}
      />
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          disabled={!selectedId || saving || loading}
          onClick={() => void handleSave()}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save property"}
        </button>
      </div>
    </div>
  );
}
