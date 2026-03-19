# DB Schema Proposal (Phase 5)

A scalable, Supabase/Postgres-compatible data architecture for reading content, interpretation rules, styles, and generated outputs. Designed for migration from the current local JS/TS content without breaking the app.

---

## 1. Current State

| Area | Location | Format |
|------|----------|--------|
| Astrology sign content | `lib/interpretation/astrology-content.ts` | TS constants (`SIGN_INTERPRETATION`, `PERIOD_TONE`) |
| Compatibility rules | `lib/interpretation/compatibility-content.ts` | TS constants |
| Saju element / day-master content | `lib/interpretation/saju-content.ts` | TS constants |
| Style definitions | `components/style-selector.tsx` (`STYLE_OPTIONS`) | TS constant |
| AI prompt templates | `lib/ai/prompts.ts` | TS functions + strings |
| Raw calculation | In-memory only | `calculation-layer.ts` → no persistence |
| Interpreted result | In-memory only | `interpretation-layer.ts` → no persistence |
| AI-generated text | In-memory cache (API route) | 5-min TTL, not persisted |

---

## 2. Conceptual Entities

- **users** — Optional; for saved profiles and history. Can be anonymous at first.
- **birth_profiles** — Stored birth info (date, time, place, calendar type) linked to user or session.
- **reading_requests** — A single “run” of a reading (timestamp, profile id, period, style choice).
- **raw_chart_results** — Output of calculation layer (astrology + saju raw), JSONB.
- **interpreted_results** — Output of interpretation layer (facts, domain cards, summaries), JSONB.
- **compatibility_results** — Optional; stored when compatibility is computed (e.g. two profiles).
- **style_presets** — Style definitions (key, label, description) used for input and AI.
- **ai_prompt_templates** — Versioned prompt templates (synthesis, style rewrite) for reproducibility.
- **ai_generated_outputs** — Cached or stored AI output (style rewrite/synthesis) keyed by request + style + version.

---

## 3. What Stays Code vs Moves to Data

| Content / logic | Recommendation | Reason |
|-----------------|----------------|--------|
| Sign date ranges (zodiac) | **Code** | Pure logic; rarely changes. |
| Saju 절기/천간지지 계산 | **Code** | Algorithm; not content. |
| Sign interpretation (personality, strengths, cautions, domain guidance) | **DB** | Editable, localizable, versionable. |
| Period tone (intro/suffix) | **DB** | Same as above. |
| Compatibility rules (element pairing, modality) | **DB** | Editable rules. |
| Saju element meanings, day-master tendencies | **DB** | Editable content. |
| Style presets (keys, labels) | **DB** | Add/remove without deploy. |
| AI prompt templates | **DB** | Versioning, A/B, edit without deploy. |
| Raw / interpreted / AI outputs | **DB** (optional) | History, replay, analytics. |

---

## 4. Example SQL Schema (Supabase/Postgres)

```sql
-- Optional: auth.users is managed by Supabase Auth.
-- We only add app-level tables.

-- Style presets (v1: warm_healing, best_friend, etc.)
CREATE TABLE style_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  label text NOT NULL,
  description text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- AI prompt templates (versioned)
CREATE TABLE ai_prompt_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  version text NOT NULL,
  system_prompt text NOT NULL,
  user_prompt_template text NOT NULL,
  guardrails text,
  UNIQUE(name, version)
);

-- Astrology sign interpretation content
CREATE TABLE sign_interpretation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sign_key text UNIQUE NOT NULL,
  element text NOT NULL,
  modality text NOT NULL,
  personality text NOT NULL,
  strengths jsonb DEFAULT '[]',
  cautions jsonb DEFAULT '[]',
  domain_guidance jsonb NOT NULL, -- { love, career, money, health }
  created_at timestamptz DEFAULT now()
);

-- Period tone (daily, weekly, monthly, yearly, lifetime)
CREATE TABLE period_tone (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_key text UNIQUE NOT NULL,
  intro text NOT NULL,
  suffix text NOT NULL
);

-- Saju: element meanings
CREATE TABLE saju_element_meaning (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  element_key text UNIQUE NOT NULL,
  label text NOT NULL,
  dominant_meaning text NOT NULL,
  deficient_meaning text NOT NULL,
  balance_note text NOT NULL
);

-- Saju: day master domain tendency (갑~계)
CREATE TABLE saju_day_master_tendency (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ilgan text UNIQUE NOT NULL,
  relationships text NOT NULL,
  work text NOT NULL,
  money text NOT NULL,
  health text NOT NULL
);

-- Compatibility: element pairing rules
CREATE TABLE compatibility_element_pairing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_key text UNIQUE NOT NULL, -- same, fire_air, earth_water, other
  score_delta numeric NOT NULL,
  attraction text NOT NULL,
  communication text NOT NULL,
  caution text NOT NULL
);

-- Users (optional; can use Supabase auth.id)
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Birth profiles (linked to user or anonymous session)
CREATE TABLE birth_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  name text,
  calendar_type text NOT NULL DEFAULT 'solar',
  birth_date date NOT NULL,
  birth_time time,
  birth_place text,
  created_at timestamptz DEFAULT now()
);

-- Reading request (one run)
CREATE TABLE reading_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES birth_profiles(id),
  period_key text NOT NULL,
  style_key text NOT NULL,
  requested_at timestamptz DEFAULT now()
);

-- Raw chart result (calculation layer output)
CREATE TABLE raw_chart_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES reading_requests(id) UNIQUE,
  payload jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Interpreted result (interpretation layer output)
CREATE TABLE interpreted_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES reading_requests(id) UNIQUE,
  payload jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Compatibility result (optional)
CREATE TABLE compatibility_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id_1 uuid REFERENCES birth_profiles(id),
  profile_id_2 uuid REFERENCES birth_profiles(id),
  payload jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- AI-generated output (cache or permanent)
CREATE TABLE ai_generated_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES reading_requests(id),
  prompt_version text NOT NULL,
  style_key text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Indexes for common lookups
CREATE INDEX idx_reading_requests_profile ON reading_requests(profile_id);
CREATE INDEX idx_ai_generated_request_style ON ai_generated_outputs(request_id, style_key);
```

