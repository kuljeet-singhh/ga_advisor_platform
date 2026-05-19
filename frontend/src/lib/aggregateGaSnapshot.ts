import type { LatestSnapshotResponse } from "@/types/snapshots";

export type GaRow = Record<string, string | number>;

export type DashboardKpis = {
  totalSessions: number;
  pageViews: number;
  bounceRate: number | null;
  avgSessionDuration: number | null;
  conversions: number;
  newUsers: number;
  totalUsers: number;
};

export type ChannelSessions = { channel: string; sessions: number };
export type ChannelDuration = { channel: string; duration: number };
export type PageSessionsViews = {
  page: string;
  pageFull: string;
  sessions: number;
  pageViews: number;
};

export function formatChartPageLabel(path: string): string {
  const trimmed = path.trim();
  if (!trimmed || trimmed === "/" || trimmed === "(not set)") {
    return "Home";
  }
  let label = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
  if (!label) return "Home";
  if (label.length > 28) {
    label = `${label.slice(0, 26)}…`;
  }
  return label;
}
export type UsersBreakdown = { newUsers: number; returningUsers: number };

export type DashboardAggregates = {
  kpis: DashboardKpis;
  sessionsByChannel: ChannelSessions[];
  durationByChannel: ChannelDuration[];
  sessionsVsPageViews: PageSessionsViews[];
  usersBreakdown: UsersBreakdown;
};

function num(v: string | number | undefined): number {
  if (v === undefined || v === "") return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function sumField(rows: GaRow[], field: string): number {
  return rows.reduce((acc, r) => acc + num(r[field]), 0);
}

function weightedAvg(rows: GaRow[], valueField: string, weightField: string): number | null {
  let weightSum = 0;
  let valueSum = 0;
  for (const r of rows) {
    const w = num(r[weightField]);
    const v = num(r[valueField]);
    if (w <= 0) continue;
    weightSum += w;
    valueSum += v * w;
  }
  if (weightSum === 0) return null;
  return valueSum / weightSum;
}

function groupSum(rows: GaRow[], dimField: string, metricField: string): Map<string, number> {
  const map = new Map<string, number>();
  for (const r of rows) {
    const key = String(r[dimField] ?? "(not set)");
    map.set(key, (map.get(key) ?? 0) + num(r[metricField]));
  }
  return map;
}

function groupWeightedAvg(
  rows: GaRow[],
  dimField: string,
  valueField: string,
  weightField: string
): Map<string, { sum: number; weight: number }> {
  const map = new Map<string, { sum: number; weight: number }>();
  for (const r of rows) {
    const key = String(r[dimField] ?? "(not set)");
    const w = num(r[weightField]);
    const v = num(r[valueField]);
    const cur = map.get(key) ?? { sum: 0, weight: 0 };
    cur.sum += v * w;
    cur.weight += w;
    map.set(key, cur);
  }
  return map;
}

const emptyKpis: DashboardKpis = {
  totalSessions: 0,
  pageViews: 0,
  bounceRate: null,
  avgSessionDuration: null,
  conversions: 0,
  newUsers: 0,
  totalUsers: 0,
};

export function aggregateGaSnapshot(snapshot: LatestSnapshotResponse | null): DashboardAggregates {
  const rows = snapshot?.rows ?? [];
  if (!rows.length) {
    return {
      kpis: emptyKpis,
      sessionsByChannel: [],
      durationByChannel: [],
      sessionsVsPageViews: [],
      usersBreakdown: { newUsers: 0, returningUsers: 0 },
    };
  }

  const channelField = "sessionDefaultChannelGroup";
  const pageField = "pagePath";

  const sessionsByChannelMap = groupSum(rows, channelField, "sessions");
  const sessionsByChannel = [...sessionsByChannelMap.entries()]
    .map(([channel, sessions]) => ({ channel, sessions }))
    .sort((a, b) => b.sessions - a.sessions);

  const durationMap = groupWeightedAvg(rows, channelField, "averageSessionDuration", "sessions");
  const durationByChannel = [...durationMap.entries()]
    .map(([channel, { sum, weight }]) => ({
      channel,
      duration: weight > 0 ? sum / weight : 0,
    }))
    .sort((a, b) => b.duration - a.duration);

  const pageSessions = groupSum(rows, pageField, "sessions");
  const pageViewsMap = groupSum(rows, pageField, "screenPageViews");
  const sessionsVsPageViews = [...pageSessions.entries()]
    .map(([pageFull, sessions]) => ({
      pageFull,
      page: formatChartPageLabel(pageFull),
      sessions,
      pageViews: pageViewsMap.get(pageFull) ?? 0,
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 8);

  const newUsers = sumField(rows, "newUsers");
  const totalUsers = sumField(rows, "totalUsers");
  const returningUsers = Math.max(0, totalUsers - newUsers);

  return {
    kpis: {
      totalSessions: sumField(rows, "sessions"),
      pageViews: sumField(rows, "screenPageViews"),
      bounceRate: weightedAvg(rows, "bounceRate", "sessions"),
      avgSessionDuration: weightedAvg(rows, "averageSessionDuration", "sessions"),
      conversions: sumField(rows, "conversions"),
      newUsers,
      totalUsers,
    },
    sessionsByChannel,
    durationByChannel,
    sessionsVsPageViews,
    usersBreakdown: { newUsers, returningUsers },
  };
}

export function formatPercent(value: number | null): string {
  if (value === null) return "—";
  const pct = value <= 1 ? value * 100 : value;
  return `${Math.round(pct)}%`;
}

export function formatDurationSeconds(seconds: number | null): string {
  if (seconds === null) return "—";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}
