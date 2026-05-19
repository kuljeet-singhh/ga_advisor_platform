import type { ReactNode } from "react";

type MetaInfoPillsProps = {
  email?: string | null;
  propertyName?: string | null;
  dateRangeStart?: string | null;
  dateRangeEnd?: string | null;
  fetchedAt?: string | null;
};

function formatDateRange(start?: string | null, end?: string | null): string | null {
  if (!start || !end) return null;
  const fmt = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

function Pill({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
      <span className="text-slate-400">{icon}</span>
      {children}
    </span>
  );
}

export default function MetaInfoPills({
  email,
  propertyName,
  dateRangeStart,
  dateRangeEnd,
  fetchedAt,
}: MetaInfoPillsProps) {
  const range = formatDateRange(dateRangeStart, dateRangeEnd);
  const fetched = fetchedAt
    ? `Fetched ${new Date(fetchedAt).toLocaleString(undefined, {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : null;

  return (
    <div className="flex flex-wrap gap-2">
      {email ? (
        <Pill icon={<UserIcon />}>{email}</Pill>
      ) : null}
      {propertyName ? (
        <Pill icon={<ChartIcon />}>{propertyName}</Pill>
      ) : null}
      {range ? <Pill icon={<CalendarIcon />}>{range}</Pill> : null}
      {fetched ? <Pill icon={<ClockIcon />}>{fetched}</Pill> : null}
    </div>
  );
}

function UserIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
