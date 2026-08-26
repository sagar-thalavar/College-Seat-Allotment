---
name: KEA Next
description: Modernized Lateral-Entry Engineering Admission & Option Entry System
colors:
  authority-dark: "#0f172a"
  authority-black: "#020617"
  authority-surface: "#1e293b"
  verified-primary: "#059669"
  verified-surface: "#ecfdf5"
  verified-border: "#a7f3d0"
  target-primary: "#d97706"
  target-surface: "#fffbeb"
  target-border: "#fde68a"
  ambitious-primary: "#4f46e5"
  ambitious-surface: "#eef2ff"
  ambitious-border: "#c7d2fe"
  danger-primary: "#e11d48"
  danger-surface: "#fff1f2"
  surface-canvas: "#f8fafc"
  surface-card: "#ffffff"
  surface-muted: "#f1f5f9"
  border-subtle: "#e2e8f0"
  border-strong: "#cbd5e1"
  text-heading: "#0f172a"
  text-body: "#334155"
  text-muted: "#64748b"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: "1.2"
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: "1.3"
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: "1.4"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "1.5"
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: "1.3"
    letterSpacing: "0.04em"
  micro:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 700
    lineHeight: "1.2"
    letterSpacing: "0.05em"
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 600
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.authority-dark}"
    textColor: "{colors.surface-card}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-action:
    backgroundColor: "{colors.verified-primary}"
    textColor: "{colors.surface-card}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  card-standard:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.lg}"
    padding: "16px"
---

# Design System: KEA Next

## Overview

**Creative North Star: "The Sovereign Civic Gateway"**

KEA Next is an authoritative, calm, and dependable digital public instrument engineered for high-stakes engineering admissions in Karnataka. Its visual language replaces bureaucratic clutter, confusing marquees, and predatory commercial counseling aesthetics with crisp, respectful, and transparent software craft.

The design emphasizes clarity, high information density without visual noise, instant data verification, and deterministic user guidance across all five stages of the lateral-entry admission journey.

**Key Characteristics:**
- Restrained, institutional palette prioritizing deep navy authority and calibrated semantic signals.
- Clean structural grouping over gratuitous cards and decorative nesting.
- High-contrast typography optimized for rapid scanning of scores, ranks, and cutoff figures.
- Total absence of AI cliches (no purple gradients, no glowing neon effects, no decorative emojis).

## Colors

The color palette is strictly functional, distinguishing administrative authority from statistical probability tiers and verification states.

### Primary (Civic Authority)
- **Authority Dark** (`#0f172a`): Used for portal navigation headers, primary decision containers, and official verification badges.
- **Authority Black** (`#020617`): Used for top state administrative bars and high-contrast anchors.
- **Authority Surface** (`#1e293b`): Used for nested interactive blocks inside dark headers and secondary dark buttons.

### Semantic Accents (Probability & Verification)
- **Verified / Safe Emerald** (`#059669`): Denotes verified identity records, approved SNQ fee waivers, and safe admission probability ($\ge$ 85%).
- **Target / Moderate Amber** (`#d97706`): Denotes realistic target choices requiring careful multi-round monitoring (55% to 80% feasibility).
- **Ambitious Indigo** (`#4f46e5`): Denotes stretch dream choices suitable for top priority slots (< 50% probability).
- **Danger Rose** (`#e11d48`): Used exclusively for irreversible actions, seat surrenders, and error states.

### Neutral (Surfaces & Structural Borders)
- **Canvas Neutral** (`#f8fafc`): The foundational canvas providing soft, glare-free readability.
- **Card Surface** (`#ffffff`): The primary content plane for forms, tables, and admission cards.
- **Subtle Border** (`#e2e8f0`): Standard 1px boundary separating information chunks.
- **Strong Border** (`#cbd5e1`): Interactive field borders and active selection frames.

### Named Rules
**The Ten Percent Accent Rule.** Colored probability badges (Emerald, Amber, Indigo) must never dominate the screen; they exist solely as precise, scannable data markers against a calm slate foundation.
**The No-AI-Gradient Rule.** Never use multi-stop purple-to-cyan linear gradients or glowing drop-shadows anywhere on public service surfaces.

## Typography

**Display & Body Font:** Inter, system sans-serif fallback  
**Data & Code Font:** System Monospace (`ui-monospace, SFMono-Regular, Menlo, Consolas`)

**Character:** Clean, highly legible municipal typography with crisp tabular numbers for cutoffs, ranks, and monetary figures.

