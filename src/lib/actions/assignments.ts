"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { todayString } from "@/lib/utils";
import type { Assignment, AssignmentStatus, Course, DifficultyLevel, RecurrenceType } from "@/types/database";

type AssignmentWithCourse = Assignment & { course: Course };

export async function getTodayAssignments(): Promise<AssignmentWithCourse[]> {
  const supabase = await createClient();
  const today = todayString();

  const { data, error } = await supabase
    .from("assignments")
    .select("*, course:courses(*)")
    .eq("due_date", today)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as AssignmentWithCourse[];
}

export async function getAssignmentsByDateRange(
  start: string,
  end: string
): Promise<AssignmentWithCourse[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("assignments")
    .select("*, course:courses(*)")
    .gte("due_date", start)
    .lte("due_date", end)
    .order("due_date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as AssignmentWithCourse[];
}

export async function getAllAssignments(): Promise<AssignmentWithCourse[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("assignments")
    .select("*, course:courses(*)")
    .order("due_date", { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data ?? []) as AssignmentWithCourse[];
}

export async function createAssignment(formData: {
  course_id: string;
  title: string;
  description?: string;
  due_date: string;
  estimated_minutes: number;
  difficulty: DifficultyLevel;
  recurrence: RecurrenceType;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("assignments")
    .insert({ ...formData, user_id: user.id })
    .select()
    .single();

  if (error) throw error;

  // 毎日繰り返しの場合、翌日分も自動生成
  if (formData.recurrence === "daily") {
    const tomorrow = new Date(formData.due_date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    await supabase.from("assignments").insert({
      ...formData,
      user_id: user.id,
      due_date: tomorrow.toISOString().split("T")[0],
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/assignments");
  return data;
}

export async function updateAssignmentStatus(
  id: string,
  status: AssignmentStatus
) {
  const supabase = await createClient();

  const updates: Record<string, unknown> = { status };
  if (status === "completed") {
    updates.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("assignments")
    .update(updates)
    .eq("id", id);

  if (error) throw error;

  // 毎日繰り返し課題の翌日分を生成
  if (status === "completed") {
    const { data: assignment } = await supabase
      .from("assignments")
      .select("*")
      .eq("id", id)
      .single();

    if (assignment?.recurrence === "daily") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      const { data: existing } = await supabase
        .from("assignments")
        .select("id")
        .eq("title", assignment.title)
        .eq("course_id", assignment.course_id)
        .eq("due_date", tomorrowStr)
        .maybeSingle();

      if (!existing) {
        await supabase.from("assignments").insert({
          user_id: assignment.user_id,
          course_id: assignment.course_id,
          title: assignment.title,
          description: assignment.description,
          due_date: tomorrowStr,
          estimated_minutes: assignment.estimated_minutes,
          difficulty: assignment.difficulty,
          recurrence: "daily",
        });
      }
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/assignments");
}

export async function submitAssignment(assignmentId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error: subError } = await supabase.from("submissions").insert({
    user_id: user.id,
    assignment_id: assignmentId,
    content,
  });

  if (subError) throw subError;

  await updateAssignmentStatus(assignmentId, "completed");
  revalidatePath("/dashboard");
  revalidatePath("/assignments");
}
