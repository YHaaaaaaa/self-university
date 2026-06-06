import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, DIFFICULTY_LABELS, formatDate } from "@/lib/utils";
import type { Assignment } from "@/types/database";

interface AssignmentCardProps {
  assignment: Assignment & { course: { name: string; color: string } };
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  return (
    <Link
      href={`/assignments/${assignment.id}`}
      className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
    >
      <div className="flex items-center gap-3">
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: assignment.course?.color ?? "#6366f1" }}
        />
        <div>
          <p
            className={`text-sm font-medium ${
              assignment.status === "completed" ? "text-muted-foreground line-through" : ""
            }`}
          >
            {assignment.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {assignment.course?.name} · {assignment.estimated_minutes}分 ·{" "}
            {formatDate(assignment.due_date, "M/d")}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline">{DIFFICULTY_LABELS[assignment.difficulty]}</Badge>
        <Badge variant={assignment.status === "completed" ? "success" : "outline"}>
          {STATUS_LABELS[assignment.status]}
        </Badge>
      </div>
    </Link>
  );
}
