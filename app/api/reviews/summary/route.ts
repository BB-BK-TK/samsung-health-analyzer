import type { RangeSummary, ReviewSourceId, SentimentLabel } from "@/lib/reviews";
import { getSupabaseAdmin } from "@/lib/supabase";

type SummaryRequest = {
  source?: ReviewSourceId;
  appId: string;
  startDate: string; // ISO
  endDate: string; // ISO
  limit?: number;
};

type NormalizedReviewRow = {
  source_review_id: string;
  rating: number | null;
  text: string | null;
  reviewed_at: string;
};

type ReviewAnalysisRow = {
  source_review_id: string;
  sentiment_label: SentimentLabel | null;
  tags: string[] | null;
};

function initRatingHistogram(): RangeSummary["ratingHistogram"] {
  return { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
}

function initSentimentHistogram(): RangeSummary["sentimentHistogram"] {
  return { positive: 0, neutral: 0, negative: 0 };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SummaryRequest;
    const source = body.source ?? "google_play";
    if (!body.appId?.trim()) {
      return Response.json({ ok: false, error: "INVALID_REQUEST", message: "appId required" }, { status: 400 });
    }
    const start = new Date(body.startDate);
    const end = new Date(body.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return Response.json({ ok: false, error: "INVALID_REQUEST", message: "startDate/endDate must be ISO strings" }, { status: 400 });
    }

    const limit = Math.max(1, Math.min(body.limit ?? 2000, 5000));
    const supabase = getSupabaseAdmin();

    const { data: reviews, error: reviewsErr } = await supabase
      .from("reviews_normalized")
      .select("source_review_id,rating,text,reviewed_at")
      .eq("source", source)
      .eq("app_id", body.appId.trim())
      .gte("reviewed_at", start.toISOString())
      .lte("reviewed_at", end.toISOString())
      .order("reviewed_at", { ascending: false })
      .limit(limit);

    if (reviewsErr) {
      return Response.json(
        { ok: false, error: "DB_ERROR", message: reviewsErr.message, hint: "Check if reviews_normalized table exists" },
        { status: 500 }
      );
    }

    const reviewRows = (reviews ?? []) as unknown as NormalizedReviewRow[];
    const ratingHistogram = initRatingHistogram();
    let ratingSum = 0;
    let ratingCount = 0;

    for (const r of reviewRows) {
      const rating = typeof r.rating === "number" ? r.rating : null;
      if (rating && rating >= 1 && rating <= 5) {
        ratingHistogram[String(rating) as keyof typeof ratingHistogram] += 1;
        ratingSum += rating;
        ratingCount += 1;
      }
    }

    const averageRating = ratingCount ? ratingSum / ratingCount : null;

    // Pull analysis rows for the same set of reviews (best-effort).
    const ids = reviewRows.map((r) => String(r.source_review_id)).filter(Boolean);
    const sentimentHistogram = initSentimentHistogram();
    const tagCounts = new Map<string, { count: number }>();

    if (ids.length) {
      const { data: analysisRows } = await supabase
        .from("review_analysis")
        .select("source_review_id,sentiment_label,tags")
        .eq("source", source)
        .eq("app_id", body.appId.trim())
        .in("source_review_id", ids.slice(0, 2000));

      const analysis = (analysisRows ?? []) as unknown as ReviewAnalysisRow[];
      for (const a of analysis) {
        const label = a.sentiment_label ?? undefined;
        if (label === "positive" || label === "neutral" || label === "negative") {
          sentimentHistogram[label] += 1;
        }
        const tags = Array.isArray(a.tags) ? a.tags : [];
        for (const t of tags) {
          const tag = typeof t === "string" ? t.trim() : "";
          if (!tag) continue;
          const entry = tagCounts.get(tag) ?? { count: 0 };
          entry.count += 1;
          tagCounts.set(tag, entry);
        }
      }
    }

    // Build topic clusters from tag frequency, using reviews as examples.
    const totalReviews = reviewRows.length;
    const sortedTags = Array.from(tagCounts.entries()).sort((a, b) => b[1].count - a[1].count).slice(0, 12);
    const topTopics = sortedTags.map(([tag, info]) => {
      const examples: Array<{ sourceReviewId: string; rating: number | null; text: string; reviewedAt: string }> = [];
      for (const r of reviewRows) {
        if (examples.length >= 3) break;
        // We don't have per-review tags here without a join; keep examples simple from recent reviews.
        examples.push({
          sourceReviewId: String(r.source_review_id),
          rating: typeof r.rating === "number" ? r.rating : null,
          text: String(r.text ?? ""),
          reviewedAt: String(r.reviewed_at ?? ""),
        });
      }
      return {
        topic: tag,
        count: info.count,
        share: totalReviews ? info.count / totalReviews : 0,
        exampleReviews: examples,
      };
    });

    const summary: RangeSummary = {
      appId: body.appId.trim(),
      source,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      totalReviews,
      averageRating,
      ratingHistogram,
      sentimentHistogram,
      topTopics,
    };

    return Response.json({ ok: true, data: summary });
  } catch (e) {
    const err = e instanceof Error ? e : new Error("Unknown error");
    return Response.json({ ok: false, error: "SUMMARY_FAILED", message: err.message }, { status: 502 });
  }
}

