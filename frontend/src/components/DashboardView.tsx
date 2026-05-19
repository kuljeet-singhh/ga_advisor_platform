"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import MetaInfoPills from "@/components/MetaInfoPills";
import DashboardKpiGrid from "@/components/DashboardKpiGrid";
import DashboardCharts from "@/components/DashboardCharts";
import GaMetricsTable from "@/components/GaMetricsTable";
import HealthScore from "@/components/HealthScore";
import IssueList, { type IssueItem } from "@/components/IssueList";
import AiInsightsFooter from "@/components/AiInsightsFooter";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { api, type ApiFetchError } from "@/lib/api";
import { aggregateGaSnapshot } from "@/lib/aggregateGaSnapshot";
import type {
  ConnectionResponse,
  LatestRecommendationsResponse,
  RecommendationIssue,
} from "@/types/recommendations";
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

function ActionButton({
  label,
  loadingLabel,
  busy,
  disabled,
  onClick,
  primary,
}: {
  label: string;
  loadingLabel: string;
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled || busy}
      onClick={onClick}
      className={
        primary
          ? "inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
          : "inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
      }
    >
      <svg
        className={`h-4 w-4 ${busy ? "animate-spin" : ""}`}
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
      {busy ? loadingLabel : label}
    </button>
  );
}

function formatSyncError(message: string): string {
  if (/401|expired|invalid.*token/i.test(message)) {
    return `${message} Try signing out and signing in again.`;
  }
  if (
    /quota|429|rate.?limit|exceeded your current quota|LLM_QUOTA_EXCEEDED/i.test(
      message
    )
  ) {
    return `${message} Gemini free quota may be exceeded — try GEMINI_MODEL=gemini-2.5-flash-lite, wait, or switch LLM_PROVIDER to claude.`;
  }
  if (/not set|ANTHROPIC_API_KEY is not set|GEMINI_API_KEY is not set/i.test(message)) {
    return `${message} Set GEMINI_API_KEY or ANTHROPIC_API_KEY (and LLM_PROVIDER) on the backend and restart.`;
  }
  return message;
}

function mapIssuesToListItems(
  issues: RecommendationIssue[],
  recommendationId?: string
): IssueItem[] {
  return issues.map((issue, i) => {
    const metric =
      issue.metric && issue.currentValue
        ? `${issue.metric}: ${issue.currentValue}`
        : issue.metric || issue.currentValue;
    const href =
      recommendationId != null ? `/issue/${recommendationId}?index=${i}` : undefined;
    return {
      title: issue.issue ?? issue.page ?? `Issue ${i + 1}`,
      metric,
      impact: issue.impact,
      href,
      body: (
        <>
          {issue.recommendation ? <p>{issue.recommendation}</p> : null}
          {issue.estimatedImprovement ? (
            <p className="mt-2 text-slate-500">Est. improvement: {issue.estimatedImprovement}</p>
          ) : null}
        </>
      ),
    };
  });
}

