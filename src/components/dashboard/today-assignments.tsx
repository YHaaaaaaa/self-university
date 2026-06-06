import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/utils";
import type { Assignment } from "@/types/database";

interface TodayAssignmentsProps {
  assignments: (Assignment & { course: { name: string; color: string } })[];
}

export function TodayAssignments({ assignments }: TodayAssignmentsProps) {
  const grouped = assignments.reduce(
    (acc, a) => {
      const courseName = a.course?.name ?? "その他";
      if (!acc[courseName]) acc[courseName] = [];
      acc[courseName].push(a);
      return acc;
    },
    {} as Record<string, typeof assignments>
  );

  if (assignments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>今日の課題</CardTitle>
        </CardHeader>
        <p className="text-sm text-muted-foreground">
          今日の課題はありません。
          <Link href="/assignments/new" className="ml-1 font-medium text-foreground underline">
            課題を追加
          </Link>
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>今日の課題</CardTitle>
        <Link
          href="/assignments"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          すべて見る →
        </Link>
      </CardHeader>

      <div className="space-y-5">
        {Object.entries(grouped).map(([courseName, items]) => (
          <div key={courseName}>
            <div className="mb-2 flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: items[0].course?.color ?? "#6366f1" }}
              />
              <h4 className="text-sm font-medium">{courseName}</h4>
            </div>
            <ul className="space-y-1.5 pl-4">
              {items.map((a) => (
                <li key={a.id} className="flex items-center justify-between">
                  <Link
                    href={`/assignments/${a.id}`}
                    className="flex items-center gap-2 text-sm hover:underline"
                  >
                    <span
                      className={
                        a.status === "completed"
                          ? "text-muted-foreground line-through"
                          : ""
                      }
                    >
                      {a.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {a.estimated_minutes}分
                    </span>
                  </Link>
                  <Badge
                    variant={a.status === "completed" ? "success" : "outline"}
                  >
                    {STATUS_LABELS[a.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}
