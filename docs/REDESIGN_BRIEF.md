# Redesign Brief — "The Verified Record"

**Read this in full before writing a line.** Five agents build against it in parallel.
Do not modify anything outside your assigned files.

---

## 1. What we are actually building

A 19-year-old polytechnic graduate in Kalaburagi is sitting in a bright room in June
with the window open, phone at 40% brightness, comparing a college's 2025 cutoff to
their own DCET rank while a parent reads over their shoulder. They get one shot.
They are frightened of ordering their options wrong and losing a seat they earned.

Everything below follows from that sentence:

- **Light surface.** Daylight glare, cheap screens, a second reader over the shoulder.
- **Numbers are the content.** Ranks, cutoffs, percentages, rupees. Everything else is chrome.
- **The tone is a public record, not a product.** Calm, exact, unexcited. It should feel
  like the state's own instrument being honest with them.
- **No hype, no dark patterns, no urgency theatre.** They are already at maximum stress.

## 2. What we are replacing (and must not reproduce)

The old build was full-bleed `#FFC700` taxi yellow, `font-black` on every string,
`rounded-2xl` on every box, ten identical white pills, `opacity-50` disabled states that
destroyed contrast, and a button literally labelled "Click Me".

Banned outright, no exceptions:

- Card grids of identical boxes. **Use ruled sections (`Panel`), not floating cards.**
- Shadows on content. Shadow exists only on `Dialog`.
- `rounded-xl` / `rounded-2xl` / `rounded-3xl`. Max radius is `rounded-lg` (6px).
- `font-black`. Max weight is `font-semibold`. Hierarchy comes from size, colour and space.
- `opacity-50` for disabled. Use the real disabled tokens.
- Tiny uppercase tracked eyebrows above sections. Numbered `01 / 02 / 03` scaffolding.
- Gradient text, glassmorphism, side-stripe borders, emoji, confetti.
- Any hard-coded hex or Tailwind palette colour (`text-zinc-600`, `bg-yellow-300`, `#FFC700`).
  **Only the tokens in §3 exist.**

## 3. The design system (already built — consume it, never edit it)

`src/app/globals.css` defines the tokens. Use them as Tailwind utilities.

### Colour — two hues total

| Token | Use |
|---|---|
| `ground` | page background (off-white) |
| `panel` | second neutral layer — headers, footers, toolbars |
| `sunken` | inset wells, disabled fills, meter tracks |
| `hairline` | default 1px separator |
| `rule` | stronger separator, dialog border |
| `field` | form-control boundary (3.24:1 — required for inputs) |
| `ink` | primary text and primary buttons (17.7:1) |
| `ink-soft` | secondary text (9.6:1) |
| `ink-muted` | labels, units, tertiary (5.8:1) — **this is the floor, never go lighter** |
| `ink-off` | disabled text only |
| `oxide` / `oxide-deep` / `oxide-wash` / `oxide-edge` | **gravity and identity** |
| `pine` / `pine-wash` / `pine-edge` | **verified, and nothing else** |

**The rule that governs colour: ink does the work, oxide marks consequence.**
Primary actions are `ink`. Oxide appears only on: the masthead rule, the current stage
marker, verified-record seals, and irreversible actions (locking the option list,
surrendering a seat). If oxide is on more than ~10% of a screen, it is wrong.

**Never colour-code the probability tiers.** No green/amber/red. A red "Ambitious"
badge tells a scared student their dream college is an error — it isn't, it's a stretch.
Magnitude is drawn as magnitude: use `<ProbabilityBar />`.

### Type

`font-sans` (Inter) for everything; `font-mono` (JetBrains Mono) for **records only** —
Aadhaar, USN, RD numbers, secret keys, ranks, cutoffs, rupees, percentages.
Sizes: `text-micro` `text-label` `text-sm` `text-base` `text-lg` `text-xl` `text-2xl` `text-3xl`.
Weights: `font-normal`, `font-medium`, `font-semibold`. That's all.
Every figure that gets compared to another figure carries `tabular-nums`.

### Space and rhythm

4-based. Vary it — `py-2` inside a row, `py-4` inside a panel, `space-y-6` between panels,
`py-10` between stages. Do not apply one uniform gap everywhere.

### Motion

`--dur-fast` 140ms / `--dur-base` 180ms / `--dur-slow` 240ms, easing
`var(--ease-out-quart)`. Motion conveys state only: a value arriving, a row moving,
a panel opening. **No page-load choreography.** Never gate content visibility behind a
class-triggered transition — the content must render without JS running.
Reduced-motion is already handled globally; don't fight it.

Three keyframes exist for deliberate use: `seal-press`, `rule-draw`, `row-settle`.

### Primitives — `@/components/ui`

```tsx
<Button variant="primary|secondary|ghost|grave" size="sm|md|lg" isLoading loadingLabel />
<Panel title aside note headingLevel padded />          // ruled section, no shadow
<Badge tone="neutral|verified|grave|outline" mono />
<Field label hint error mono />                          // label+input+hint/error, wired a11y
<DataRow label value mono source />                      // put inside a <dl>
<Dialog open onClose title subtitle footer />            // native <dialog>
<ProbabilityBar score tier density="full|inline" />
```

Need something not in this list? Build it locally in your own file, in the same idiom.
**Do not edit `src/components/ui/*` — five agents share it.**

## 4. Stage flow and component contracts (FIXED — implement exactly)

Five stages: `1 Record → 2 Slip → 3 Colleges → 4 Options → 5 Rounds`.

