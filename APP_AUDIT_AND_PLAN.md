# Cosmic 五 — App Audit and Implementation Plan

**Date:** 2025-03-14  
**Scope:** Full codebase audit for UI quality, result components, DB/data structure, interpretation depth, and LLM-based style/interpretation.

---

## 1. Issues Table

| # | Issue | Location (file:line or area) | Severity | Recommended Fix |
|---|--------|-----------------------------|----------|-----------------|
| 1 | **Astrology sign metadata is placeholder** — `AstrologyDB.signs.data[sign]` only has `{ name, element: "—", modality: "—" }`. No traits, symbols, or compatibility hints. | `lib/astrology-db.js` 31–36 | High | Add per-sign `element`, `modality`, short `traits`, `symbol`; optional `compat` hints. |
| 2 | **Compatibility is unimplemented** — `checkCompatibility(sign1, sign2)` always returns `{}`. Never called in app. | `lib/astrology-db.js` 142–146 | Medium | Implement compat logic using sign elements/modalities or add UI that calls it; otherwise remove or document as future. |
| 3 | **Lifetime reading is stub** — `generateLifetime()` returns `{ summary: "—", energy: "—" }`. Not used in main flow. | `lib/astrology-db.js` 72–74, 121–122 | Medium | Either implement a minimal lifetime narrative from sign + birth year or remove from `getFullReading` / hide in UI until ready. |
| 4 | **Category readings (love/career/money/health) are shallow and samey** — All use same `STATUS_WORDS` and seeded random; only score offsets differ. No category-specific copy or logic. | `lib/astrology-db.js` 41–44, 77–101 | High | Add category-specific word sets and 1–2 sentence templates per category; keep seeded logic but diversify output. |
| 5 | **Planets array always empty** — `fortuneData.astrology.planets` is hardcoded `[]`. AstrologyCard still renders "핵심 행성" with empty list. | `app/page.tsx` 179 | High | Either populate with simple sun (and optional moon) placement from sign, or hide "핵심 행성" when `planets.length === 0`. |
| 6 | **Moon/Rising always "—"** — `moonSign` and `risingSign` are never set; UI shows placeholders. | `app/page.tsx` 176–177 | Medium | Add placeholder copy (e.g. "출생시간 필요") or minimal moon-from-date heuristic; document rising as future. |
| 7 | **Five-elements analysis always null** — `fiveElements.analysis` is `{ excess: null, deficient: null }`. Chart shows bars but no excess/deficient text. | `app/page.tsx` 194–198 | Medium | Compute excess/deficient from 오행 분포 in saju (e.g. highest/lowest element) and add short interpretation in `lib/saju-db.js` or page. |
| 8 | **Micro actions are hardcoded** — Same three actions regardless of sign, period, or interests. | `app/page.tsx` 204–208 | Medium | Derive from period reading + interests (or sign) with a small pool of actions per category; keep fallback list. |
| 9 | **Saju interpretation is thin** — Strengths/cautions are single-line concatenation of 일간정보 (장점/단점/성격). No pillar-by-pillar or 오행 narrative. | `app/page.tsx` 157–160, 183–191; `lib/saju-db.js` 19–79 | Medium | Add 1–2 sentence interpretations per pillar or 오행 balance; reuse existing 천간 해석. |
| 10 | **Form tone/style and interests unused** — User selects `toneStyle` (warm/intuitive/direct) and `interests`; neither affects result content or display. | `app/page.tsx` handleSubmit (no use of birthInfo.toneStyle, birthInfo.interests); `components/birth-info-form.tsx` 18–19, 367–410 | High | In Phase 3, pass toneStyle + interests to LLM rewrite; until then, show a note that "말투/관심영역은 준비 중" or use interests to reorder/emphasize sections. |
| 11 | **Lunar calendar not applied** — User can choose "음력"; `birthDate` is still interpreted as solar. Saju and astrology both use the same date. | `app/page.tsx` 104–108 (no calendarType); `components/birth-info-form.tsx` 166–167 | High | Add lunar→solar conversion when `calendarType === "lunar"` (use library or lookup table) before calling astrology/saju; document limitations. |
| 12 | **Saju 절기 data gap** — `절기.데이터` has only 2020 and 2026. For 2021–2025 `get절입월` gets `yearData` undefined and falls back to solar `month`, so 월주 can be wrong. | `lib/saju-db.js` 159–213, 217–218 | High | Add 절기 데이터 for 2021–2025 (and 2027+ if needed) or a fallback that approximates 절입 from solar month. |
| 13 | **AstrologyCard shows empty planets section** — "핵심 행성" header and container always visible with no items. | `components/astrology-card.tsx` 33–56 | Low | Conditionally hide the planets block when `data.planets.length === 0`, or show "준비 중" message. |
| 14 | **FiveElementsChart analysis block empty when both null** — Section renders with no content when excess/deficient are null. | `components/five-elements-chart.tsx` 143–165 | Low | Hide analysis section when both null, or show a single line e.g. "오행이 고르게 분포되어 있어요." |
| 15 | **SajuCard pillar korean/animal often empty** — `pillars[].korean` and some `animal` are ""; 월/일/시주 animal not set. | `app/page.tsx` 121–132 (korean: "", animal: "" for 월/일/시); `components/saju-card.tsx` 40–42 | Low | Populate from saju-db 지지/천간 한자·동물 mapping, or hide empty fields in SajuCard. |
| 16 | **dayMaster.korean always ""** — Saju day master shows only hanja and meaning; korean field unused. | `app/page.tsx` 185; `components/saju-card.tsx` 53–54 | Low | Add 한글 일간 name from SajuDB or leave as optional and hide when empty. |
| 17 | **Supabase client used nowhere** — `lib/supabase.ts` creates client; no imports elsewhere. Env vars missing can cause runtime error if ever imported. | `lib/supabase.ts` 1–8; no other refs | Low | Remove unused client for now, or gate creation on env and document for Phase 4. |
| 18 | **Horoscope API route deprecated but present** — Returns 410; no cleanup of route or client references. | `app/api/horoscope/route.ts` 1–7 | Low | Remove route or keep with clear comment; ensure no client calls it. |
| 19 | **Saju API route unused in main flow** — Main app uses local SajuCalculator; API calls external service and requires FREEASTRO_API_KEY. | `app/api/saju/route.ts`; `app/page.tsx` (local only) | Low | Document as optional/server path; or use for richer data in Phase 2/4. |
| 20 | **Metadata generic** — Layout title/description are "Create Next App" / "Generated by create next app". | `app/layout.tsx` 15–17 | Low | Set title to "Cosmic 五" and app-specific description. |
| 21 | **No error boundary** — Uncaught errors in result view could white-screen. | App root / layout | Low | Add error boundary around result or main content. |
| 22 | **currentReading! non-null assertion** — KeyMessageCard receives `currentReading!.overall.summary`; if state were ever inconsistent, could throw. | `app/page.tsx` 334 | Low | Guard with `currentReading ?? fortuneData.readings.daily` before passing to KeyMessageCard. |
| 23 | **Sample button sends fixed time** — "샘플로 체험하기" uses "14:30"; hour 14 is used. No issue if intent is demo. | `components/birth-info-form.tsx` 419–428 | Info | Optional: use 12:00 or document. |
| 24 | **Integrated insight is repackaged period reading** — commonTheme/cautionSignal/dailyGuideline are direct copies of energy/summary/love; no real "synthesis" of astrology + saju. | `app/page.tsx` 200–204, 276–278; `components/integrated-insight-card.tsx` | Medium | Add a small synthesis layer (e.g. combine sign + 일간 keyword, or defer to LLM in Phase 3). |

