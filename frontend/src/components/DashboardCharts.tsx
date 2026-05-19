"use client";

import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardAggregates } from "@/lib/aggregateGaSnapshot";

type DashboardChartsProps = {
  data: DashboardAggregates;
};

const CHANNEL_COLORS = ["#3b82f6", "#22c55e", "#94a3b8", "#f59e0b", "#8b5cf6"];
const PURPLE = "#8b5cf6";

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-medium text-slate-900">{title}</h3>
      {subtitle ? <p className="mb-3 text-xs text-slate-500">{subtitle}</p> : <div className="mb-3" />}
      {children}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[200px] items-center justify-center text-sm text-slate-400">No data</div>
  );
}

export default function DashboardCharts({ data }: DashboardChartsProps) {
  const usersPie = [
    { name: "New users", value: data.usersBreakdown.newUsers },
    { name: "Returning", value: data.usersBreakdown.returningUsers },
  ].filter((d) => d.value > 0);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ChartCard title="Sessions by channel">
        {data.sessionsByChannel.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.sessionsByChannel} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="channel" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="sessions" radius={[4, 4, 0, 0]}>
                {data.sessionsByChannel.map((_, i) => (
                  <Cell key={i} fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Avg session duration" subtitle="seconds by channel">
        {data.durationByChannel.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.durationByChannel} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="channel" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(v) => [
                  typeof v === "number" ? `${Math.round(v)}s` : String(v ?? ""),
                  "Duration",
                ]}
              />
              <Bar dataKey="duration" fill={PURPLE} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Sessions vs page views">
        {data.sessionsVsPageViews.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.sessionsVsPageViews} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="page" tick={{ fontSize: 10 }} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="sessions" fill="#3b82f6" name="Sessions" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pageViews" fill="#22c55e" name="Page views" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Users breakdown" subtitle="new vs returning">
        {usersPie.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={usersPie}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
              >
                <Cell fill="#3b82f6" />
                <Cell fill="#cbd5e1" />
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
