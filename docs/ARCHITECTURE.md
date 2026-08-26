# Architecture Overview: College Seat Allotment

## System Summary

**College Seat Allotment** is a client-side web application designed to solve the bureaucratic fatigue and form friction of Karnataka's Diploma Common Entrance Test (DCET) lateral-entry engineering counseling.

---

## 1. Zero-Form Identity Pipeline

Instead of requesting 50+ manual inputs across personal, academic, caste, and exam forms, the system uses 4 statutory identifiers:

1. **Aadhaar Number (DigiLocker Integration)**:
   * Resolves: Legal Name, Date of Birth, Gender, Parents' Names, Domicile Address.
2. **Academic Registries (KSEEB & DTE Karnataka)**:
   * Input: SSLC Roll Number & Diploma USN.
   * Resolves: 10th Board Marks, 6-Semester Diploma Marks, Aggregate Percentage, Eligible Engineering Disciplines.
3. **Revenue Department (Nadakacheri RD Numbers)**:
   * Input: Caste Certificate RD No & Income Certificate RD No.
   * Resolves: Caste Category (3A, 2A, SC, ST, GM), Annual Family Income, Supernumerary Quota (SNQ) Fee Waiver Eligibility (Auto-approved for annual income $\le$ ₹8,00,000).
4. **DCET Scorecard Integration**:
   * Input: DCET Roll Number & State Merit Rank.
   * Resolves: Verified State Rank and triggers the historical cutoff calculation.

---

## 2. Minimalist Priority Studio

* **Reordering Algorithm**: 1-indexed priority sequence (`priority: 1..N`).
* **Interactive Controls**: Minimal Up, Down, and Delete buttons designed with $\ge 44\text{px} \times 44\text{px}$ touch bounding boxes.
* **Deterministic Sequencing**: Choices evaluated strictly from `#1` downwards.

---

## 3. Visual System Tokens

* **Foundational Palette**:
  * Canvas: `#FCFBF9`
  * Sunny Yellow Card: `#FEF08A` (Border: `#EAB308`)
  * Pure White Card: `#FFFFFF` (Border: `#E4E4E7`)
  * Text Ink: `#09090B` (100% Black/Zinc contrast)
* **Pill Tokens**:
  * Active Yellow Action Pill: `bg-[#FDE047] text-[#09090B]`
  * Focus Dark Pill: `bg-[#09090B] text-[#FFFFFF]`
* **Typography**:
  * Clean System Sans-serif (Inter fallback), with monospace tabular numbers (`.tabular-nums`) for codes, ranks, and fees.
