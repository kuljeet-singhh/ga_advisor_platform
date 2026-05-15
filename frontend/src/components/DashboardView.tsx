"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import BackendAuthStatus from "@/components/BackendAuthStatus";
import GaMetricsTable from "@/components/GaMetricsTable";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { api, type ApiFetchError } from "@/lib/api";
import type { ConnectionResponse } from "@/types/recommendations";
import type { LatestSnapshotResponse } from "@/types/snapshots";

function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <BackendAuthStatus />
      {children}
    </div>
  );
}

function formatSyncError(message: string): string {
  if (/401|expired|invalid.*token/i.test(message)) {
    return `${message} Try signing out and signing in again.`;
  }
  return message;
}

export default function DashboardView() {
  const { data: session, status } = useSession();
  const token = session?.googleAccessToken;

  const [connection, setConnection] = useState<ConnectionResponse["connection"] | null>(null);
  const [snapshot, setSnapshot] = useState<LatestSnapshotResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noConnection, setNoConnection] = useState(false);
  const [noSnapshot, setNoSnapshot] = useState(false);

  const loadSnapshot = useCallback(
    async (conn: ConnectionResponse["connection"]) => {
      try {
        const snap = await api<LatestSnapshotResponse>(
          "/snapshots/latest",
          {},
          { accessToken: token }
        );
        setSnapshot(snap);
        setNoSnapshot(false);
      } catch (e) {
        const err = e as ApiFetchError;
        if (err.status === 404) {
          setSnapshot(null);
          setNoSnapshot(true);
        } else {
          throw e;
        }
      }
    },
    [token]
  );

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setNoConnection(false);
    setNoSnapshot(false);
    try {
      const conn = await api<ConnectionResponse>("/ga/connection", {}, { accessToken: token });
      setConnection(conn.connection);
      await loadSnapshot(conn.connection);
    } catch (e) {
      const err = e as ApiFetchError;
      if (err.status === 404) {
        setNoConnection(true);
        setConnection(null);
        setSnapshot(null);
      } else {
        setError(err.message || "Failed to load dashboard");
      }
    } finally {
      setLoading(false);
    }
  }, [token, loadSnapshot]);

  useEffect(() => {
    if (status === "authenticated" && token) void load();
    if (status === "unauthenticated") setLoading(false);
  }, [status, token, load]);

  async function handleFetchGa() {
    if (!token || !connection?.id) return;
    setSyncing(true);
    setError(null);
    try {
      const result = await api<LatestSnapshotResponse>(
        `/sync/${connection.id}/ga`,
        { method: "POST" },
        { accessToken: token }
      );
      setSnapshot(result);
      setNoSnapshot(false);
    } catch (e) {
      const err = e as ApiFetchError;
      setError(formatSyncError(err.message || "Failed to fetch GA data"));
    } finally {
      setSyncing(false);
    }
  }

  if (status === "loading" || (status === "authenticated" && loading)) {
    return <LoadingSpinner label="Loading dashboard…" />;
  }

  if (status !== "authenticated" || !token) {
    return (
      <DashboardShell>
        <p className="text-sm text-zinc-600">Sign in with Google to view your dashboard.</p>
      </DashboardShell>
    );
  }

  if (noConnection) {
    return (
      <DashboardShell>
        <p className="text-sm text-zinc-600">Connect a GA4 property to view analytics data.</p>
        <Link
          href="/select-property"
          className="inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          Select property
        </Link>
      </DashboardShell>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <BackendAuthStatus />
          {connection ? (
            <p className="text-sm text-zinc-500">
              Property:{" "}
              <span className="font-medium text-zinc-800">{connection.propertyName}</span>
            </p>
          ) : null}
          {snapshot ? (
            <p className="text-xs text-zinc-400">
              Data: {snapshot.snapshot.dateRangeStart} – {snapshot.snapshot.dateRangeEnd}
              {snapshot.snapshot.fetchedAt
                ? ` · Fetched ${new Date(snapshot.snapshot.fetchedAt).toLocaleString()}`
                : null}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          disabled={syncing || !connection}
          onClick={() => void handleFetchGa()}
          className="shrink-0 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {syncing ? "Fetching…" : "Fetch GA data"}
        </button>
      </div>

      <ErrorMessage message={error} onRetry={() => void load()} />

      {noSnapshot && !syncing ? (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
          No GA data yet. Click <strong>Fetch GA data</strong> to pull the last 30 days from
          Google Analytics.
        </p>
      ) : null}

      {snapshot ? (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">GA4 metrics (last 30 days)</h2>
          <p className="text-sm text-zinc-500">
            {snapshot.rowCount} row{snapshot.rowCount === 1 ? "" : "s"} · sorted by sessions
          </p>
          <GaMetricsTable columns={snapshot.columns} rows={snapshot.rows} />
        </section>
      ) : null}

      <section className="rounded-lg border border-dashed border-zinc-200 px-4 py-3 text-sm text-zinc-500">
        AI health score and recommendations — coming soon.
      </section>
    </div>
  );
}