```ts
// Agent 1
interface IdentifierInputSectionProps {
  student: StudentProfile;
  onProceed: () => void;
}

// Agent 4
interface VerificationSlipProps {
  student: StudentProfile;
  onProceedToColleges: () => void;
}

// Agent 3
interface CollegeRecommendationListProps {
  student: StudentProfile;
  colleges: College[];
  optionChoices: OptionChoice[];
  onAddChoice: (rec: RecommendationResult) => void;
  onAddAllChoices: (recs: RecommendationResult[]) => void;
  onProceedToOptionEntry: () => void;
}
interface CollegeDetailModalProps {
  item: RecommendationResult | null;
  onClose: () => void;
  onAddToOption: (item: RecommendationResult) => void;
  isAlreadyAdded: boolean;
}

// Agent 2
interface OptionEntryStudioProps {
  optionChoices: OptionChoice[];
  onReorderChoices: (choices: OptionChoice[]) => void;
  onRemoveChoice: (index: number) => void;
  onProceedToRounds: () => void;   // NEW
}

// Agent 4
interface RoundSimulatorProps {
  student: StudentProfile;
  optionChoices: OptionChoice[];
  onResetToOptions: () => void;
}
```

Types live in `@/types` (already correct — read it). Data: `src/data/students.json`
(one student, Sagar R Thalavar, rank 1250, category 3AG, rural quota, SNQ-eligible),
`src/data/colleges.json` (10 real Karnataka colleges with 3 years of category cutoffs,
placements, NAAC/NIRF, fees, hostel). The data is far richer than the old UI showed —
use it.

## 5. States are not optional

Every surface ships: default, hover, focus-visible, active, disabled, loading, empty,
error, long-text-overflow. Loading uses skeletons that match the final layout, not a
spinner floating in a void. Empty states teach the next action.

Keyboard is a hard requirement. Anything reorderable by mouse must be reorderable by
keyboard, with the change announced via a polite live region. Touch targets ≥44px.

## 6. Copy

Load-bearing words, grounded in what actually happens. Address the student directly.

- Bad: "Fetch Aadhaar" / "Lock Rank" / "Click Me" / "Step 2: Top 10 Matched Colleges"
- Good: "Pull my record" / "Rank 1250 — locked to your DCET roll number" /
  "These 10 colleges accept your diploma branch. Your rank is 1250."

Never state a probability without stating what it is measured against. "92%" alone is
noise; "92% — your rank 1250 is well inside last year's 3AG cutoff of 2,340" is a fact.

Rupees: `₹1,26,000` (Indian grouping), mono, tabular. Ranks: `1,250`.

## 7. Honesty constraint

This is a demonstration build with mock data. It must not present itself as the official
KEA portal, and must not reproduce a Government of Karnataka emblem. Agent 5 places one
quiet, permanent line to that effect in the footer. Nobody else needs to handle it.

## 8. Definition of done for your lane

- `npx tsc --noEmit` clean.
- No hard-coded colours; only §3 tokens.
- Every interactive element has a visible focus state and an accessible name.
- Reads correctly at 390px, 768px and 1440px.
- No string in your files could be described as placeholder.

---

## 9. Two corrections from the user (higher priority than anything above they contradict)

### 9a. Kill the numbered step selector — Agent 5

The old navbar had a black capsule reading `1. Identity` / `2. Priority List`. **Delete it.**
No numbered tabs anywhere. Numbers as scaffolding are banned (§2), and a manual tab
switcher lets a student skip verification and land in option entry with no record.

Replace it with a stage rail **derived from progress**, labelled in words:

`Record · Slip · Colleges · Options · Rounds`

- The current stage is marked with an `oxide` rule or mark, not a filled pill.
- Stages already completed are links back — they carry a `pine` check.
- Stages not yet reached are `ink-off` and genuinely `disabled` / not focusable.
- On mobile it collapses to `Colleges` + `3 of 5` rather than five cramped words.

You advance by finishing a stage, not by clicking a tab.

### 9b. The prefill must explain itself — Agent 1

The old build shipped a naked black button labelled **"Click Me"** floating above four
already-populated inputs. Nobody could tell what it did, and the fields being pre-filled
meant there was nothing to discover. Both halves were wrong.

Build it as a real empty state instead:

1. **The four identifier fields start empty and `disabled`.** A disabled field with a
   visible label is the cheapest possible way to say "something has to happen first" —
   the student sees the shape of what's coming without being able to type into a void.
   Use the real disabled tokens (`bg-sunken` / `text-ink-off` / `border-hairline`),
   never `opacity-50`.
2. **One primary action carries the whole explanation.** Label it for the outcome, not
   the mechanism — e.g. `Pull my record` — with one line beneath it saying exactly what
   will happen and where it comes from: *"Reads your name, marks, category and rank from
   DigiLocker, DTE, Nadakacheri and KEA. Nothing is typed by hand."*
3. **It must attract the eye without nagging.** While the record is empty, give that one
   button a slow, quiet attention cue — a ~2.4s breathing ring or a single travelling
   sheen on the oxide edge. Constraints: it is the only animated thing on the screen, it
   never moves layout, it stops permanently the moment the record is pulled, and it is
   fully suppressed under `prefers-reduced-motion` (the global rule handles this; do not
   defeat it with inline styles).
4. **Pulling is progressive, and you can watch it happen.** The four registers resolve in
   sequence with skeleton rows in the exact final layout, each landing with `row-settle`
   and flipping to a `pine` verified badge. Total ~1.2s. This is the one place a little
   theatre is honest: the product's entire promise is "we already know this about you",
   and watching four registers answer is that promise made visible.
5. **After the pull the fields become enabled and editable** — the student can correct a
   wrong RD number — and the primary action becomes `Continue to verification slip`.
6. Keep a quiet `Clear and start over` secondary so the empty state is reachable again.

Nothing on this screen may say "Click Me".
