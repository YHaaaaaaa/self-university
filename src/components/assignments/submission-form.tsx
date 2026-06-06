"use client";

import { useState } from "react";
import { submitAssignment } from "@/lib/actions/assignments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface SubmissionFormProps {
  assignmentId: string;
}

export function SubmissionForm({ assignmentId }: SubmissionFormProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      await submitAssignment(assignmentId, content);
      setContent("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="学習記録・感想・メモを入力（1分で提出）"
        rows={4}
        required
      />
      <Button type="submit" disabled={loading || !content.trim()}>
        {loading ? "提出中..." : "提出する"}
      </Button>
    </form>
  );
}
