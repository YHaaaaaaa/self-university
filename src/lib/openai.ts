/**
 * OpenAI API クライアント（将来のAI評価用）
 * MVP では未使用。構造のみ用意。
 */

export interface AIEvaluationRequest {
  assignmentTitle: string;
  courseName: string;
  submissionContent: string;
}

export interface AIEvaluationResult {
  score: number; // 0-100
  feedback: string;
  gradePoints: number; // 0-4.0
}

export async function evaluateSubmission(
  request: AIEvaluationRequest
): Promise<AIEvaluationResult | null> {
  // 将来実装: request を使って OpenAI API に評価リクエストを送信
  console.debug("[openai] evaluateSubmission called", request.assignmentTitle);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  // TODO: OpenAI API 連携を実装
  // const response = await fetch("https://api.openai.com/v1/chat/completions", ...);
  return null;
}
