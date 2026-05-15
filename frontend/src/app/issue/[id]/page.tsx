export default function IssueDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Issue</h1>
      <p className="text-sm text-zinc-600">
        Detail for recommendation issue <code className="rounded bg-zinc-200 px-1">{id}</code>.
        Wire to backend recommendation payload.
      </p>
    </div>
  );
}
