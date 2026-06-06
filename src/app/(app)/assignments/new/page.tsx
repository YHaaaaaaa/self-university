import { getCourses } from "@/lib/actions/courses";
import { NewAssignmentForm } from "@/components/assignments/new-assignment-form";

export default async function NewAssignmentPage() {
  const courses = await getCourses();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">新規課題</h1>
        <p className="text-sm text-muted-foreground">
          15〜30分で完了できる小さな課題を作成
        </p>
      </div>

      {courses && courses.length > 0 ? (
        <NewAssignmentForm courses={courses} />
      ) : (
        <p className="text-sm text-muted-foreground">
          先に科目を登録してください。
        </p>
      )}
    </div>
  );
}
