/**
 * Phase 4: AI API — synthesis and style rewrite.
 * POST body: { action: "synthesis" | "style", payload: SynthesisInput | StyleRewriteInput }
 * Returns JSON: { ok: true, data, promptVersion } or { ok: false, error, message? }
 */

import type { AIApiRequest, AIApiResponse, AIApiErrorResponse, SynthesisOutput } from "@/types/ai-types";
import { runSynthesis, runStyleRewrite } from "@/lib/ai";

/** Simple in-memory cache: key -> { data, expires }. TTL 5 min. */
const cache = new Map<string, { data: SynthesisOutput; expires: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function cacheKey(action: string, payload: unknown): string {
  return `${action}:${JSON.stringify(payload)}`;
}

function getCached(key: string): SynthesisOutput | null {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expires) {
    if (entry) cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: SynthesisOutput): void {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AIApiRequest;
    const { action, payload } = body;

    if (!action || !payload) {
      return Response.json(
        { ok: false, error: "INVALID_REQUEST", message: "action and payload required" } satisfies AIApiErrorResponse,
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey?.trim()) {
      return Response.json(
        { ok: false, error: "AI_UNAVAILABLE", message: "OPENAI_API_KEY not configured" } satisfies AIApiErrorResponse,
        { status: 503 }
      );
    }

    if (action === "synthesis") {
      const key = cacheKey("synthesis", payload);
      const cached = getCached(key);
      if (cached) {
        return Response.json({
          ok: true,
          data: cached,
          promptVersion: "v1",
        } satisfies AIApiResponse);
      }
      const result = await runSynthesis(payload, apiKey);
      if (!result) {
        return Response.json(
          { ok: false, error: "PARSE_ERROR", message: "Synthesis failed or invalid response" } satisfies AIApiErrorResponse,
          { status: 502 }
        );
      }
      setCache(key, result.data);
      return Response.json({
        ok: true,
        data: result.data,
        promptVersion: result.promptVersion,
      } satisfies AIApiResponse);
    }

    if (action === "style") {
      const key = cacheKey("style", payload);
      const cached = getCached(key);
      if (cached) {
        return Response.json({
          ok: true,
          data: cached,
          promptVersion: "v1",
        } satisfies AIApiResponse);
      }
      const result = await runStyleRewrite(payload, apiKey);
      if (!result) {
        return Response.json(
          { ok: false, error: "PARSE_ERROR", message: "Style rewrite failed or invalid response" } satisfies AIApiErrorResponse,
          { status: 502 }
        );
      }
      setCache(key, result.data);
      return Response.json({
        ok: true,
        data: result.data,
        promptVersion: result.promptVersion,
      } satisfies AIApiResponse);
    }

    return Response.json(
      { ok: false, error: "INVALID_REQUEST", message: "action must be synthesis or style" } satisfies AIApiErrorResponse,
      { status: 400 }
    );
  } catch (e) {
    const err = e instanceof Error ? e : new Error("Unknown error");
    const isRateLimit = err.message.includes("RATE_LIMIT");
    const message = isRateLimit
      ? "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요."
      : err.message;
    return Response.json(
      {
        ok: false,
        error: isRateLimit ? "RATE_LIMIT" : "AI_UNAVAILABLE",
        message,
      } satisfies AIApiErrorResponse,
      { status: isRateLimit ? 429 : 502 }
    );
  }
}
