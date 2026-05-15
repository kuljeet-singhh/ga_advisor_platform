type GaMetricsTableProps = {
  columns: string[];
  rows: Record<string, string | number>[];
};

function formatColumnLabel(name: string): string {
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function formatCell(value: string | number): string {
  if (typeof value === "number") {
    if (Number.isInteger(value)) return value.toLocaleString();
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return String(value);
}

function isNumericColumn(col: string, rows: Record<string, string | number>[]): boolean {
  if (rows.length === 0) return false;
  return typeof rows[0][col] === "number";
}

export default function GaMetricsTable({ columns, rows }: GaMetricsTableProps) {
  if (!columns.length) {
    return (
      <p className="text-sm text-zinc-500">No rows returned from Google Analytics for this period.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className={`px-4 py-3 font-medium text-zinc-700 ${
                  isNumericColumn(col, rows) ? "text-right" : "text-left"
                }`}
              >
                {formatColumnLabel(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 bg-white">
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 1 ? "bg-zinc-50/50" : ""}>
              {columns.map((col) => (
                <td
                  key={col}
                  className={`whitespace-nowrap px-4 py-2 text-zinc-800 ${
                    isNumericColumn(col, rows) ? "text-right tabular-nums" : "text-left"
                  }`}
                >
                  {formatCell(row[col] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
