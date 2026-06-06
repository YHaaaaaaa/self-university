import { getDashboardStats } from "@/lib/actions/dashboard";
import { getTodayAssignments } from "@/lib/actions/assignments";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TodayAssignments } from "@/components/dashboard/today-assignments";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const [stats, assignments] = await Promise.all([
    getDashboardStats(),
    getTodayAssignments(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">ダッシュボード</h1>
        <p className="text-sm text-muted-foreground">{formatDate(new Date())}</p>
      </div>

      <StatsCards stats={stats} />
      <TodayAssignments assignments={assignments ?? []} />
    </div>
  );
}
