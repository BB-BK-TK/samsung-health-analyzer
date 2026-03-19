import { chatCompletion } from "@/lib/ai/llm";
import type { NormalizedReview, ReviewAnalysisResult, SentimentLabel } from "@/lib/reviews/types";

export const REVIEW_ANALYSIS_PROMPT_VERSION = "v1";

type LlmReviewInput = Pick<NormalizedReview, "sourceReviewId" | "rating" | "text" | "reviewedAt">;

type LlmReviewOutput = {
  sourceReviewId: string;
  sentiment: { label: SentimentLabel; confidence: number };
  tags: string[];
  category?: string | null;
  urgency?: "low" | "medium" | "high" | null;
};

function stripCodeFences(s: string): string {
  const trimmed = s.trim();
  if (!trimmed.startsWith("```")) return trimmed;
  return trimmed.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
}

function safeJsonParse<T>(s: string): T | null {
  try {
    return JSON.parse(stripCodeFences(s)) as T;
  } catch {
    return null;
  }
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function sanitizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((t) => (typeof t === "string" ? t.trim() : ""))
    .filter((t) => t.length > 0)
    .slice(0, 8);
}

export async function analyzeReviewsWithLLM(
  reviews: LlmReviewInput[],
  apiKey: string,
  options: { model?: string } = {}
): Promise<Map<string, ReviewAnalysisResult>> {
  const model = options.model ?? "gpt-4o-mini";
  const results = new Map<string, ReviewAnalysisResult>();

  // Keep batches small to control latency/cost and avoid token blowups on long reviews.
  const batchSize = 40;
  for (let i = 0; i < reviews.length; i += batchSize) {
    const batch = reviews.slice(i, i + batchSize).map((r) => ({
      sourceReviewId: r.sourceReviewId,
      rating: r.rating,
      reviewedAt: r.reviewedAt,
      text: (r.text ?? "").slice(0, 1200),
    }));

    const system = `You analyze Google Play app reviews for product insights.
Return ONLY valid JSON (no markdown) with this exact shape:
{"items":[{"sourceReviewId":"...","sentiment":{"label":"positive|neutral|negative","confidence":0.0},"tags":["tag1","tag2"],"category":"optional","urgency":"low|medium|high|null"}]}
Rules:
- Use sentiment based on the review text (rating is a weak hint).
- confidence must be between 0 and 1.
- tags: 2-6 short lowercase tags capturing what it's about (e.g. "sync","steps","battery","login","crash","ui","subscription").
- category: optional broad bucket like "bug","performance","ux","account","feature_request","data_accuracy","billing","connectivity".
- urgency: high when it looks like a severe bug/data loss/can't login/crash; otherwise medium/low.
`;

    const user = `Analyze these reviews:\n${JSON.stringify({ items: batch })}`;

    const completion = await chatCompletion(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { apiKey, model, maxTokens: 1800 }
    );

    if (!completion?.content) continue;
    const parsed = safeJsonParse<{ items?: LlmReviewOutput[] }>(completion.content);
    const items = parsed?.items;
    if (!Array.isArray(items)) continue;

    for (const item of items) {
      if (!item?.sourceReviewId) continue;
      const label = item?.sentiment?.label;
      if (label !== "positive" && label !== "neutral" && label !== "negative") continue;
      const confidence = clamp01(Number(item?.sentiment?.confidence ?? 0));
      results.set(item.sourceReviewId, {
        sentiment: { label, confidence },
        tags: sanitizeTags(item?.tags),
        category: typeof item?.category === "string" ? item.category : item?.category ?? null,
        urgency: item?.urgency ?? null,
      });
    }
  }

  return results;
}

