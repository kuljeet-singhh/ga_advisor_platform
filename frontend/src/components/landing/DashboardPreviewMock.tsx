const ISSUES = [
  {
    priority: "High",
    priorityClass: "bg-red-50 text-red-700",
    iconClass: "bg-red-100 text-red-600",
    title: "/pricing — bounce rate is 82%",
    description: "Add a clear CTA button above the fold and compress images",
  },
  {
    priority: "Medium",
    priorityClass: "bg-amber-50 text-amber-700",
    iconClass: "bg-amber-100 text-amber-600",
    title: "Mobile users bouncing 2x more than desktop",
    description: "Fix mobile layout and increase tap target sizes to 44px",
  },
  {
    priority: "Low",
    priorityClass: "bg-emerald-50 text-emerald-700",
    iconClass: "bg-emerald-100 text-emerald-600",
    title: "Organic traffic converting at 0.2%",
    description: "Align landing page content with search intent from GA",
  },
] as const;

export default function DashboardPreviewMock() {
  return (
    <section className="px-4 pb-16">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-6 p-6 sm:p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white">
              62
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">Health score — needs attention</p>
              <p className="mt-1 text-sm text-slate-500">
                3 issues found · Google Merchandise Store · last 30 days
              </p>
            </div>
          </div>

          <ul className="space-y-3">
            {ISSUES.map((issue) => (
              <li
                key={issue.title}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${issue.iconClass}`}
                  aria-hidden
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{issue.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{issue.description}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${issue.priorityClass}`}
                >
                  {issue.priority}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
