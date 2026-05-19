type GaMetricsTableProps = {
  columns: string[];
  rows: Record<string, string | number>[];
};

const CHANNEL_PILL: Record<string, string> = {
  Direct: "bg-blue-50 text-blue-700",
  Referral: "bg-emerald-50 text-emerald-700",
  Unassigned: "bg-amber-50 text-amber-800",
  Organic: "bg-violet-50 text-violet-700",
  "Organic Search": "bg-violet-50 text-violet-700",
  "Paid Search": "bg-orange-50 text-orange-700",
  Social: "bg-pink-50 text-pink-700",
  Email: "bg-cyan-50 text-cyan-700",
};

function formatColumnLabel(name: string): string {
  const labels: Record<string, string> = {
    pagePath: "Page path",
    deviceCategory: "Device",
    sessionDefaultChannelGroup: "Channel",
    country: "Country",
    bounceRate: "Bounce rate",
    averageSessionDuration: "Avg. duration",
    screenPageViews: "Page views",
    newUsers: "New users",
    totalUsers: "Total users",
  };
  return labels[name] ?? name.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

function formatCell(col: string, value: string | number): string {
  if (col === "bounceRate" && typeof value === "number") {
    const pct = value <= 1 ? value * 100 : value;
    return `${Math.round(pct)}%`;
  }
  if (col === "averageSessionDuration" && typeof value === "number") {
    if (value < 60) return `${Math.round(value)}s`;
    return `${Math.floor(value / 60)}m ${Math.round(value % 60)}s`;
  }
  if (typeof value === "number") {
    if (Number.isInteger(value)) return value.toLocaleString();
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return String(value);
}

function ChannelPill({ value }: { value: string }) {
  const cls = CHANNEL_PILL[value] ?? "bg-slate-100 text-slate-700";
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{value}</span>
  );
}

function isNumericColumn(col: string, rows: Record<string, string | number>[]): boolean {
  if (rows.length === 0) return false;
  if (col === "sessionDefaultChannelGroup" || col === "pagePath" || col === "country" || col === "deviceCategory") {
    return false;
  }
  return typeof rows[0][col] === "number" || col === "bounceRate";
}

export default function GaMetricsTable({ columns, rows }: GaMetricsTableProps) {
  if (!columns.length) {
    return (
      <p className="text-sm text-slate-500">No rows returned from Google Analytics for this period.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80">
            {columns.map((col) => (
              <th
                key={col}
                className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${
                  isNumericColumn(col, rows) ? "text-right" : "text-left"
                }`}
              >
                {formatColumnLabel(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50/50">
              {columns.map((col) => {
                const raw = row[col] ?? "";
                const isChannel = col === "sessionDefaultChannelGroup";
                const isBounce = col === "bounceRate";
                return (
                  <td
                    key={col}
                    className={`whitespace-nowrap px-4 py-2.5 ${
                      isNumericColumn(col, rows) ? "text-right tabular-nums" : "text-left"
                    } ${isBounce ? "text-red-600 font-medium" : "text-slate-800"}`}
                  >
                    {isChannel && raw ? <ChannelPill value={String(raw)} /> : formatCell(col, raw)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
