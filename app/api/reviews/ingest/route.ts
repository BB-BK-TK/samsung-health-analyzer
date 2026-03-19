import { getSupabaseAdmin } from "@/lib/supabase";
import {
  bootstrapReviewProviders,
  getReviewSourceProvider,
  normalizeSourceReview,
  type ReviewFetchOptions,
  type ReviewSourceAppRef,
} from "@/lib/reviews";

type IngestRequest = {
  source?: "google_play";
  appId: string;
  appName?: string;
  startDate?: string; // ISO
  endDate?: string; // ISO
  limit?: number;
  language?: string;
  country?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as IngestRequest;
    const source = body.source ?? "google_play";
    if (source !== "google_play") {
      return Response.json({ ok: false, error: "INVALID_SOURCE" }, { status: 400 });
    }
    if (!body.appId?.trim()) {
      return Response.json({ ok: false, error: "INVALID_REQUEST", message: "appId required" }, { status: 400 });
    }

    const app: ReviewSourceAppRef = {
      source,
      appId: body.appId.trim(),
      appName: body.appName?.trim() ? body.appName.trim() : undefined,
    };

    const options: ReviewFetchOptions = {
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      limit: body.limit,
      language: body.language,
      country: body.country,
    };

    bootstrapReviewProviders();
    const provider = getReviewSourceProvider(source);
    const sourceReviews = await provider.fetchReviews(app, options);
    const normalized = sourceReviews.map((r) => normalizeSourceReview(app, r)).filter((r) => r.text.length > 0);

    const supabase = getSupabaseAdmin();

    // Store raw payloads (auditing/debugging)
    if (sourceReviews.length) {
      const rawRows = sourceReviews.map((r) => ({
        source: r.source,
        app_id: app.appId,
        source_review_id: r.sourceReviewId,
        reviewed_at: r.reviewedAt.toISOString(),
        payload: r.raw,
      }));

      const rawUpsert = await supabase.from("reviews_raw").upsert(rawRows, {
        onConflict: "source,source_review_id",
      });
      if (rawUpsert.error) {
        return Response.json(
          { ok: false, error: "DB_ERROR", message: rawUpsert.error.message, hint: "Check if reviews_raw table exists" },
          { status: 500 }
        );
      }
    }

    // Store normalized rows (analytics)
    if (normalized.length) {
      const normRows = normalized.map((r) => ({
        source: r.source,
        app_id: r.appId,
        source_review_id: r.sourceReviewId,
        rating: r.rating,
        title: r.title,
        text: r.text,
        language: r.language,
        author_name: r.authorName,
        reviewed_at: r.reviewedAt,
      }));

      const normUpsert = await supabase.from("reviews_normalized").upsert(normRows, {
        onConflict: "source,source_review_id",
      });
      if (normUpsert.error) {
        return Response.json(
          {
            ok: false,
            error: "DB_ERROR",
            message: normUpsert.error.message,
            hint: "Check if reviews_normalized table exists",
          },
          { status: 500 }
        );
      }
    }

    return Response.json({
      ok: true,
      source,
      appId: app.appId,
      fetched: sourceReviews.length,
      storedNormalized: normalized.length,
    });
  } catch (e) {
    const err = e instanceof Error ? e : new Error("Unknown error");
    return Response.json({ ok: false, error: "INGEST_FAILED", message: err.message }, { status: 502 });
  }
}

