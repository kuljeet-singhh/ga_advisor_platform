import HealthScore from "@/components/HealthScore";
import IssueList from "@/components/IssueList";
import BackendAuthStatus from "@/components/BackendAuthStatus";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <BackendAuthStatus />
      <HealthScore score={null} />
      <section>
        <h2 className="mb-3 text-lg font-medium">Top issues</h2>
        <IssueList issues={[]} />
      </section>
    </div>
  );
}