### Hierarchy
- **Display** (Bold, `1.25rem` / 20px, line-height 1.2): Used for primary stage titles and document headings.
- **Headline** (Bold, `1rem` / 16px, line-height 1.3): Used for college names, card headers, and verification slip sections.
- **Title** (Semi-bold, `0.875rem` / 14px, line-height 1.4): Used for component groups and section headers.
- **Body** (Regular, `0.75rem` / 12px, line-height 1.5): The core interface text for labels, descriptions, and rules.
- **Label** (Semi-bold, `0.6875rem` / 11px, line-height 1.3, tracking 0.04em): Used for secondary form labels, metadata headers, and category tags.
- **Micro** (Bold, `0.625rem` / 10px, uppercase, tracking 0.05em): Used for statutory status tags, quota badges, and table sub-headers.
- **Monospace Token** (Bold, `0.75rem` / 12px): Used for Roll numbers, Secret Keys, RD certificate numbers, and Challan codes.

### Named Rules
**The Tabular Data Rule.** All entrance exam ranks, monetary fees, and verification keys must use monospace or tabular numerical alignment to ensure error-free comparison.

## Layout

The spatial model employs a linear 5-step horizontal progression anchoring the entire user workflow.

- **Container:** Maximum content width capped at `1280px` (`max-w-7xl`) centered with responsive horizontal padding (`16px` on mobile, `24px` on desktop).
- **Rhythm:** Standard 4px baseline grid with primary component vertical rhythm of 12px to 24px (`space-y-3` to `space-y-6`).
- **Responsive Behavior:** 
  - Desktop: 4-column metric grids and side-by-side verification panels.
  - Tablet / Mobile: Stacks gracefully into single-column cards with horizontally scrolling filter chips and sticky action footers.

## Elevation & Depth

KEA Next follows a **Flat-and-Layered** architectural philosophy. Depth is conveyed primarily through 1px crisp slate borders and soft tonal shifts rather than heavy floating drop shadows.

### Shadow Vocabulary
- **Resting Surface** (`shadow-xs` / `0 1px 2px rgba(0, 0, 0, 0.05)`): Standard elevation for white content cards.
- **Action Footers & Modals** (`shadow-md` / `0 4px 6px -1px rgba(0, 0, 0, 0.1)`): Used for sticky decision bars and dialog drawers.

### Named Rules
**The Structural Border Rule.** Visual grouping must be achieved through 1px borders (`border-slate-200`) and soft background fills (`bg-slate-50`) rather than elevation lifting.

## Shapes

- **Base Radius:** 6px (`rounded-md`) for buttons and interactive controls; 8px (`rounded-lg`) for surface cards and containers.
- **Pill Badges:** Fully rounded (`rounded-full`) reserved exclusively for verified state pills and step numbering indicators.
- **Form Controls:** 4px to 6px radius with crisp 1px neutral strokes.

## Components

### Buttons
- **Primary Action (Authority Dark):** Solid `#0f172a` fill, white bold text, 6px radius, padding 8px 16px.
- **Action CTA (Verified Emerald):** Solid `#059669` fill, white bold text, 6px radius, padding 10px 20px, subtle hover transition.
- **Secondary / Utility:** White background, 1px `#cbd5e1` border, slate-700 text, hover `#f1f5f9`.
- **Mobile Touch Minimum:** Interactive reorder/delete controls maintain $\ge 44\text{px} \times 44\text{px}$ touch targets on mobile viewports.

### Chips & Badges
- **Safe Tier:** Background `#d1fae5` (Emerald 100), Text `#065f46` (Emerald 900), 1px border `#a7f3d0`.
- **Target Tier:** Background `#fef3c7` (Amber 100), Text `#78350f` (Amber 900), 1px border `#fde68a`.
- **Ambitious Tier:** Background `#e0e7ff` (Indigo 100), Text `#3730a3` (Indigo 900), 1px border `#c7d2fe`.

### Cards & Form Containers
- **Background:** Pure white (`#ffffff`).
- **Border:** 1px solid `#e2e8f0` (hover `#cbd5e1`).
- **Internal Padding:** 16px to 24px.
- **Header Section:** Bottom border divider with uppercase micro-labeling.

### Input Fields
- **Read-Only / Auto-Populated:** Soft slate fill (`#f8fafc`), `#cbd5e1` stroke, monospace text color `#1e293b`.
- **Active Interactive:** White fill, `#0f172a` focus ring (1px).

## Do's and Don'ts

### Do:
- **Do** display fees with transparent breakdown of standard tuition versus SNQ subsidized concessions.
- **Do** format all dates in standard Indian official format (YYYY-MM-DD or DD Month YYYY).
- **Do** pair every probability badge with its exact numerical cutoff baseline and applicable quota category.
- **Do** warn candidates before submitting option lists that lack safe backup choices.
- **Do** ensure all mobile touch controls meet the minimum 44px hit area standard.

### Don't:
- **Don't** use decorative emojis in official public service views; use professional functional Lucide SVG icons.
- **Don't** use em-dashes in user-facing copy or technical summaries.
- **Don't** bury critical reservation codes (HK 371J, SNQ, Rural) inside nested unsearchable menus.
- **Don't** allow candidates to pick engineering branches incompatible with their diploma discipline.