---

## 2. Severity Levels

- **High:** Broken or misleading UX, wrong data, or blocks future features (e.g. tone/style, lunar).
- **Medium:** Placeholder/stub behavior or shallow content that users will notice.
- **Low:** Polish, empty sections, or unused code that doesn’t break flow.
- **Info:** Optional or documentation-only.

---

## 3. Files and Components Summary

### 3.1 UI components that depend on incomplete or placeholder data

| Component | File | Depends On | Issue |
|-----------|------|------------|--------|
| AstrologyCard | `components/astrology-card.tsx` | sunSign, moonSign, risingSign, planets, insights | planets empty; moon/rising "—" |
| SajuCard | `components/saju-card.tsx` | pillars (korean, animal), dayMaster (korean), strengths, cautions | korean/animal often empty; interpretation shallow |
| FiveElementsChart | `components/five-elements-chart.tsx` | wood..water, analysis.excess/deficient | analysis always null |
| IntegratedInsightCard | `components/integrated-insight-card.tsx` | commonTheme, cautionSignal, dailyGuideline | Repackaged period text, no synthesis |
| MicroActionCard | `components/micro-action-card.tsx` | actions[] | Hardcoded list |
| KeyMessageCard | `components/key-message-card.tsx` | message, date | Fine; message is period summary |

### 3.2 Places where null / empty / placeholder results occur

