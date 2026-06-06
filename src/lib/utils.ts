import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, startOfWeek, endOfWeek, isToday, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import type { AcademicStanding, AssignmentStatus, DifficultyLevel } from "@/types/database";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt = "M月d日(E)"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, fmt, { locale: ja });
}

export function todayString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function getWeekRange(): { start: string; end: string } {
  const now = new Date();
  return {
    start: format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"),
    end: format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"),
  };
}

export function isDueToday(dueDate: string): boolean {
  return isToday(parseISO(dueDate));
}

export const STATUS_LABELS: Record<AssignmentStatus, string> = {
  not_started: "未着手",
  in_progress: "進行中",
  completed: "完了",
};

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  easy: "易",
  medium: "中",
  hard: "難",
};

export const STANDING_LABELS: Record<AcademicStanding, string> = {
  good_standing: "Good Standing",
  needs_attention: "Needs Attention",
  probation: "Probation",
};

export const COURSE_TYPE_LABELS = {
  required: "必修",
  elective: "選択",
} as const;

export function calculateGPA(completionRate: number): number {
  // 簡易GPA: 完了率を4.0満点に換算（将来AI評価に置き換え可能）
  return Math.round((completionRate / 100) * 4.0 * 100) / 100;
}

export function determineStanding(weeklyRate: number): AcademicStanding {
  if (weeklyRate >= 80) return "good_standing";
  if (weeklyRate >= 50) return "needs_attention";
  return "probation";
}