---

## 5. Typed Schema (TypeScript)

See `types/db-schema.ts` for interfaces that mirror these tables. Use for type-safe access when integrating Supabase client.

---

## 6. Migration Plan (Current → DB-Ready)

### Step 1: Introduce a content/preset access layer (no DB yet) — DONE

- **`lib/data/content-provider.ts`** exposes:
  - `getSignInterpretation(signKey)`, `getPeriodTone(periodKey)`, `getStylePresets()`, `getSajuElementMeaning()`, `getDayMasterTendency()`, `getCompatibilityPairing()`, `getCompatibilityModalityNote()`.
  - Implementation: delegates to existing `lib/interpretation/*` modules.
- **Style presets** are now sourced from `lib/data`; `BirthInfoForm` and `StyleSelector` use `getStylePresets()`.
- **Outcome:** Single place for content/presets; swap to Supabase when ready.

### Step 2: Create Supabase project and tables

- Create project; run the SQL above (or a subset).
- Seed `style_presets`, `sign_interpretation`, `period_tone`, `saju_*`, `compatibility_*`, `ai_prompt_templates` from current TS data (one-time script or SQL inserts).

### Step 3: Optional persistence for readings

- After a reading is produced, optionally `INSERT reading_requests`, `raw_chart_results`, `interpreted_results`, and `ai_generated_outputs` (if AI was used).
- Requires `birth_profiles` (and optionally `users`). Can start with anonymous profile keyed by session/local id.

### Step 4: Switch content provider to Supabase

- In `content-provider.ts`, replace in-memory reads with `supabase.from('sign_interpretation').select()`, etc.
- Keep the same function signatures and return types so interpretation and AI code stay unchanged.
- Add simple in-memory fallback or cache if DB is unavailable (e.g. dev without Supabase).

### Step 5: Move AI prompts to DB

- Store system/user templates and guardrails in `ai_prompt_templates`.
- API route or `lib/ai` loads template by name+version, interpolates variables, then calls LLM.
- Retain a code fallback (e.g. current `lib/ai/prompts.ts`) when no DB or template is found.

---

## 7. What Not to Do (Constraints)

- Do **not** migrate calculation engines (astrology-db.js, saju-db.js) to DB; keep them in code.
- Do **not** require DB for the app to run; keep local/default content so dev and demo work without Supabase.
- Do **not** over-engineer: start with content + style presets + optional prompt templates; add reading/request storage only if needed.

---

## 8. JSONB Payload Shapes (Reference)

- **raw_chart_results.payload:** Same shape as `CalculationResult` (astrology by period, saju pillars, elements, etc.).
- **interpreted_results.payload:** Same shape as `InterpretationResult` (astrology by period, saju interpreted).
- **ai_generated_outputs.payload:** Same shape as `SynthesisOutput` (heroQuote, integratedTheme, cautionSignal, dailyGuideline, lifetimeTheme).
- **compatibility_results.payload:** Same shape as `AstrologyCompatibilityResult`.

Use `types/result-schema.ts` and `types/ai-types.ts` as the source of truth for these shapes.