- **Astrology:** `lib/astrology-db.js` — lifetime stub (72–74); compatibility returns `{}` (142–146); sign data only name/element/modality placeholder (31–36).
- **Page:** `app/page.tsx` — planets `[]` (179); moonSign/risingSign `"—"` (176–177); fiveElements.analysis null (194–198); microActions fixed (204–208).
- **Saju:** `lib/saju-db.js` — 절기 데이터 missing 2021–2025 (217–218 fallback to month).

### 3.3 DB / data / modeling issues

- **Astrology:** No elements/modalities per sign; no compat matrix; category readings share same pool of words.
- **Saju:** 절기 데이터 incomplete for 2021–2025; no excess/deficient derivation; interpretation is single-field concatenation.
- **App state:** Single `FortuneData` with no persistence; no schema for DB (Supabase unused).
- **Form → logic:** calendarType, toneStyle, interests not passed into calculation or display.

### 3.4 API / server / client boundaries

- **Client-only calculation:** All astrology and saju run on client via `AstrologyCalculator` and `SajuCalculator` in `app/page.tsx`. No server-side reading generation.
- **Unused API:** `app/api/saju/route.ts` — external bazi API, not used by main flow; `app/api/horoscope/route.ts` — 410 deprecated.
- **Supabase:** `lib/supabase.ts` — client created but never imported; ready for Phase 4.

---

## 4. Phased Implementation Plan

### Phase 1: Stabilize current app

**Goal:** Fix wrong or broken behavior, hide or clarify placeholders, no new features.

| Step | Task | Files to update | What can break | Order |
|------|------|------------------|----------------|-------|
| 1.1 | Add 절기 데이터 for 2021–2025 (and 2026 if only 2020 was complete) | `lib/saju-db.js` (절기.데이터) | None if data format matches 2020/2026 | 1 |
| 1.2 | Lunar calendar: add lunar→solar conversion when calendarType === "lunar" | `app/page.tsx` (handleSubmit), optionally `lib/lunar.js` or similar | Wrong date if conversion bug; document "approximate" | 2 |
| 1.3 | Hide "핵심 행성" when planets.length === 0 | `components/astrology-card.tsx` | None | 3 |
| 1.4 | Five-elements: compute excess/deficient from 오행 퍼센트; show or hide analysis | `app/page.tsx` (fiveElements.analysis), optionally `lib/saju-db.js` | Logic for max/min element | 4 |
| 1.5 | Guard KeyMessageCard: ensure currentReading fallback (no !) | `app/page.tsx` | None | 5 |
| 1.6 | SajuCard: hide pillar korean/animal when empty; optional dayMaster.korean | `components/saju-card.tsx` | None | 6 |
| 1.7 | FiveElementsChart: hide analysis section when both null; optional one-line message | `components/five-elements-chart.tsx` | None | 7 |
| 1.8 | Set layout metadata (title, description) | `app/layout.tsx` | None | 8 |
| 1.9 | Document or gate Supabase; remove/gate deprecated horoscope route | `lib/supabase.ts`, `app/api/horoscope/route.ts` | Env required if used | 9 |

**Deliverables:** Correct 월주 for 2021–2025, lunar option working (or clearly "준비 중"), no empty UI sections, stable metadata and env.

---

### Phase 2: Improve interpretation engine

**Goal:** Deeper, more varied readings and simple synthesis without LLM.

| Step | Task | Files to update | What can break | Order |
|------|------|------------------|----------------|-------|
| 2.1 | Expand AstrologyDB.signs.data: element, modality, short traits per sign | `lib/astrology-db.js` | Any code assuming only name/element/modality | 1 |
| 2.2 | Category-specific copy: separate word sets or templates for love/career/money/health | `lib/astrology-db.js` (buildReading or new helpers) | Same API; more variety | 2 |
| 2.3 | Implement checkCompatibility(sign1, sign2) with element/modality logic | `lib/astrology-db.js` | None if not yet used in UI | 3 |
| 2.4 | Minimal lifetime reading: 2–3 sentences from sign + birth year | `lib/astrology-db.js` (generateLifetime) | getFullReading callers if signature changes | 4 |
| 2.5 | Saju: add 1–2 sentence pillar or 오행 narrative; keep strengths/cautions | `lib/saju-db.js` or page mapping | Same saju output shape | 5 |
| 2.6 | Integrated insight: synthesize sign + 일간 (e.g. one shared keyword + one caution) | `app/page.tsx` (integrated block) or small `lib/interpret.ts` | Same IntegratedInsightCard props | 6 |
| 2.7 | Micro actions: pool per category; choose by interests + period or sign | `app/page.tsx` or `lib/actions-pool.js` | Same MicroActionCard props | 7 |
| 2.8 | Optional: simple "planets" (sun sign only, or sun+moon placeholder) | `app/page.tsx` (astrology.planets) | AstrologyCard already supports array | 8 |