export default function DashboardView() {
  const { data: session, status } = useSession();
  const token = session?.googleAccessToken;

  const [connection, setConnection] = useState<ConnectionResponse["connection"] | null>(null);
  const [snapshot, setSnapshot] = useState<LatestSnapshotResponse | null>(null);
  const [recommendations, setRecommendations] = useState<LatestRecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncingGa, setSyncingGa] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noConnection, setNoConnection] = useState(false);
  const [noSnapshot, setNoSnapshot] = useState(false);
  const [noRecommendations, setNoRecommendations] = useState(false);

  const aggregates = useMemo(() => aggregateGaSnapshot(snapshot), [snapshot]);

  const issueItems = useMemo(() => {
    const issues = recommendations?.recommendation?.issues ?? [];
    return mapIssuesToListItems(issues, recommendations?.recommendation?.id);
  }, [recommendations]);

  const showRecommendations =
    recommendations != null &&
    (recommendations.mock ||
      typeof recommendations.recommendation?.healthScore === "number" ||
      (recommendations.recommendation?.issues?.length ?? 0) > 0);

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

  const loadRecommendations = useCallback(async () => {
    try {
      const rec = await api<LatestRecommendationsResponse>(
        "/recommendations/latest",
        {},
        { accessToken: token }
      );
      setRecommendations(rec);
      setNoRecommendations(false);
    } catch (e) {
      const err = e as ApiFetchError;
      if (err.status === 404) {
        setRecommendations(null);
        setNoRecommendations(true);
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
    setNoRecommendations(false);
    try {
      const conn = await api<ConnectionResponse>("/ga/connection", {}, { accessToken: token });
      setConnection(conn.connection);
      await Promise.all([loadSnapshot(), loadRecommendations()]);
    } catch (e) {
      const err = e as ApiFetchError;
      if (err.status === 404) {
        setNoConnection(true);
        setConnection(null);
        setSnapshot(null);
        setRecommendations(null);
      } else {
        setError(err.message || "Failed to load dashboard");
      }
    } finally {
      setLoading(false);
    }
  }, [token, loadSnapshot, loadRecommendations]);

  useEffect(() => {
    if (status === "authenticated" && token) void load();
    if (status === "unauthenticated") setLoading(false);
  }, [status, token, load]);

  async function handleFetchGa() {
    if (!token || !connection?.id) return;
    setSyncingGa(true);
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
      setSyncingGa(false);
    }
  }

  async function handleRunAnalysis() {
    if (!token || !connection?.id) return;
    setAnalysing(true);
    setError(null);
    try {
      const result = await api<LatestRecommendationsResponse>(
        `/sync/${connection.id}`,
        { method: "POST" },
        { accessToken: token }
      );
      setRecommendations({
        recommendation: result.recommendation,
        snapshot: result.snapshot ?? { fetchedAt: null },
        mock: false,
      });
      setNoRecommendations(false);
      await loadSnapshot();
    } catch (e) {
      const err = e as ApiFetchError;
      setError(formatSyncError(err.message || "Analysis failed"));
    } finally {
      setAnalysing(false);
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

  const busy = syncingGa || analysing;

  const headerBlock = (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">GA4 metrics · last 30 days</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionButton
            label="Fetch GA data"
            loadingLabel="Fetching…"
            busy={syncingGa}
            disabled={!connection || analysing}
            onClick={() => void handleFetchGa()}
          />
          <ActionButton
            label="Run analysis"
            loadingLabel="Analyzing…"
            busy={analysing}
            disabled={!connection || syncingGa}
            onClick={() => void handleRunAnalysis()}
            primary
          />
        </div>
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

      {recommendations?.mock ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Sample recommendations shown. Click <strong>Run analysis</strong> for live AI insights.
        </div>
      ) : null}

      {showRecommendations ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-medium text-slate-900">AI insights</h2>
            {recommendations?.recommendation?.generatedAt ? (
              <p className="text-sm text-slate-500">
                Generated {new Date(recommendations.recommendation.generatedAt).toLocaleString()}
              </p>
            ) : null}
          </div>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,220px)_1fr]">
            <HealthScore score={recommendations?.recommendation?.healthScore} />
            <div className="min-w-0 space-y-4">
              {recommendations?.recommendation?.summary ? (
                <p className="text-sm leading-relaxed text-slate-700">
                  {recommendations.recommendation.summary}
                </p>
              ) : null}
              <IssueList issues={issueItems} />
            </div>
          </div>
        </section>
      ) : noRecommendations && !busy ? (
        <AiInsightsFooter />
      ) : null}

      {noSnapshot && !busy ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-600 shadow-sm">
          No GA data yet. Click <strong>Fetch GA data</strong> or <strong>Run analysis</strong> to
          pull the last 30 days from Google Analytics.
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
    </div>
  );
}
