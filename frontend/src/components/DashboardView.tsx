"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import MetaInfoPills from "@/components/MetaInfoPills";
import DashboardKpiGrid from "@/components/DashboardKpiGrid";
import DashboardCharts from "@/components/DashboardCharts";
import GaMetricsTable from "@/components/GaMetricsTable";
import AiInsightsFooter from "@/components/AiInsightsFooter";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { api, type ApiFetchError } from "@/lib/api";
import { aggregateGaSnapshot } from "@/lib/aggregateGaSnapshot";
import type { ConnectionResponse } from "@/types/recommendations";
import type { LatestSnapshotResponse } from "@/types/snapshots";

function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">GA4 metrics · last 30 days</p>
      </div>
      {children}
    </div>
  );
}

function FetchButton({ syncing, disabled, onClick }: { syncing: boolean; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled || syncing}
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
    >
      <svg
        className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      {syncing ? "Fetching…" : "Fetch GA data"}
    </button>
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

  const aggregates = useMemo(() => aggregateGaSnapshot(snapshot), [snapshot]);

  const loadSnapshot = useCallback(async () => {
    try {
      const snap = await api<LatestSnapshotResponse>("/snapshots/latest", {}, { accessToken: token });
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
  }, [token]);

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
      await loadSnapshot();
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
        <p className="text-sm text-slate-600">Sign in with Google to view your dashboard.</p>
      </DashboardShell>
    );
  }

  if (noConnection) {
    return (
      <DashboardShell>
        <p className="text-sm text-slate-600">Connect a GA4 property to view analytics data.</p>
        <Link
          href="/select-property"
          className="inline-block rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Select property
        </Link>
      </DashboardShell>
    );
  }

  const headerBlock = (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">GA4 metrics · last 30 days</p>
        </div>
        <FetchButton
          syncing={syncing}
          disabled={!connection}
          onClick={() => void handleFetchGa()}
        />
      </div>
      <MetaInfoPills
        email={session.user?.email}
        propertyName={connection?.propertyName}
        dateRangeStart={snapshot?.snapshot.dateRangeStart}
        dateRangeEnd={snapshot?.snapshot.dateRangeEnd}
        fetchedAt={snapshot?.snapshot.fetchedAt}
      />
    </>
  );

  return (
    <div className="space-y-6">
      {headerBlock}

      <ErrorMessage message={error} onRetry={() => void load()} />

      {noSnapshot && !syncing ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-600 shadow-sm">
          No GA data yet. Click <strong>Fetch GA data</strong> to pull the last 30 days from Google
          Analytics.
        </div>
      ) : null}

      {snapshot && snapshot.rowCount > 0 ? (
        <>
          <DashboardKpiGrid kpis={aggregates.kpis} />
          <DashboardCharts data={aggregates} />
          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-medium text-slate-900">Page breakdown</h2>
              <p className="text-sm text-slate-500">
                {snapshot.rowCount} row{snapshot.rowCount === 1 ? "" : "s"} · sorted by sessions
              </p>
            </div>
            <GaMetricsTable columns={snapshot.columns} rows={snapshot.rows} />
          </section>
        </>
      ) : null}

      <AiInsightsFooter />
    </div>
  );
}
