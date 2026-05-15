"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import HealthScore from "@/components/HealthScore";
import IssueList, { type IssueItem } from "@/components/IssueList";
import BackendAuthStatus from "@/components/BackendAuthStatus";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { api, type ApiFetchError } from "@/lib/api";
import type {
  ConnectionResponse,
  LatestRecommendationsResponse,
  RecommendationIssue,
} from "@/types/recommendations";

function mapIssuesToList(issues: RecommendationIssue[]): IssueItem[] {
  return issues.map((issue) => ({
    title: issue.page || issue.issue || "Issue",
    metric: issue.metric,
    impact: issue.impact,
    body: issue.recommendation ?? issue.rootCause,
  }));
}

function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <BackendAuthStatus />
      {children}
    </div>
  );
}

export default function DashboardView() {
  const { data: session, status } = useSession();
  const token = session?.googleAccessToken;

  const [connection, setConnection] = useState<ConnectionResponse["connection"] | null>(null);
  const [recommendations, setRecommendations] = useState<LatestRecommendationsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noConnection, setNoConnection] = useState(false);

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setNoConnection(false);
    try {
      const conn = await api<ConnectionResponse>("/ga/connection", {}, { accessToken: token });
      setConnection(conn.connection);
      const rec = await api<LatestRecommendationsResponse>(
        "/recommendations/latest",
        {},
        { accessToken: token }
      );
      setRecommendations(rec);
    } catch (e) {
      const err = e as ApiFetchError;
      if (err.status === 404) {
        setNoConnection(true);
        setConnection(null);
        setRecommendations(null);
      } else {
        setError(err.message || "Failed to load dashboard");
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (status === "authenticated" && token) void load();
    if (status === "unauthenticated") setLoading(false);
  }, [status, token, load]);

  async function handleSync() {
    if (!token || !connection?.id) return;
    setSyncing(true);
    setError(null);
    try {
      const result = await api<LatestRecommendationsResponse>(
        `/sync/${connection.id}`,
        { method: "POST" },
        { accessToken: token }
      );
      setRecommendations(result);
    } catch (e) {
      const err = e as ApiFetchError;
      setError(err.message || "Analysis failed");
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
        <p className="text-sm text-zinc-600">Connect a GA4 property to see health score and issues.</p>
        <Link
          href="/select-property"
          className="inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          Select property
        </Link>
      </DashboardShell>
    );
  }

  const healthScore = recommendations?.recommendation.healthScore ?? null;
  const issues = recommendations?.recommendation.issues ?? [];
  const isMock = recommendations?.mock === true;

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
        </div>
        <button
          type="button"
          disabled={syncing || !connection}
          onClick={() => void handleSync()}
          className="shrink-0 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {syncing ? "Running analysis…" : "Run analysis"}
        </button>
      </div>

      <ErrorMessage message={error} onRetry={() => void load()} />

      {isMock ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
          Showing sample data — click Run analysis for live GA4 insights (requires{" "}
          <code className="text-xs">ANTHROPIC_API_KEY</code> on the backend).
        </p>
      ) : null}

      {recommendations?.recommendation.summary ? (
        <p className="text-sm text-zinc-600">{recommendations.recommendation.summary}</p>
      ) : null}

      <HealthScore score={healthScore} />

      <section>
        <h2 className="mb-3 text-lg font-medium">Top issues</h2>
        <IssueList issues={mapIssuesToList(issues)} />
      </section>
    </div>
  );
}
