"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Course, CourseType } from "@/types/database";

export async function getCourses(): Promise<Course[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Course[];
}

export async function getCourse(id: string): Promise<Course | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Course;
}

export async function createCourse(formData: {
  name: string;
  description?: string;
  course_type: CourseType;
  learning_goal?: string;
  min_daily_minutes?: number;
  syllabus?: string;
  color?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("courses")
    .insert({ 
      ...formData, 
      user_id: user.id,
      is_active: true // これがないと一覧に表示されません
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/courses");
  return data;
}

export async function updateCourse(
  id: string,
  formData: Partial<{
    name: string;
    description: string;
    course_type: CourseType;
    learning_goal: string;
    min_daily_minutes: number;
    syllabus: string;
    color: string;
    is_active: boolean;
  }>
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("courses")
    .update(formData)
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/courses");
  revalidatePath(`/courses/${id}`);
}

export async function seedDefaultCourses() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { count } = await supabase
    .from("courses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (count && count > 0) return;

  const { error } = await supabase.rpc("seed_default_courses", {
    p_user_id: user.id,
  });

  if (error) throw error;
  revalidatePath("/courses");
  revalidatePath("/dashboard");
}

export async function deleteCourse(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // user_idも条件に含め、自分の科目のみ削除できるように保護します
  const { error } = await supabase
    .from("courses")
    .delete()
    .match({ id, user_id: user.id });

  if (error) throw error;
  
  revalidatePath("/courses");
  revalidatePath("/dashboard");
}