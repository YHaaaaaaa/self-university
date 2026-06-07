// src/components/courses/new-course-form.tsx
"use client";

import { useState } from "react";
import { createCourse } from "@/lib/actions/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CourseType } from "@/types/database";

export function NewCourseForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    try {
      await createCourse({
        name: formData.get("name") as string,
        course_type: (formData.get("course_type") as CourseType) || "elective",
        learning_goal: formData.get("learning_goal") as string,
        min_daily_minutes: Number(formData.get("min_daily_minutes")) || 15,
        color: "#475569", // デフォルトの落ち着いた色 (slate-600)
      });
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      alert("科目の追加に失敗しました。");
    } finally {
      setIsPending(false);
    }
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="mb-6 bg-slate-900 text-white">
        ＋ 新しい科目を追加
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold">新規科目の登録</h3>
      
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">科目名 <span className="text-destructive">*</span></label>
        <Input name="name" required placeholder="例: 欧州政治研究" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">必修 / 選択</label>
          <select 
            name="course_type" 
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="required">必修</option>
            <option value="elective">選択</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">1日の最低目標時間(分)</label>
          <Input name="min_daily_minutes" type="number" defaultValue="15" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted-foreground">学習目的・シラバス</label>
        <Textarea name="learning_goal" placeholder="例: EUタクソノミーとエネルギー政策の理解を深める" rows={2} />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "追加中..." : "科目を追加する"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
          キャンセル
        </Button>
      </div>
    </form>
  );
}