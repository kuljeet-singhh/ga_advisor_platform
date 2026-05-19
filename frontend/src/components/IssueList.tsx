import type { ReactNode } from "react";
import IssueCard from "./IssueCard";

export type IssueItem = {
  title?: string;
  metric?: string;
  impact?: string;
  body?: ReactNode;
  href?: string;
};

type IssueListProps = { issues?: IssueItem[] };

export default function IssueList({ issues = [] }: IssueListProps) {
  if (!issues.length) {
    return (
      <p className="text-sm text-zinc-500">
        No issues yet. Run analysis to generate recommendations.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {issues.map((issue, i) => (
        <li key={i}>
          <IssueCard
            title={issue.title ?? `Issue ${i + 1}`}
            metric={issue.metric}
            impact={issue.impact}
            href={issue.href}
          >
            {issue.body}
          </IssueCard>
        </li>
      ))}
    </ul>
  );
}
