"use server";

import { createClient } from "@/lib/supabase/server";
import { todayString, getWeekRange, calculateGPA, determineStanding } from "@/lib/utils";
import type { DashboardStats } from "@/types/database";

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const today = todayString();
  const { start, end } = getWeekRange();

  const { data: todayAssignments } = await supabase
    .from("assignments")
    .select("status")
    .eq("due_date", today);

  const { data: weekAssignments } = await supabase
    .from("assignments")
    .select("status")
    .gte("due_date", start)
    .lte("due_date", end);

  const todayTotal = todayAssignments?.length ?? 0;
  const todayCompleted =
    todayAssignments?.filter((a) => a.status === "completed").length ?? 0;

  const weekTotal = weekAssignments?.length ?? 0;
  const weekCompleted =
    weekAssignments?.filter((a) => a.status === "completed").length ?? 0;
  const weeklyRate =
    weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 100;

  const gpa = calculateGPA(weeklyRate);
  const standing = determineStanding(weeklyRate);

  // academic_status を更新
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase
      .from("academic_status")
      .upsert({
        user_id: user.id,
        gpa,
        weekly_completion_rate: weeklyRate,
        standing,
        total_completed: weekCompleted,
        total_assigned: weekTotal,
        last_evaluated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
  }

  return { todayTotal, todayCompleted, weeklyRate, gpa, standing };
}

export async function getAcademicStatus() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("academic_status")
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data;
}
