export type CourseType = "required" | "elective";
export type AssignmentStatus = "not_started" | "in_progress" | "completed";
export type DifficultyLevel = "easy" | "medium" | "hard";
export type AcademicStanding = "good_standing" | "needs_attention" | "probation";
export type RecurrenceType = "none" | "daily" | "weekly";

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  course_type: CourseType;
  learning_goal: string | null;
  min_daily_minutes: number;
  syllabus: string | null;
  color: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  user_id: string;
  course_id: string;
  title: string;
  description: string | null;
  due_date: string;
  estimated_minutes: number;
  difficulty: DifficultyLevel;
  status: AssignmentStatus;
  recurrence: RecurrenceType;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  course?: Course;
  submissions?: Submission[];
}

export interface Submission {
  id: string;
  user_id: string;
  assignment_id: string;
  content: string;
  submitted_at: string;
  created_at: string;
}

export interface Progress {
  id: string;
  user_id: string;
  date: string;
  total_assignments: number;
  completed_assignments: number;
  completion_rate: number;
  total_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface AcademicStatus {
  id: string;
  user_id: string;
  standing: AcademicStanding;
  gpa: number;
  weekly_completion_rate: number;
  total_completed: number;
  total_assigned: number;
  last_evaluated_at: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  todayTotal: number;
  todayCompleted: number;
  weeklyRate: number;
  gpa: number;
  standing: AcademicStanding;
}
