# AI Prompts (Phase 4)

The app has two distinct AI functions: **interpretation synthesis** and **style rewrite**. Both use versioned prompts and structured JSON output. The LLM must not invent core reading data; it rewrites and synthesizes only from provided structured data.

---

## 1. Interpretation synthesis

**Purpose:** Turn structured reading data (astrology + saju) into a coherent, helpful interpretation in Korean.

**When used:** Optional; can be called once per result to produce an "approved" base interpretation. The app can also use the rule-based `styleReadyText` as the base and only run style rewrite.

**Input (structured):**

- `promptVersion`: string (e.g. `"v1"`)
- `period`: daily | weekly | monthly | yearly | lifetime
- `sign`: sign name (e.g. 물병자리)
- `signMeta`: element + modality (e.g. 공기·고정)
- `energySummary`: one-line energy/summary from engine
- `domains`: `{ love, career, money, health }` — short strings per domain
- `dayMasterSummary`: saju day master short description
- `elementBalanceNote`: saju element balance (e.g. dominant/deficient)
- `lucky` (optional): `{ color, number, time }`

**Output (JSON only):**

```json
{
  "heroQuote": "string",
  "integratedTheme": "string",
  "cautionSignal": "string",
  "dailyGuideline": "string",
  "lifetimeTheme": "string (optional)"
}
```

**Guardrails (in prompt):**

- Do not contradict the provided reading data.
- Do not fabricate birth facts or name specific people.
- Do not claim certainty (no "반드시", "확실히", "100%").
- Do not give medical, legal, or life-critical advice.
- Output only Korean; output only the JSON object (no markdown/code fences).

**Location:** `lib/ai/prompts.ts` — `buildSynthesisPrompt()`. Version: `PROMPT_VERSION` ("v1").

---

## 2. Style rewrite

**Purpose:** Rewrite an existing (approved) interpretation in a selected tone/style. Meaning and facts stay the same; only tone and wording change.

**When used:** When the user selects a style in the Style selector. The "approved" interpretation is the current rule-based `styleReadyText` (or a prior synthesis result if that flow is used).

**Input (structured):**

- `promptVersion`: string (e.g. `"v1"`)
- `style`: one of `warm_healing` | `best_friend` | `mystical_poetic` | `elegant_premium` | `direct_practical`
- `interpretation`: object with keys `heroQuote`, `integratedTheme`, `cautionSignal`, `dailyGuideline`, `lifetimeTheme` (optional)

**Output (JSON only):**

Same shape as synthesis output:

```json
{
  "heroQuote": "string",
  "integratedTheme": "string",
  "cautionSignal": "string",
  "dailyGuideline": "string",
  "lifetimeTheme": "string (optional)"
}
```

**Style descriptions (v1):**

| Style key           | Description (for model) |
|---------------------|--------------------------|
| warm_healing        | 따뜻하고 치유적인 말투. 위로와 공감, 희망을 주되 과장하지 말 것. |
| best_friend         | 친한 친구처럼 편하고 캐주얼. 친근한 반말/존댓말 혼용. 이모티콘 사용 금지. |
| mystical_poetic      | 신비롭고 시적인 표현. 은유와 리듬 유지, 데이터 내용은 변경하지 말 것. |
| elegant_premium     | 우아하고 프리미엄한 말투. 짧고 정제된 문장. |
| direct_practical    | 직설적·실용적. 핵심만 짧게, 행동에 도움이 되게. |

**Guardrails:** Same as synthesis (no contradiction, no fabricated facts, no certainty, no unsafe advice; Korean only; JSON only).

**Location:** `lib/ai/prompts.ts` — `buildStyleRewritePrompt()`. Version: `PROMPT_VERSION` ("v1").

---

## API

- **Endpoint:** `POST /api/ai`
- **Body:**  
  - Synthesis: `{ "action": "synthesis", "payload": SynthesisInput }`  
  - Style: `{ "action": "style", "payload": StyleRewriteInput }`
- **Success:** `{ "ok": true, "data": SynthesisOutput, "promptVersion": "v1" }`
- **Error:** `{ "ok": false, "error": "AI_UNAVAILABLE" | "PARSE_ERROR" | "RATE_LIMIT" | ... , "message": "..." }`
- **503** when `OPENAI_API_KEY` is not set (AI unavailable); client shows fallback and retry.

---

## Fallback when AI is unavailable

- If the API returns 503 or any error, the UI continues to show the **interpreted (rule-based) result** as source of truth.
- Style selector shows an error message (e.g. "AI를 사용할 수 없습니다. 원문을 표시합니다.") and a "다시 시도" (retry) button.
- No blank screens; the default UI works without any AI call.

---

## Versioning and editing

- Prompt version is in `lib/ai/prompts.ts`: `PROMPT_VERSION = "v1"`.
- To change behavior: edit the system/user strings in `buildSynthesisPrompt` and `buildStyleRewritePrompt`, and bump the version if you need to track variants.
- Expected JSON shape is enforced in `lib/ai/index.ts` (`validateSynthesisOutput`); keep it in sync with `SynthesisOutput` in `types/ai-types.ts`.
