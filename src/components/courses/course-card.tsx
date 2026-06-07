// src/components/courses/course-card.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { COURSE_TYPE_LABELS } from "@/lib/utils";
import type { Course } from "@/types/database";
import { deleteCourse } from "@/lib/actions/courses";

export function CourseCard({ course }: { course: Course }) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`「${course.name}」を削除してもよろしいですか？\n※関連する課題も削除されます`)) return;
    
    setIsDeleting(true);
    try {
      await deleteCourse(course.id);
    } catch (error) {
      alert("削除に失敗しました");
      setIsDeleting(false);
    }
  }

  return (
    <div className={`group relative overflow-hidden rounded-lg border border-border bg-card transition-colors hover:bg-accent ${isDeleting ? 'pointer-events-none opacity-50' : ''}`}>
      <Link href={`/courses/${course.id}`} className="block p-5">
        <div className="flex items-start justify-between pr-8">
          <div className="flex items-center gap-3">
            <div
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: course.color || "#475569" }}
            />
            <div>
              <h3 className="text-sm font-semibold">{course.name}</h3>
              {course.learning_goal && (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
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
      
      {/* ホバー時のみ現れる削除ボタン */}
      <button
        onClick={handleDelete}
        className="absolute right-4 top-4 z-10 text-xs font-medium text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
        aria-label="削除"
      >
        削除
      </button>
    </div>
  );
}