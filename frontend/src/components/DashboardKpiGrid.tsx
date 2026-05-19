import type { DashboardKpis } from "@/lib/aggregateGaSnapshot";
import { formatDurationSeconds, formatPercent } from "@/lib/aggregateGaSnapshot";

type DashboardKpiGridProps = {
  kpis: DashboardKpis;
};

function KpiCard({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums text-slate-900 ${valueClassName}`}>
        {value}
      </p>
      <p className="mt-0.5 text-xs text-slate-400">last 30 days</p>
    </div>
  );
}

export default function DashboardKpiGrid({ kpis }: DashboardKpiGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <KpiCard label="Total sessions" value={kpis.totalSessions.toLocaleString()} />
      <KpiCard label="Page views" value={kpis.pageViews.toLocaleString()} />
      <KpiCard
        label="Bounce rate"
        value={formatPercent(kpis.bounceRate)}
        valueClassName="text-red-600"
      />
      <KpiCard label="Avg. session" value={formatDurationSeconds(kpis.avgSessionDuration)} />
      <KpiCard label="Conversions" value={kpis.conversions.toLocaleString()} />
      <KpiCard label="New users" value={kpis.newUsers.toLocaleString()} />
    </div>
  );
}
