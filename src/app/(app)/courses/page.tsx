import { getCourses } from "@/lib/actions/courses";
import { CourseCard } from "@/components/courses/course-card";

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">科目</h1>
        <p className="text-sm text-muted-foreground">履修科目の管理</p>
      </div>

      {courses && courses.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          科目が登録されていません。新規登録時にデフォルト科目が自動作成されます。
        </p>
      )}
    </div>
  );
}
