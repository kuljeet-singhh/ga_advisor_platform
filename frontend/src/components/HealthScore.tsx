type HealthScoreProps = { score?: number | string | null; className?: string };

export default function HealthScore({ score, className = "" }: HealthScoreProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 px-8 py-6 ${className}`}
    >
      <p className="text-sm font-medium text-zinc-500">Health score</p>
      <p className="text-5xl font-bold tabular-nums text-zinc-900">{score ?? "—"}</p>
    </div>
  );
}