**Deliverables:** Richer sign metadata, distinct category readings, compat and lifetime implemented or hidden, better integrated insight and micro actions.

---

### Phase 3: LLM-powered reading styles

**Goal:** User chooses style (tone); result text is rewritten by LLM. Optional: deeper interpretation.

| Step | Task | Files to update | What can break | Order |
|------|------|------------------|----------------|-------|
| 3.1 | API route: POST /api/rewrite or /api/reading — input: raw reading + toneStyle (+ interests); output: styled text | New `app/api/rewrite/route.ts` (or similar) | Needs API key and error handling | 1 |
| 3.2 | Env: OPENAI_API_KEY or similar; prompt that asks for tone (warm/intuitive/direct) and optional interests | `.env.example`, server prompt | Wrong key or model can fail | 2 |
| 3.3 | Client: after building fortune, optionally call rewrite API for keyMessage and/or insights; show loading state | `app/page.tsx` (handleSubmit), LoadingScreen or inline | Timeout, rate limit, cost | 3 |
| 3.4 | Use birthInfo.toneStyle and interests in request body | `app/page.tsx`, form already sends them | None | 4 |
| 3.5 | Fallback: if API fails, keep current local text | `app/page.tsx` | None | 5 |
| 3.6 | Optional: interpretation API that takes astrology + saju summary and returns 2–3 synthesized sentences | New route + client call | Same as 3.1 | 6 |

**Deliverables:** Tone selection affects displayed text via LLM; interests can be used in prompt; graceful fallback.

**Schema/data:** No DB yet; request/response are JSON (raw reading + style → rewritten text). Optional: cache by hash(reading + style) in Phase 4.

---

### Phase 4: Scalable DB structure

**Goal:** Prepare for persistence, caching, and future features (history, preferences).

| Step | Task | Files to update | What can break | Order |
|------|------|------------------|----------------|-------|
| 4.1 | Define schema: readings (id, user_id?, birth_hash, raw_json, style?, created_at); optional users/sessions | Design doc or migration (e.g. Supabase) | N/A | 1 |
| 4.2 | Gate Supabase client on NEXT_PUBLIC_SUPABASE_URL and key | `lib/supabase.ts` | Client creation only when env set | 2 |
| 4.3 | Optional: save reading after generate (anonymous or with user id); return id | New server action or API + `app/page.tsx` | None if feature-flagged | 3 |
| 4.4 | Optional: cache LLM rewrite by (content hash + style) in DB to reduce cost | API route + DB | Cache invalidation | 4 |
| 4.5 | Document Saju API route as alternative path for richer bazi data | `app/api/saju/route.ts`, README | None | 5 |

**Deliverables:** Clear schema, safe Supabase usage, optional save/cache and docs.

---

## 5. Recommended Order of Implementation (cross-phase)

1. **Phase 1** (full) — stability and data correctness first.  
2. **Phase 2** (full) — interpretation depth and variety without new infra.  
3. **Phase 3** (LLM)** — add rewrite API and wire toneStyle + interests; keep fallback.  
4. **Phase 4** — when ready for persistence/cache, add schema and gated Supabase.

Within Phase 1, do 1.1 (절기) and 1.2 (lunar) before UI polish (1.3–1.7). Within Phase 2, do 2.1–2.2 before 2.6–2.7 so synthesis has better inputs.

---

## 6. Exact File Reference Quick Index

| Concern | Primary file(s) |
|--------|------------------|
| Astrology sign data & readings | `lib/astrology-db.js` |
| Saju calculation & 절기 | `lib/saju-db.js` |
| Main flow & fortune build | `app/page.tsx` |
| Birth form & tone/interests | `components/birth-info-form.tsx` |
| Astrology card & planets | `components/astrology-card.tsx` |
| Saju card | `components/saju-card.tsx` |
| Five elements chart & analysis | `components/five-elements-chart.tsx` |
| Integrated insight | `components/integrated-insight-card.tsx`, `app/page.tsx` |
| Micro actions | `app/page.tsx` (hardcoded), `components/micro-action-card.tsx` |
| Supabase | `lib/supabase.ts` |
| API: saju | `app/api/saju/route.ts` |
| API: horoscope | `app/api/horoscope/route.ts` |
| Layout / metadata | `app/layout.tsx` |

---

*End of audit. No refactors were performed; this document is the sole deliverable.*
