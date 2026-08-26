# College Seat Allotment

> A streamlined, zero-form lateral entry engineering seat preference and credential verification portal for Karnataka admissions.

---

## Overview

Traditional engineering lateral entry admission portals often force candidates to fill dozens of redundant form fields, search through 200-page unsearchable cutoff PDFs, and navigate cluttered interfaces.

**College Seat Allotment** modernizes this workflow with:
* **Zero-Form Digital Verification**: Resolves student identity, polytechnic marks, caste/income reservation certificates, and state entrance rank using just **4 statutory identifiers** (Aadhaar, Diploma USN/SSLC, Nadakacheri RD Numbers, and DCET Merit Rank).
* **Minimalist 2-Tone Visual System**: Built with an ultra-clean **Sunny Yellow** (`#FEF08A`) and **Pure White** (`#FFFFFF`) palette, bold high-contrast typography (`#09090B`), and zero visual noise.
* **Instant Priority Reordering**: Clean 1-to-10 college preference studio with minimum 44px mobile touch targets and quick reordering.

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
├── docs/                     # Technical architecture & plans
│   ├── ARCHITECTURE.md
│   └── IMPLEMENTATION_PLAN.md
├── src/
│   ├── app/
│   │   ├── globals.css       # Yellow & White design tokens
│   │   ├── layout.tsx        # Root metadata layout
│   │   └── page.tsx          # 2-step unified controller
│   ├── components/
│   │   ├── Navbar.tsx        # Top header & step navigation
│   │   ├── IdentifierInputSection.tsx  # 4-card progressive input bar
│   │   ├── OptionEntryStudio.tsx       # Minimal priority reorder list
│   │   ├── CollegeDetailModal.tsx      # In-depth college details modal
│   │   └── DemoPersonaBar.tsx          # Candidate preset bar
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

1. **Human First**: Clean, real software craft with zero AI cliches (no purple/cyan gradients, no glowing drop-shadows).
2. **Minimalist Palette**: Pure White (`#FFFFFF`) surfaces with Sunny Yellow (`#FEF08A`) focal cards and high-contrast black ink (`#09090B`).
3. **Strict Accessibility**: Zero emojis, zero em-dashes, minimum 44px mobile touch targets, and full WCAG AAA contrast compliance.
4. **Fast & Lean**: Sub-second builds with pure client-side deterministic evaluation.

---

## License

MIT License.
