"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAssignment } from "@/lib/actions/assignments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { todayString } from "@/lib/utils";
import type { Course, DifficultyLevel, RecurrenceType } from "@/types/database";

interface NewAssignmentFormProps {
  courses: Course[];
}

export function NewAssignmentForm({ courses }: NewAssignmentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    try {
      await createAssignment({
        course_id: form.get("course_id") as string,
        title: form.get("title") as string,
        description: (form.get("description") as string) || undefined,
        due_date: form.get("due_date") as string,
        estimated_minutes: Number(form.get("estimated_minutes")),
        difficulty: form.get("difficulty") as DifficultyLevel,
        recurrence: form.get("recurrence") as RecurrenceType,
      });
      router.push("/assignments");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium">科目</label>
        <select
          name="course_id"
          required
          className="flex h-10 w-full rounded-md border border-border bg-card px-3 text-sm"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">タイトル</label>
        <Input name="title" required placeholder="TOEFL単語 20分" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">説明（任意）</label>
        <Textarea name="description" placeholder="課題の詳細" rows={2} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">締切</label>
          <Input name="due_date" type="date" required defaultValue={todayString()} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">想定時間（分）</label>
          <Input name="estimated_minutes" type="number" required defaultValue={20} min={5} max={60} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">難易度</label>
          <select
            name="difficulty"
            className="flex h-10 w-full rounded-md border border-border bg-card px-3 text-sm"
            defaultValue="medium"
          >
            <option value="easy">易</option>
            <option value="medium">中</option>
            <option value="hard">難</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">繰り返し</label>
          <select
            name="recurrence"
            className="flex h-10 w-full rounded-md border border-border bg-card px-3 text-sm"
            defaultValue="none"
          >
            <option value="none">なし</option>
            <option value="daily">毎日</option>
            <option value="weekly">毎週</option>
          </select>
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "作成中..." : "課題を作成"}
      </Button>
    </form>
  );
}
