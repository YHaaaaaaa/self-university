import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubmissionForm } from "@/components/assignments/submission-form";
import { STATUS_LABELS, DIFFICULTY_LABELS, formatDate } from "@/lib/utils";
import type { Assignment, Course, Submission } from "@/types/database";

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("assignments")
    .select("*, course:courses(*), submissions(*)")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const assignment = data as Assignment & {
    course: Course;
    submissions: Submission[];
  };

  const isCompleted = assignment.status === "completed";

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: assignment.course?.color ?? "#6366f1" }}
          />
          <span className="text-sm text-muted-foreground">
            {assignment.course?.name}
          </span>
        </div>
        <h1 className="text-xl font-semibold">{assignment.title}</h1>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant={isCompleted ? "success" : "outline"}>
            {STATUS_LABELS[assignment.status]}
          </Badge>
          <Badge variant="outline">{DIFFICULTY_LABELS[assignment.difficulty]}</Badge>
          <span className="text-xs text-muted-foreground">
            {assignment.estimated_minutes}分 · 締切 {formatDate(assignment.due_date)}
          </span>
        </div>
      </div>

      {assignment.description && (
        <Card>
          <CardHeader>
            <CardTitle>説明</CardTitle>
          </CardHeader>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {assignment.description}
          </p>
        </Card>
      )}

      {!isCompleted && (
        <Card>
          <CardHeader>
            <CardTitle>提出</CardTitle>
          </CardHeader>
          <SubmissionForm assignmentId={assignment.id} />
        </Card>
      )}

      {assignment.submissions && assignment.submissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>提出履歴</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {assignment.submissions.map((sub) => (
              <div key={sub.id} className="rounded-md border border-border p-3">
                <p className="text-sm whitespace-pre-wrap">{sub.content}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDate(sub.submitted_at, "M/d HH:mm")}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
