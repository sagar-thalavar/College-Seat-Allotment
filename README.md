# College Seat Allotment

> A streamlined, zero-form lateral entry engineering seat preference and credential verification portal for Karnataka admissions.

> **This is a demonstration build running on mock data.** It is not affiliated with, endorsed by, or operated by the Karnataka Examinations Authority, and it is not the official DCET portal.

---

## Overview

Traditional engineering lateral entry admission portals often force candidates to fill dozens of redundant form fields, search through 200-page unsearchable cutoff PDFs, and navigate cluttered interfaces.

**College Seat Allotment** modernizes this workflow with:
* **Zero-Form Digital Verification**: Resolves student identity, polytechnic marks, caste/income reservation certificates, and state entrance rank using just **4 statutory identifiers** (Aadhaar, Diploma USN/SSLC, Nadakacheri RD Numbers, and DCET Merit Rank).
* **Multi-Year Cutoff Feasibility**: Three years of real category cutoffs (2023-2025) read against the candidate's own DCET rank, so a 200-page PDF becomes a single readable line.
* **"The Verified Record" Visual System**: A document surface rather than a dashboard - an off-white ground, structure carried by hairline rules instead of floating cards, and two hues total: **oxide** (`#992c27`) for consequence and **pine** (`#28654d`) for verified. Contrast is measured, not assumed.
* **Priority Ordering That Survives a Keyboard**: A 1-to-10 option entry studio reorderable by drag, by button and by keyboard, with a balance audit that catches the orderings that actually lose students seats.

---

## Data Flow & Architecture

```
[4 Minimal Identifiers]
  ├── 1. Aadhaar Card (DigiLocker Identity)
  ├── 2. Diploma USN & SSLC Roll No (Academic Records)
  ├── 3. Nadakacheri RD Numbers (Caste, Income & Reservations)
  └── 4. DCET Exam Rank (Merit Scorecard)
           │
           ▼
[Instant Registry Resolution Engine]
  ├── Auto-populates Legal Name, DOB, Gender, Address
  ├── Links 6-Semester Aggregate % & Diploma Discipline
  ├── Verifies Quota Category & SNQ Fee Waiver Eligibility
  └── Issues 16-Character Candidate Secret Key
           │
           ▼
[College Priority Ordering Studio]
  ├── Interactive 1 to 10 Ranked Preferences
  ├── Minimal Up / Down / Remove Controls
  └── Clean Responsive Touch Targets (>= 44px)
```

---

## Tech Stack

* **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
* **Icons**: [Lucide React](https://lucide.dev/) (Strictly SVG, Zero Emojis)
* **Design Engine**: Impeccable Design System

---

## Project Structure

```
kea-next/
├── .impeccable/              # Impeccable design system sidecars
├── docs/
│   ├── ARCHITECTURE.md
│   ├── IMPLEMENTATION_PLAN.md
│   └── REDESIGN_BRIEF.md     # The design contract this build was made to
├── src/
│   ├── app/
│   │   ├── globals.css       # OKLCH design tokens, motion & print rules
│   │   ├── layout.tsx        # Root metadata layout
│   │   └── page.tsx          # 5-stage flow controller
│   ├── components/
│   │   ├── ui/               # Shared primitives (Button, Panel, Field,
│   │   │                     #   Badge, DataRow, Dialog, ProbabilityBar)
│   │   ├── Navbar.tsx        # Institutional masthead
│   │   ├── StageNav.tsx      # Progress-derived stage rail
│   │   ├── IdentifierInputSection.tsx  # Stage 1 - four-register record pull
│   │   ├── VerificationSlip.tsx        # Stage 2 - printable verified record
│   │   ├── CollegeRecommendationList.tsx # Stage 3 - cutoff feasibility
│   │   ├── CollegeDetailModal.tsx      # Stage 3 - full college record
│   │   ├── OptionEntryStudio.tsx       # Stage 4 - priority ordering
│   │   └── RoundSimulator.tsx          # Stage 5 - allotment rounds
│   ├── data/
│   │   ├── students.json     # Mock student profile (Sagar R Thalavar)
│   │   └── colleges.json     # 10 curated Karnataka Engineering Institutions
│   ├── lib/
│   │   └── recommendation.ts # Cutoff analysis & probability engine
│   └── types/
│       └── index.ts          # TypeScript interfaces & types
├── DESIGN.md                 # Design system specifications & rules
├── PRODUCT.md                # Product requirements & vision
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites
* Node.js 18.18+ or 20+
* npm, pnpm, or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/sagar-thalavar/College-Seat-Allotment.git

# Navigate into project directory
cd College-Seat-Allotment

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to explore the portal.

### Production Build

```bash
# Compile optimized production bundle
npm run build

# Start production server
npm start
```

---

## Design Principles

1. **Ink Does the Work; Oxide Marks Consequence**: Primary actions are near-black, because a state instrument's default action should be sober. The oxide red is spent only on the masthead rule, the current stage, verification seals, and irreversible actions.
2. **Structure From Rules, Not Shadows**: Content never floats. Box-shadow exists on exactly one component - the dialog - because an overlay genuinely sits above the page.
3. **Probability Is Never Colour-Coded**: No green/amber/red tiers. A red "Ambitious" badge tells a frightened student their dream college is an error; it is not, it is a stretch. Magnitude is drawn as magnitude.
4. **Measured Contrast**: Every text pair is computed, not eyeballed. `ink` on `ground` is 17.7:1; the lightest text on the surface is 5.8:1, and there is no lighter grey to reach for.
5. **Keyboard Is Not Optional**: Anything reorderable by mouse is reorderable by keyboard, with every move announced in a polite live region. Touch targets are at least 44px.

Full rationale, tokens and named rules live in [DESIGN.md](DESIGN.md).

---

## License

MIT License.
