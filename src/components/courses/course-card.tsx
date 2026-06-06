import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { COURSE_TYPE_LABELS } from "@/lib/utils";
import type { Course } from "@/types/database";

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course.id}`}
      className="block rounded-lg border border-border bg-card p-5 transition-colors hover:bg-accent"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: course.color }}
          />
          <div>
            <h3 className="text-sm font-semibold">{course.name}</h3>
            {course.learning_goal && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {course.learning_goal}
              </p>
            )}
          </div>
        </div>
        <Badge variant="outline">{COURSE_TYPE_LABELS[course.course_type]}</Badge>
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span>最低 {course.min_daily_minutes}分/日</span>
      </div>
    </Link>
  );
}
