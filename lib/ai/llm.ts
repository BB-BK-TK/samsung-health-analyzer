/**
 * Phase 4: LLM client (OpenAI-compatible).
 * Used only on the server (API route). No API key = no calls.
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chatCompletion(
  messages: ChatMessage[],
  options: { apiKey?: string; model?: string; maxTokens?: number } = {}
): Promise<{ content: string; finishReason: string } | null> {
  const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) return null;

  const model = options.model ?? "gpt-4o-mini";
  const maxTokens = options.maxTokens ?? 1024;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.4,
      }),
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error("RATE_LIMIT");
      throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    const finishReason = data.choices?.[0]?.finish_reason ?? "stop";
    if (!content) return null;
    return { content, finishReason };
  } catch (e) {
    throw e;
  }
}
