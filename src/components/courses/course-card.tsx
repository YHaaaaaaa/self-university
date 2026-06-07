// src/components/courses/course-card.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { COURSE_TYPE_LABELS } from "@/lib/utils";
import type { Course } from "@/types/database";
import { deleteCourse } from "@/lib/actions/courses";
import { createClient } from "@/lib/supabase/client";
import { evaluateSubmission } from "@/lib/actions/ai"; // 👈 AI機能をインポート

export function CourseCard({ course }: { course: Course }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showQuickSubmit, setShowQuickSubmit] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");
  const [submissionText, setSubmissionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function loadAssignments() {
      const { data } = await supabase
        .from("assignments")
        .select("*")
        .eq("course_id", course.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      
      if (data && data.length > 0) {
        setAssignments(data);
        setSelectedAssignmentId(data[0].id);
      }
    }
    loadAssignments();
  }, [course.id, supabase]);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault(); 
    if (!window.confirm(`「${course.name}」を削除してもよろしいですか？\n※関連する課題も削除されます`)) return;
    
    setIsDeleting(true);
    try {
      await deleteCourse(course.id);
    } catch (error) {
      alert("削除に失敗しました");
      setIsDeleting(false);
    }
  }

  // 📝 ここがAI連動に進化しました
  async function handleQuickSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAssignmentId || !submissionText.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      const selectedAssignment = assignments.find(a => a.id === selectedAssignmentId);

      // ⚡️ 1. AI教授に評価を依頼する（数秒かかります）
      const aiResult = await evaluateSubmission(
        submissionText, 
        course.name, 
        selectedAssignment?.title || "課題"
      );

      // 2. 評価結果を含めてデータベースに保存
      const { error: subError } = await supabase
        .from("submissions")
        .insert({
          assignment_id: selectedAssignmentId,
          user_id: user.id,
          content: submissionText,
          score: aiResult.score, // AIの採点
          feedback: aiResult.feedback, // AIのコメント
          submitted_at: new Date().toISOString()
        });

      if (subError) throw subError;

      const { error: asgError } = await supabase
        .from("assignments")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", selectedAssignmentId);

      if (asgError) throw asgError;

      // 🎉 評価結果を画面にお知らせ
      alert(`🎓 提出完了！\n\n【成績】 GPA: ${aiResult.score} / 4.0\n\n【教授からのフィードバック】\n${aiResult.feedback}`);
      
      setSubmissionText("");
      setShowQuickSubmit(false);
      setAssignments(assignments.filter(a => a.id !== selectedAssignmentId));
    } catch (error) {
      console.error(error);
      alert("提出に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={`group relative overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-slate-400 ${isDeleting ? 'pointer-events-none opacity-50' : ''}`}>
      <div className="p-5">
        <Link href={`/courses/${course.id}`} className="block">
          <div className="flex items-start justify-between pr-12">
            <div className="flex items-center gap-3">
              <div
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: course.color || "#475569" }}
              />
              <div>
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-slate-800">{course.name}</h3>
                {course.learning_goal && (
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {course.learning_goal}
                  </p>
                )}
              </div>
            </div>
            <Badge variant="outline" className="ml-2 shrink-0">{COURSE_TYPE_LABELS[course.course_type]}</Badge>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span>最低 {course.min_daily_minutes}分/日</span>
            {assignments.length > 0 && (
              <span className="text-amber-600 font-medium">未提出課題: {assignments.length}件</span>
            )}
          </div>
        </Link>

        {assignments.length > 0 && (
          <div className="mt-4 pt-3 border-t border-dashed border-border flex justify-end">
            <Button 
              size="sm" 
              variant={showQuickSubmit ? "ghost" : "outline"}
              className="text-xs h-7 px-3"
              onClick={() => setShowQuickSubmit(!showQuickSubmit)}
            >
              {showQuickSubmit ? "閉じる" : "⚡️ その場ですぐ提出"}
            </Button>
          </div>
        )}

        {showQuickSubmit && assignments.length > 0 && (
          <form onSubmit={handleQuickSubmit} className="mt-3 p-3 bg-slate-50 rounded-md border border-slate-200 space-y-3 animate-in fade-in duration-200">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">提出する課題を選択</label>
              <select 
                value={selectedAssignmentId} 
                onChange={(e) => setSelectedAssignmentId(e.target.value)}
                className="w-full text-xs bg-white rounded border border-input p-1.5 focus:outline-none"
              >
                {assignments.map((asg) => (
                  <option key={asg.id} value={asg.id}>
                    {asg.title} ({asg.estimated_minutes || 15}分)
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">提出内容（300字メモ・読書感想など）</label>
              <Textarea 
                placeholder="気付き、疑問、学んだ内容などを入力" 
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                rows={2}
                className="text-xs bg-white p-2 min-h-[60px]"
                required
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" size="sm" className="h-7 text-xs bg-slate-900 text-white hover:bg-slate-800" disabled={isSubmitting}>
                {isSubmitting ? "教授が評価中..." : "提出を完了する"}
              </Button>
            </div>
          </form>
        )}
      </div>
      
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