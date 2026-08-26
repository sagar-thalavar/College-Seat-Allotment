---
name: KEA Next
description: Lateral-entry engineering seat verification, cutoff feasibility and option entry for Karnataka
colors:
  ground: "#fbfaf9"
  panel: "#f7f3f3"
  sunken: "#f0eceb"
  hairline: "#e4dedd"
  rule: "#d1c8c7"
  field: "#938988"
  ink: "#191211"
  ink-soft: "#49403f"
  ink-muted: "#6a6160"
  ink-off: "#9b9291"
  oxide: "#992c27"
  oxide-deep: "#7e1a18"
  oxide-wash: "#fdebe9"
  oxide-edge: "#f3c4be"
  pine: "#28654d"
  pine-wash: "#e7f6ef"
  pine-edge: "#badecd"
typography:
  masthead:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: "1.15"
    letterSpacing: "-0.02em"
  stage:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: "1.25"
    letterSpacing: "-0.015em"
  section:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: "1.35"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.5"
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: "1.4"
  record:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.8125rem"
    fontWeight: 500
    letterSpacing: "-0.01em"
rounded:
  xs: "2px"
  sm: "3px"
  md: "4px"
  lg: "6px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
  button-grave:
    backgroundColor: "{colors.oxide}"
    textColor: "{colors.ground}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
  panel:
    backgroundColor: "{colors.ground}"
    borderColor: "{colors.hairline}"
    rounded: "{rounded.sm}"
---

# Design System: KEA Next

## North star — "The Verified Record"

A 19-year-old polytechnic graduate sits in a bright room in Kalaburagi in June, phone at
40% brightness, comparing a college's 2025 cutoff to their own DCET rank while a parent
reads over their shoulder. They get one shot, and they are frightened of ordering their
options wrong and losing a seat they earned.

Every decision below falls out of that sentence. The product is not a dashboard and not a
SaaS app. It is **a public record that happens to be interactive** — calm, exact, and
unexcited, at a moment when the person reading it is none of those things.

## Colours

Two hues carry the entire product. Everything else is ink on an off-white ground.

### The governing rule

**Ink does the work; oxide marks consequence.**

Primary actions are ink, because a state instrument's default action should be sober.
Oxide appears only on the masthead rule, the current stage marker, verification seals, and
irreversible actions — locking an option list, surrendering a seat. Past roughly 10% of a
screen, oxide is wrong.

### Identity — Oxide (`#992c27`)

Deep madder red: Karnataka ledger ink and government file-cover red. It is neither the
navy-and-saffron reflex that every Indian government portal reaches for first, nor the
black-and-yellow neobrutalism that a designer avoiding that reflex reaches for second.
It reads as a stamped record, which is exactly what this product is.

### Verified — Pine (`#28654d`)

The seal green of a revenue document, not the SaaS emerald. Deep and desaturated
(L 0.46 / C 0.075). Used only for a verified state — a resolved register, a confirmed
category code, an option already added. Never for "good", never for "safe".

### Ground

A true off-white at `oklch(0.985 0.002 25)` — chroma tinted toward the brand's own hue
rather than defaulted toward warmth. It is deliberately **not** the cream/sand/paper band
that reads as generated the moment you see it.

`panel` is the second neutral layer for headers, toolbars and footers; `sunken` is for
inset wells, disabled fills and meter tracks.

### Contrast — measured, not assumed

| Pair | Ratio |
|---|---|
| `ink` on `ground` | 17.7:1 |
| `ink-soft` on `ground` | 9.6:1 |
| `ink-muted` on `ground` | 5.8:1 |
| `oxide` on `ground` | 7.4:1 |
| `pine` on `ground` | 6.6:1 |
| `ground` on `ink` | 17.7:1 |
| `field` border on `ground` | 3.2:1 |

`ink-muted` is the lightest text that exists. There is no lighter grey to reach for.

### Named rules

**Probability is never colour-coded.** No green/amber/red tiers. A red "Ambitious" badge
tells a frightened student that their dream college is an error — it is not, it is a
stretch. Probability is a magnitude, so it is drawn as one: a filled proportion with
ticks on the real tier boundaries (52 / 86), which makes the scale self-explaining and
removes the need for a legend.

**Structure comes from rules, not shadows.** Content never floats. Box-shadow exists on
exactly one component, `Dialog`, because an overlay genuinely sits above the page.

**Documents have corners.** Maximum radius is 6px. The old build's `rounded-2xl` on every
surface is what made it read as a template.

## Typography

**Inter** for everything on screen; **JetBrains Mono** for records only — Aadhaar, USN,
RD numbers, secret keys, ranks, cutoffs, rupees, percentages. Sans and mono is a real
contrast axis; two similar sans-serifs would not be.

Fixed rem scale (11 / 12 / 13 / 14 / 16 / 18 / 22 / 28), not fluid — users view product
UI at consistent DPI, and a heading that shrinks inside a panel looks worse, not better.

Weights stop at `font-semibold`. The old build used `font-black` on every string, which
is the same as using it on none.

Every figure that gets compared to another figure carries `tabular-nums`. In a product
whose entire content is ranks against cutoffs, proportional digits are a defect.

## Motion

140ms / 180ms / 240ms on `ease-out-quart`. Motion conveys state — a value arriving, a row
moving, a panel opening — and never choreographs a page load.

Three keyframes are defined, each with one sanctioned use:

- `seal-press` — the oxide verification seal pressing onto the slip and the allotment
  order. Once per document. It is what a government office physically does to a verified
  record, which is why it earns its place where confetti would not.
- `rule-draw` — the masthead rule, once.
- `row-settle` — registers landing as they resolve, and rows settling after a reorder.

Reduced motion is handled globally and must not be defeated inline.

## One CSS trap this project already hit

Element defaults in `globals.css` live inside `@layer base`. They must stay there.

Unlayered CSS beats Tailwind's layered utilities regardless of specificity. While
`p { text-wrap: pretty }` and `h1,h2,h3 { text-wrap: balance }` sat unlayered, they reset
the `white-space` longhand and silently made `truncate` a no-op on every paragraph and
heading in the project — text wrapped to four lines where a single ellipsised line was
intended, with no error anywhere. Layering them fixed it. Do not move them back out.

## Components

`src/components/ui/` holds the shared primitives: `Button`, `Panel`, `Badge`, `Field`,
`DataRow`, `Dialog`, `ProbabilityBar`. `Panel` is a ruled section, not a card — cards are
the lazy answer and nested cards are always wrong.

Every interactive component ships default, hover, focus-visible, active, disabled and
loading. Disabled uses real tokens (`bg-sunken` / `text-ink-off` / `border-hairline`);
`opacity-50` over a coloured ground destroys contrast and is banned.

Anything reorderable by mouse is reorderable by keyboard, with the result announced in a
polite live region. Touch targets are at least 44px.

## Copy

Load-bearing words, grounded in what actually happens. A probability is never stated
without what it is measured against: "92%" is noise, "92% — your rank 1,250 sits well
inside last year's 3AG cutoff of 2,340" is a fact.

Rupees use Indian grouping (₹1,26,000). Ranks are grouped (1,250). Dates are unambiguous.
