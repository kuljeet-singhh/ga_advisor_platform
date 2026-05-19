type HealthScoreProps = { score?: number | string | null; className?: string };

function scoreBandClass(score: number): string {
  if (score >= 80) return "border-emerald-200 bg-emerald-50";
  if (score >= 60) return "border-amber-200 bg-amber-50";
  return "border-red-200 bg-red-50";
}

function scoreTextClass(score: number): string {
  if (score >= 80) return "text-emerald-800";
  if (score >= 60) return "text-amber-900";
  return "text-red-800";
}

export default function HealthScore({ score, className = "" }: HealthScoreProps) {
  const numeric = typeof score === "number" ? score : Number(score);
  const hasScore = Number.isFinite(numeric);
  const band = hasScore ? scoreBandClass(numeric) : "border-zinc-200 bg-zinc-50";
  const text = hasScore ? scoreTextClass(numeric) : "text-zinc-900";

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border px-8 py-6 ${band} ${className}`}
    >
      <p className="text-sm font-medium text-zinc-500">Health score</p>
      <p className={`text-5xl font-bold tabular-nums ${text}`}>{hasScore ? Math.round(numeric) : "—"}</p>
    </div>
  );
}
