# UI Before & After Notes (Phase 6)

Phase 6 focused on a clearer hierarchy, premium narrative flow, and consistent state/copy so the result experience feels trustworthy and easy to follow.

---

## 1. Result Section Structure (Before → After)

**Before:** Flat list: Tabs → Metadata → Style error/loading → Hero → Domain cards → Astrology card → Saju card → Five elements → Integrated insight → Why this result → Micro actions → Regenerate.

**After:** Explicit narrative flow with `<section>` and spacing (`space-y-8`):

1. **Hero** — Main message (and style error/loading when relevant).
2. **Identity & chart snapshot** — One-line summary (별자리 · 일간 · 기간 · 표현 스타일) + metadata tags.
3. **통합 해석** — Integrated insight card (공통 테마, 주의할 점, 오늘의 선택, 인생 테마).
4. **Chart detail** — Astrology card, Saju card, Five elements chart (reference/identity).
5. **생활 영역별 해석** — Domain cards.
6. **이 해석의 근거** — Expandable “Why this result”.
7. **오늘의 실천** — Micro action card.
8. **No birth time note** — Shown only when birth time was not provided: “출생시간을 입력하면 일간·사주가 더 정확히 반영됩니다.”
9. **다시 보기** — Single CTA.

Every block has a clear role; no dead ends. Partial results still use the same layout with fallbacks.

---

## 2. Hierarchy, Spacing, Typography

- **Section spacing:** `space-y-8` between major sections (was `space-y-6`).
- **Section labels:** Uppercase, tracking, muted: `text-sm font-medium text-text-secondary uppercase tracking-wider` for “통합 해석”, “생활 영역별 해석”, “오늘의 실천” where a section title is needed.
- **Hero:** Removed decorative symbols; one clear message line; subtitle and date label are secondary. No quotation marks around the message.
- **Domain cards:** Internal title aligned to same style (“생활 영역별 해석”).
- **Integrated insight:** Subsections use “공통 테마”, “주의할 점”, “오늘의 선택”, “인생 테마” with consistent `font-medium` and no emoji in headings.
- **Why this result:** Button label changed to “이 해석의 근거” for clarity.
- **Micro action card:** Title set to “오늘의 실천” and styled to match section labels.

---

## 3. State Design

| State | Handling |
|-------|----------|
| **Loading** | `LoadingScreen`: shorter messages (“~하고 있습니다.”), smaller pulse, `min-h-[40vh]`, no excessive motion. |
| **Input error** | Existing error banner above form; no change. |
| **No birth time** | Optional note at bottom of result: “출생시간을 입력하면 일간·사주가 더 정확히 반영됩니다.” (only when `!lastBirthInfo?.birthTime`). |
| **Partial reading** | Existing fallbacks in cards (Phase 1); no empty cards. |
| **AI unavailable / style error** | Inline block under hero with message + “다시 시도”; copy: “선택한 표현 스타일로 변환 중입니다.” while loading. |

---

## 4. Copy Changes

- **Loading:** “별자리를 읽고 있어요...” → “별자리를 읽고 있습니다.” (and similar for other steps).
- **Style loading:** “선택한 스타일로 변환 중…” → “선택한 표현 스타일로 변환 중입니다.”
- **Why section:** “왜 이 결과가 나왔나요?” → “이 해석의 근거”.
- **Integrated insight:** “공통 테마”, “주의 신호” → “주의할 점”, “오늘의 선택 기준” → “오늘의 선택”.
- **CTA:** “다른 해석 보기” → “다시 보기”.
- **Hero:** Message shown without surrounding quotation marks.

---

## 5. Reusable Patterns Introduced

- **Section wrapper:** Use `<section className="space-y-4">` (or `space-y-6` / `space-y-8`) for each logical block; add an optional `<h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider">` when the section needs a visible label.
- **Identity line:** Single line of key identifiers (e.g. 별자리 · 일간 · 기간 · 표현 스타일) in `text-xs text-text-muted text-center` for quick scan.
- **Error + retry:** Same pattern as style error: flex container, message + “다시 시도” button, `bg-caution/10 border-caution/20`, no heavy animation.
- **Conditional note:** Short, non-blocking copy (e.g. no birth time) in `text-xs text-text-muted text-center` at the end of the result block.

---

## 6. What Was Not Changed

- No new animations beyond existing `animate-in fade-in` on the result container.
- No change to color system or glass cards; only hierarchy and spacing.
- Style selection remains input-only; result only shows the chosen style in the identity line and applied copy.
- Domain cards, astrology/saju cards, and five-elements chart keep current behavior and content; only order and section titles were adjusted.

---

## 7. Files Touched (Phase 6)

- `app/page.tsx` — Result layout, sections, identity line, style label, no-birth-time note, CTA copy.
- `components/result/hero-summary.tsx` — Simplified hero (no quotes, no decorative symbols).
- `components/result/domain-cards.tsx` — Section title text and style.
- `components/result/why-this-result.tsx` — “이 해석의 근거” label.
- `components/integrated-insight-card.tsx` — Subsection labels (공통 테마, 주의할 점, 오늘의 선택, 인생 테마).
- `components/micro-action-card.tsx` — “오늘의 실천” title and heading style.
- `components/loading-screen.tsx` — Messages, size, and layout.
