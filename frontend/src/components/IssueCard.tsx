import type { ReactNode } from "react";

type IssueCardProps = {
  title: string;
  metric?: string;
  impact?: string;
  children?: ReactNode;
};

export default function IssueCard({ title, metric, impact, children }: IssueCardProps) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-zinc-900">{title}</h3>
        {impact ? (
          <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">
            {impact}
          </span>
        ) : null}
      </div>
      {metric ? <p className="mt-1 text-sm text-zinc-500">{metric}</p> : null}
      {children ? <div className="mt-3 text-sm text-zinc-700">{children}</div> : null}
    </article>
  );
}
