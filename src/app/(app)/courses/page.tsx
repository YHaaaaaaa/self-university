// src/app/(app)/courses/page.tsx
import { getCourses } from "@/lib/actions/courses";
import { CourseCard } from "@/components/courses/course-card";
import { NewCourseForm } from "@/components/courses/new-course-form";

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">科目</h1>
        <p className="text-sm text-muted-foreground">履修科目の管理</p>
      </div>

      {/* 新規追加フォームの配置 */}
      <NewCourseForm />

      {courses && courses.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          科目が登録されていません。新しい科目を追加してください。
        </p>
      )}
    </div>
  );
}