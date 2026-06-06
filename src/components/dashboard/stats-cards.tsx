import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { STANDING_LABELS } from "@/lib/utils";
import type { DashboardStats } from "@/types/database";

export function StatsCards({ stats }: { stats: DashboardStats }) {
  const standingVariant =
    stats.standing === "good_standing"
      ? "success"
      : stats.standing === "needs_attention"
        ? "warning"
        : "danger";

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>今日の進捗</CardTitle>
        </CardHeader>
        <p className="text-2xl font-semibold">
          {stats.todayCompleted}
          <span className="text-base font-normal text-muted-foreground">
            /{stats.todayTotal} 完了
          </span>
        </p>
        {stats.todayTotal > 0 && (
          <ProgressBar
            value={stats.todayCompleted}
            max={stats.todayTotal}
            className="mt-3"
          />
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>今週の達成率</CardTitle>
        </CardHeader>
        <p className="text-2xl font-semibold">{stats.weeklyRate}%</p>
        <ProgressBar value={stats.weeklyRate} className="mt-3" />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GPA</CardTitle>
        </CardHeader>
        <p className="text-2xl font-semibold">
          {stats.gpa.toFixed(2)}
          <span className="text-base font-normal text-muted-foreground"> / 4.0</span>
        </p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>学習状況</CardTitle>
        </CardHeader>
        <Badge variant={standingVariant} className="text-sm">
          {STANDING_LABELS[stats.standing]}
        </Badge>
      </Card>
    </div>
  );
}
