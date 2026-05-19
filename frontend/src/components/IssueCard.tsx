import Link from "next/link";
import type { ReactNode } from "react";

type IssueCardProps = {
  title: string;
  metric?: string;
  impact?: string;
  children?: ReactNode;
  href?: string;
};

function impactBadgeClass(impact?: string): string {
  const key = impact?.toLowerCase() ?? "";
  if (key === "high") return "bg-red-100 text-red-900 ring-1 ring-red-200";
  if (key === "medium") return "bg-amber-100 text-amber-900 ring-1 ring-amber-200";
  if (key === "low") return "bg-slate-100 text-slate-800 ring-1 ring-slate-200";
  return "bg-zinc-100 text-zinc-700";
}

function impactLabel(impact?: string): string {
  if (!impact) return "";
  const key = impact.toLowerCase();
  if (key === "high" || key === "medium" || key === "low") {
    return `${key.charAt(0).toUpperCase()}${key.slice(1)} impact`;
  }
  return impact;
}

export default function IssueCard({ title, metric, impact, children, href }: IssueCardProps) {
  const content = (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-slate-300">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-zinc-900">{title}</h3>
        {impact ? (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${impactBadgeClass(impact)}`}
          >
            {impactLabel(impact)}
          </span>
        ) : null}
      </div>
      {metric ? <p className="mt-1 text-sm text-zinc-500">{metric}</p> : null}
      {children ? <div className="mt-3 text-sm text-zinc-700">{children}</div> : null}
    </article>
  );

  if (href) {
    return (
      <Link href={href} className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
        {content}
      </Link>
    );
  }

  return content;
}
