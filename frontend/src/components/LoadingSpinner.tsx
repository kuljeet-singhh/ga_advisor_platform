type LoadingSpinnerProps = { label?: string };

export default function LoadingSpinner({ label = "Loading…" }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-zinc-600" role="status">
      <span
        className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-800"
        aria-hidden
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}
