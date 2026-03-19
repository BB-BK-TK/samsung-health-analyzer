import { analyzeReviewsWithLLM, REVIEW_ANALYSIS_PROMPT_VERSION, type ReviewSourceId } from "@/lib/reviews";
import { getSupabaseAdmin } from "@/lib/supabase";

type AnalyzeRequest = {
  source?: ReviewSourceId;
  appId: string;
  startDate: string; // ISO
  endDate: string; // ISO
  limit?: number;
  model?: string;
};

type NormalizedReviewRow = {
  source_review_id: string;
  rating: number | null;
  text: string | null;
  reviewed_at: string;
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey?.trim()) {
      return Response.json({ ok: false, error: "AI_UNAVAILABLE", message: "OPENAI_API_KEY not configured" }, { status: 503 });
    }

    const body = (await request.json()) as AnalyzeRequest;
    const source = body.source ?? "google_play";
    if (!body.appId?.trim()) {
      return Response.json({ ok: false, error: "INVALID_REQUEST", message: "appId required" }, { status: 400 });
    }
    const start = new Date(body.startDate);
    const end = new Date(body.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return Response.json({ ok: false, error: "INVALID_REQUEST", message: "startDate/endDate must be ISO strings" }, { status: 400 });
    }

    const limit = Math.max(1, Math.min(body.limit ?? 800, 2000));
    const supabase = getSupabaseAdmin();

    const { data: reviews, error } = await supabase
      .from("reviews_normalized")
      .select("source_review_id,rating,text,reviewed_at")
      .eq("source", source)
      .eq("app_id", body.appId.trim())
      .gte("reviewed_at", start.toISOString())
      .lte("reviewed_at", end.toISOString())
      .order("reviewed_at", { ascending: false })
      .limit(limit);

    if (error) {
      return Response.json(
        { ok: false, error: "DB_ERROR", message: error.message, hint: "Check if reviews_normalized table exists" },
        { status: 500 }
      );
    }

    const rows = (reviews ?? []) as unknown as NormalizedReviewRow[];
    const inputs = rows.map((r) => ({
      sourceReviewId: String(r.source_review_id),
      rating: typeof r.rating === "number" ? r.rating : null,
      text: String(r.text ?? ""),
      reviewedAt: String(r.reviewed_at),
    }));

    const analysisMap = await analyzeReviewsWithLLM(inputs, apiKey, { model: body.model });

    const analyzedAt = new Date().toISOString();
    const upsertRows = inputs
      .map((r) => {
        const a = analysisMap.get(r.sourceReviewId);
        if (!a) return null;
        return {
          source,
          app_id: body.appId.trim(),
          source_review_id: r.sourceReviewId,
          analyzed_at: analyzedAt,
          sentiment_label: a.sentiment.label,
          sentiment_confidence: a.sentiment.confidence,
          tags: a.tags,
          category: a.category ?? null,
          urgency: a.urgency ?? null,
          model: body.model ?? "gpt-4o-mini",
          prompt_version: REVIEW_ANALYSIS_PROMPT_VERSION,
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));

    let stored = 0;
    if (upsertRows.length) {
      const upsert = await supabase.from("review_analysis").upsert(upsertRows, {
        onConflict: "source,source_review_id",
      });
      if (upsert.error) {
        return Response.json(
          { ok: false, error: "DB_ERROR", message: upsert.error.message, hint: "Check if review_analysis table exists" },
          { status: 500 }
        );
      }
      stored = upsertRows.length;
    }

    // Optional: record analysis run (safe to ignore if table absent)
    await supabase.from("analysis_runs").insert({
      source,
      app_id: body.appId.trim(),
      start_date: start.toISOString(),
      end_date: end.toISOString(),
      model: body.model ?? "gpt-4o-mini",
      prompt_version: REVIEW_ANALYSIS_PROMPT_VERSION,
      analyzed_at: analyzedAt,
      input_count: inputs.length,
      output_count: stored,
    });

    return Response.json({
      ok: true,
      source,
      appId: body.appId.trim(),
      inputCount: inputs.length,
      analyzedCount: analysisMap.size,
      storedCount: stored,
      analyzedAt,
      promptVersion: REVIEW_ANALYSIS_PROMPT_VERSION,
    });
  } catch (e) {
    const err = e instanceof Error ? e : new Error("Unknown error");
    const isRateLimit = err.message.includes("RATE_LIMIT");
    return Response.json(
      { ok: false, error: isRateLimit ? "RATE_LIMIT" : "ANALYSIS_FAILED", message: err.message },
      { status: isRateLimit ? 429 : 502 }
    );
  }
}

