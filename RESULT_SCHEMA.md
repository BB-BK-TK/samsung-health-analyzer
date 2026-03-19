# Result Schema & Pipeline (Phase 2)

This document describes the four-layer result architecture and the normalized data structures used by the app.

---

## 1. Pipeline overview

```
Birth input
    ↓
[1] Calculation layer   →  Raw outputs (astrology + saju)
    ↓
[2] Interpretation layer →  interpretationFacts, interpretedSummary, domainCards
    ↓
[3] Presentation layer  →  ResultViewModel (hero, domainCards, whyThisResult, metadataTags, styleReadyText)
    ↓
[4] LLM layer (future)  →  Overwrites for styleReadyText only
    ↓
UI renders view-model
```

- **Layer 1 (calculation):** `lib/calculation-layer.ts` — runs `AstrologyCalculator` and `SajuCalculator` only. Returns `CalculationResult` (raw, no UI copy).
- **Layer 2 (interpretation):** `lib/interpretation-layer.ts` — builds interpretationFacts, interpretedSummary, domainCards from raw. No hardcoded presentation strings in calculators.
- **Layer 3 (presentation):** `lib/presentation-layer.ts` — builds unified `ResultViewModel` for the UI (hero, domain cards, “why this result”, metadata tags, styleReadyText).
- **Layer 4 (LLM):** `lib/llm-layer.ts` — placeholder; in Phase 3 will accept view-model (and tone/interests) and return overwrites for `styleReadyText` only.

---

## 2. Type definitions

All shared types live in **`types/result-schema.ts`**.

### 2.1 Astrology

- **`AstrologyPeriodKey`:** `"daily" | "weekly" | "monthly" | "yearly" | "lifetime"`.
- **`AstrologyRawCalculation`:** Per-period raw from engine (signKo, period, dateRange, energyKey, love/career/money/health with score + statusKey, lucky, signInfo).
- **`AstrologyInterpretationFacts`:** Flattened facts (energy, scores, status strings, bodyPart, lucky color/number/time).
- **`AstrologyDomainCard`:** `{ id, domain, title, score?, summary, keyPoint? }` for love | career | money | health.
- **`AstrologyReadingViewModel`:** Full per-period view: rawCalculation, interpretationFacts, interpretedSummary, domainCards, styleReadyText (heroQuote, energyLabel, domainLabels), metadata (period, sign, dateLabel, source).
- **`AstrologyCompatibilityResult`:** score, summary, strengths[], challenges[] (for future compat UI).

### 2.2 Saju

- **`SajuRawCalculation`:** pillars (type, korean, hanja, animal), dayMaster (hanja, korean, meaning), elementsPercent, excessElement, deficientElement, ilgan, ilganInfo (상징, 장점, 단점, 성격), zodiacAnimal.
- **`SajuInterpretationFacts`:** dayMasterPersonality, dayMasterStrengths, dayMasterCautions, dominantElement, weakElement, elementBalanceNote.
- **`SajuDomainCard`:** id, domain (character | strengths | cautions | advice), title, summary, keyPoint?.
- **`SajuReadingViewModel`:** rawCalculation, interpretationFacts, interpretedSummary, domainCards, styleReadyText (dayMasterLabel, themeLabel, adviceIntro), metadata (birthDate, birthTime?, source).

### 2.3 Unified view-model (UI contract)

- **`HeroSummaryViewModel`:** message, dateLabel, period, subtitle?.
- **`DomainCardViewModel`:** id, domain, title, score?, summary, keyPoint?, variant?.
- **`WhyThisResultSection`:** title, content, source (astrology | saju).
- **`MetadataTagViewModel`:** label, value, source?.
- **`ResultViewModel`:**  
  - heroSummary  
  - domainCards (merged astrology + saju domain cards)  
  - whyThisResult (sections[], basedOn)  
  - metadataTags  
  - astrology (byPeriod, compatibility, sunSign, moonSign, risingSign, planets)  
  - saju (full SajuReadingViewModel)  
  - fiveElements (wood/fire/earth/metal/water + analysis.excess/deficient)  
  - microActions  
  - styleReadyText (heroQuote, integratedTheme, cautionSignal, dailyGuideline, lifetimeTheme?) — **slot for LLM overwrite**

---

## 3. File roles

| File | Role |
|------|------|
| `types/result-schema.ts` | All TypeScript types for the pipeline and UI. |
| `lib/calculation-layer.ts` | Runs calculators; returns `CalculationResult` (raw only). |
| `lib/interpretation-layer.ts` | Builds interpretationFacts, interpretedSummary, domainCards from raw. |
| `lib/presentation-layer.ts` | Builds `ResultViewModel`; `getViewModelSliceForPeriod()` for tab switching. |
| `lib/llm-layer.ts` | Placeholder for Phase 3 LLM style overwrites. |
| `app/page.tsx` | Runs calculation → interpretation → presentation; stores `ResultViewModel`; passes view-model to components. |
| `components/result/*` | HeroSummary, DomainCards, WhyThisResult, MetadataTags — consume view-model only. |
| Existing cards (AstrologyCard, SajuCard, etc.) | Fed from `ResultViewModel` (astrology, saju, fiveElements, styleReadyText). |

---

## 4. UI requirements covered

- **Hero summary:** `HeroSummary` uses `heroSummary` from view-model (or slice by period).
- **Domain cards:** `DomainCards` receives `domainCards` (astrology domains + saju character/strengths/cautions/advice).
- **“Why this result?”:** `WhyThisResult` expandable section uses `whyThisResult.sections` and `basedOn`.
- **Metadata tags:** `MetadataTags` shows period, sign, birth date, etc. from `metadataTags`.
- **Partial data:** Interpretation and presentation layers use optional chaining and fallbacks; components tolerate empty arrays or missing fields with defaults.

---

## 5. Future LLM layer (Phase 3)

- Input: `styleReadyText` + optional `toneStyle`, `interests`.
- Output: Partial `LLMStyleOutput` (e.g. heroQuote, dailyGuideline) to overwrite `ResultViewModel.styleReadyText`.
- UI continues to read from `resultViewModel.styleReadyText`; no change to pipeline shape.
