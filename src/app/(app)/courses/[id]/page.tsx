import { notFound } from "next/navigation";
import { getCourse } from "@/lib/actions/courses";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { COURSE_TYPE_LABELS } from "@/lib/utils";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getCourse(id);
  if (!course) notFound();

  const supabase = await createClient();
  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, title, status, due_date, estimated_minutes")
    .eq("course_id", id)
    .order("due_date", { ascending: false })
    .limit(10);

  type AssignmentSummary = {
    id: string;
    title: string;
    status: string;
    due_date: string;
    estimated_minutes: number;
  };

  const items = (assignments ?? []) as AssignmentSummary[];
  const completed = items.filter((a) => a.status === "completed").length;
  const total = items.length;
  const progressRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: course.color }}
          />
          <Badge variant="outline">{COURSE_TYPE_LABELS[course.course_type]}</Badge>
        </div>
        <h1 className="text-xl font-semibold">{course.name}</h1>
        {course.description && (
          <p className="mt-1 text-sm text-muted-foreground">{course.description}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>学習目的</CardTitle>
          </CardHeader>
          <p className="text-sm text-muted-foreground">
            {course.learning_goal ?? "未設定"}
          </p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>進捗</CardTitle>
          </CardHeader>
          <p className="text-2xl font-semibold">{progressRate}%</p>
          <p className="text-xs text-muted-foreground">
            {completed}/{total} 課題完了
          </p>
        </Card>
      </div>

      {course.syllabus && (
        <Card>
          <CardHeader>
            <CardTitle>シラバス</CardTitle>
          </CardHeader>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {course.syllabus}
          </p>
        </Card>
      )}

      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>最近の課題</CardTitle>
          </CardHeader>
          <ul className="space-y-2">
            {items.map((a) => (
              <li key={a.id} className="flex items-center justify-between text-sm">
                <span
                  className={
                    a.status === "completed" ? "text-muted-foreground line-through" : ""
                  }
                >
                  {a.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {a.estimated_minutes}分
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
