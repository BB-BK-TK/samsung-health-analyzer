# Interpretation Engine (Phase 3)

Rule-based interpretation layer for astrology and saju. Content is separated from UI and stored in structured modules so it can later be moved to a DB.

## Layout

- **`lib/interpretation/`** — interpretation engine
  - **`astrology-content.ts`** — per-sign content (personality, strengths, cautions, domain guidance), period tones
  - **`astrology-interpreter.ts`** — maps raw period data + sign content → rich interpretation (facts, domain cards, personality, strengths, cautions)
  - **`compatibility-content.ts`** — element/modality pairing rules (attraction, communication, caution)
  - **`compatibility-interpreter.ts`** — given two signs + metadata → score, summary, attraction/communication/caution patterns
  - **`saju-content.ts`** — element meanings (dominant/deficient), day-master domain tendencies (relationships, work, money, health)
  - **`saju-interpreter.ts`** — maps raw saju → day master + element balance + internal balance summary + practical advice + domain cards
  - **`index.ts`** — barrel exports

- **`lib/interpretation-layer.ts`** — Layer 2 entry: calls the above interpreters and returns `InterpretationResult` for the presentation layer.

## Rule logic

### Astrology

1. **Sign content**  
   Each of the 12 signs has:
   - `personality` (one paragraph)
   - `strengths[]`, `cautions[]`
   - `domainGuidance`: fixed copy for love, career, money, health (not templated per score; guidance is sign-based).

2. **Period tone**  
   `PERIOD_TONE` maps period key (daily, weekly, monthly, yearly, lifetime) to `{ intro, suffix }` used when building the interpreted summary (e.g. “오늘은” vs “이번 주는”).

3. **Domain cards**  
   For each period, domain cards are built from:
   - Raw scores/status from the calculator
   - Sign’s `domainGuidance` for that domain (love/career/money/health)
   - Summary = status + short guidance so love/career/money/health read differently.

4. **Compatibility (when two signs are available)**  
   - Element pairing: same element → +1 score, fire–air / earth–water → +0.5, else 0.
   - Modality: same → “리듬이 맞음” note; different → “리듬/우선순위 차이” caution.
   - Output: score, summary, strengths, challenges, `attractionPattern`, `communicationPattern`, `cautionAreas`.

### Saju

1. **Day master (일간)**  
   Uses existing `ilganInfo` from the calculator (상징, 장점, 단점, 성격). No new rule logic; interpreter only structures it.

2. **Five elements**  
   - **Dominant (과다)**  
     From `saju-content`: `ELEMENT_MEANINGS[element].dominantMeaning` (or raw excess meaning).
   - **Deficient (부족)**  
     From `saju-content`: `ELEMENT_MEANINGS[element].deficientMeaning` (or raw deficient meaning).
   - **Internal balance summary**  
     One paragraph combining dominant/deficient or “고르게 분포” when neither applies.

3. **Practical advice**  
   One sentence: “강한 X 기운은 조절, 부족한 Y 기운은 보강” or “균형 유지”.

4. **Domain-specific reading**  
   `DAY_MASTER_DOMAIN_TENDENCY[ilgan]` gives fixed copy for:
   - relationships
   - work
   - money
   - health  
   Used for saju domain cards (relationships, work, money, health) and interpretation facts.

## Content structure (DB-ready)

- **Astrology**
  - `SIGN_INTERPRETATION`: array of `SignInterpretationContent` (signKey, element, modality, personality, strengths, cautions, domainGuidance).
  - `PERIOD_TONE`: record of period key → `{ intro, suffix }`.
  - Compatibility: `ELEMENT_PAIRING` (same, fire_air, earth_water, other), `MODALITY_NOTE` (same, different).

- **Saju**
  - `ELEMENT_MEANINGS`: map of element key → `{ label, dominantMeaning, deficientMeaning, balanceNote }`.
  - `DAY_MASTER_DOMAIN_TENDENCY`: map of 일간 (갑~계) → `{ relationships, work, money, health }`.

All of these can be replaced by DB lookups later without changing interpreter logic (interpreters would take “content” as an argument or from a service).

## Extension points

1. **New sign or language**  
   Add or edit entries in `SIGN_INTERPRETATION` (or DB). No code change in the interpreter.

2. **Richer period tone**  
   Extend `PERIOD_TONE` or add templates (e.g. by period + energy) and use them in `astrology-interpreter.ts` when building `interpretedSummary`.

3. **Compatibility**  
   When the app has “compare with another sign” (or second user), call `interpretCompatibility(sign1, sign2, meta1, meta2)` and attach the result to the view model. Compatibility is already part of the result schema (`attractionPattern`, `communicationPattern`, `cautionAreas`).

4. **More elements or day masters**  
   Extend `ELEMENT_MEANINGS` and `DAY_MASTER_DOMAIN_TENDENCY` (or DB). Interpreters already branch on presence of content.

5. **LLM (Phase 4)**  
   Inputs to the LLM layer can be the current `styleReadyText` and the structured interpretation (e.g. `interpretationFacts`, `domainCards`). Content in `*-content.ts` can stay as the source of “what to say”; LLM can rewrite tone/style only.

## Determinism and explainability

- All outputs are deterministic for the same inputs (birth date/time, period).
- No randomness in the interpretation layer; randomness stays in the calculation layer (e.g. seeded engine).
- Rules are explicit (element pairing, modality, sign → guidance, 일간 → domain tendency), so every line of copy can be traced back to a rule or content entry.
