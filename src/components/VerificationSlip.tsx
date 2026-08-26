'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { ArrowRight, Check, Copy, Printer } from 'lucide-react';
import { StudentProfile } from '@/types';
import { Badge, Button, DataRow, Seal } from '@/components/ui';
import collegesData from '@/data/colleges.json';

interface VerificationSlipProps {
  student: StudentProfile;
  onProceedToColleges: () => void;
}

/* ------------------------------------------------------------------ */
/* Formatting. A record is only trustworthy if its figures are exact.  */
/* ------------------------------------------------------------------ */

const RUPEES = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

/** ₹1,26,000 — Indian grouping, never 126,000. */
function rupees(amount: number): string {
  return `₹${RUPEES.format(Math.round(amount))}`;
}

function count(value: number): string {
  return RUPEES.format(value);
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** 2026-08-18 → "18 August 2026". Never 08/18 — the ambiguity is the bug. */
function longDate(iso: string): string {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!parts) return iso;
  const month = Number(parts[2]);
  if (month < 1 || month > 12) return iso;
  return `${Number(parts[3])} ${MONTHS[month - 1]} ${parts[1]}`;
}

/**
 * Aadhaar is printed on paper that gets carried to a helpline desk and left
 * on tables. Only the last four digits ever leave this function.
 */
function maskAadhaar(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length <= 4) return 'XXXX';
  const hiddenGroups = Math.ceil((digits.length - 4) / 4);
  return [...Array<string>(hiddenGroups).fill('XXXX'), digits.slice(-4)].join(' ');
}

/* ------------------------------------------------------------------ */
/* What the fee waiver is actually worth, read off the real fee table. */
/* ------------------------------------------------------------------ */

const SNQ_WORTH = (() => {
  const savings: number[] = [];
  const fullFees: number[] = [];
  const cappedFees: number[] = [];
  for (const college of collegesData) {
    for (const branch of college.branches) {
      fullFees.push(branch.annualTuitionFee);
      cappedFees.push(branch.snqAnnualFee);
      savings.push(branch.annualTuitionFee - branch.snqAnnualFee);
    }
  }
  return {
    lowestFull: Math.min(...fullFees),
    highestFull: Math.max(...fullFees),
    lowestCapped: Math.min(...cappedFees),
    highestCapped: Math.max(...cappedFees),
    smallestSaving: Math.min(...savings),
    largestSaving: Math.max(...savings),
  };
})();

/** Lateral entry starts in the second year, so the waiver runs three years. */
const COURSE_YEARS = 3;

/* ------------------------------------------------------------------ */
/* Local pieces, in the same idiom as the shared primitives.           */
/* ------------------------------------------------------------------ */

interface RecordItem {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  source?: string;
}

/**
 * Two balanced definition lists, not one grid — so every row keeps its own
 * hairline and the two columns end level instead of one trailing rule short.
 */
const RecordGrid: React.FC<{ items: RecordItem[] }> = ({ items }) => {
  const half = Math.ceil(items.length / 2);
  const columns = [items.slice(0, half), items.slice(half)];

  return (
    <div className="grid gap-x-10 sm:grid-cols-2">
      {columns.map((column, index) => (
        <dl key={index} className="min-w-0">
          {column.map((item) => (
            <DataRow
              key={item.label}
              label={item.label}
              value={item.value}
              mono={item.mono}
              source={item.source}
              className="[&>dd]:break-words"
            />
          ))}
        </dl>
      ))}
    </div>
  );
};

const SheetSection: React.FC<{
  title: string;
  note?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, note, children, className }) => (
  <section
    className={clsx(
      'border-b border-hairline px-4 py-5 last:border-b-0 sm:px-6',
      className,
    )}
  >
    <h3 className="text-sm font-semibold text-ink">{title}</h3>
    {note && <p className="measure mt-0.5 text-label text-ink-muted">{note}</p>}
    <div className="mt-3">{children}</div>
  </section>
);

/* ------------------------------------------------------------------ */

/**
 * The slip is a document first and a screen second. Everything a student
 * needs at a helpline desk is on the printed sheet; everything that only
 * works on a screen carries `no-print`.
 */
export const VerificationSlip: React.FC<VerificationSlipProps> = ({
  student,
  onProceedToColleges,
}) => {
  const { academic, reservations, exam, verification, address } = student;

  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const copySecretKey = useCallback(async () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(verification.secretKey);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
    resetTimer.current = setTimeout(() => setCopyState('idle'), 4000);
  }, [verification.secretKey]);

  const verifiedOn = longDate(verification.verificationDate);
  const sealDate = verification.verificationDate.split('-').reverse().join('-');
  const rank = count(exam.dcetRank);

  const codeMeanings: Record<string, string> = {
    [reservations.casteCategory]:
      `Category ${reservations.casteCategory.replace(/G$/, '')} — ${reservations.subCaste}, state-wide seats`,
    [`${reservations.casteCategory.replace(/G$/, '')}R`]:
      'The same category under the rural quota — you studied 1st to 10th standard in a rural school',
    SNQ: 'Supernumerary quota — your tuition is capped at the government rate',
    [`${reservations.casteCategory.replace(/G$/, '')}HK`]:
      'The same category under Article 371J, for Kalyana-Karnataka districts',
  };

  const fullAddress = [
    address.line,
    address.taluk,
    address.district,
    `${address.state} ${address.pincode}`,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="space-y-6">
      {/* Screen-only: what this is and how to keep a copy of it. */}
      <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <p className="measure text-sm text-ink-soft">
          Your documents cleared verification on {verifiedOn}. This slip is the
          record of it. Print it or save it as a PDF — {verification.helplineCenter}{' '}
          will ask to see it, and so will the college on the day you report.
        </p>
        <Button
          variant="secondary"
          onClick={() => window.print()}
          className="shrink-0 self-start sm:self-auto"
        >
          <Printer aria-hidden className="size-3.5" />
          Print or save as PDF
        </Button>
      </div>

      <article className="print-sheet rounded-sm border border-rule bg-ground">
        {/* Masthead */}
        <header className="flex items-start justify-between gap-4 border-b border-hairline bg-panel px-4 py-5 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-[-0.01em] text-ink sm:text-2xl">
              Document verification slip
            </h2>
            <p className="mt-0.5 text-sm text-ink-soft">
              Diploma CET 2026 · Lateral entry to engineering
            </p>
            <dl className="mt-3 space-y-0.5 text-label text-ink-muted">
              <div className="flex flex-wrap gap-x-1.5">
                <dt>Verified on</dt>
                <dd className="font-mono tabular-nums text-ink-soft" data-numeric>
                  {verifiedOn}
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-1.5">
                <dt>Helpline centre</dt>
                <dd className="text-ink-soft">{verification.helplineCenter}</dd>
              </div>
            </dl>
          </div>
          <Seal mark="VERIFIED" date={sealDate} caption="DCET 2026" />
        </header>

        {/* The secret key. Nothing else on this sheet is as costly to lose. */}
        <section className="border-b border-hairline px-4 py-5 sm:px-6">
          <h3 className="text-sm font-semibold text-ink">Your secret key</h3>
          <p className="measure mt-0.5 text-label text-ink-soft">
            Every step after this one asks for this key — entering your option
            list, opening each round result, paying the fee, and the helpline
            desk if you ever need to change something. It is issued once and is
            not sent again. Write it somewhere you will still have it in October.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p
              className="select-all rounded-sm border border-rule bg-sunken px-3 py-2.5 font-mono text-lg font-semibold tracking-[0.16em] text-ink tabular-nums sm:text-2xl"
              data-numeric
            >
              {verification.secretKey}
            </p>
            <Button
              variant="secondary"
              onClick={copySecretKey}
              className="no-print"
            >
              {copyState === 'copied' ? (
                <Check aria-hidden className="size-3.5 text-pine" />
              ) : (
                <Copy aria-hidden className="size-3.5" />
              )}
              {copyState === 'copied' ? 'Copied' : 'Copy key'}
            </Button>
          </div>

          <p
            aria-live="polite"
            className={clsx(
              'no-print mt-2 min-h-4 text-label',
              copyState === 'failed' ? 'text-oxide-deep' : 'text-ink-muted',
            )}
          >
            {copyState === 'copied' &&
              'Secret key copied to your clipboard. Paste it somewhere you will not lose.'}
            {copyState === 'failed' &&
              'This browser blocked the copy. Tap the key above to select it, then copy it by hand.'}
          </p>
        </section>

        {/* Entrance result — the number every later screen is measured against. */}
        <SheetSection title="Diploma CET result">
          <RecordGrid
            items={[
              { label: 'DCET rank', value: rank, mono: true, source: 'State-wide, all candidates' },
              { label: 'Score', value: `${exam.score} / 100`, mono: true },
              { label: 'DCET roll number', value: exam.dcetRollNo, mono: true },
              { label: 'Exam centre', value: exam.examCenter },
            ]}
          />
        </SheetSection>

        {/* Candidate */}
        <SheetSection title="Candidate">
          <RecordGrid
            items={[
              { label: 'Name', value: student.name },
              { label: "Father's name", value: student.fatherName },
              { label: 'Date of birth', value: longDate(student.dob), mono: true },
              { label: "Mother's name", value: student.motherName },
              { label: 'Gender', value: student.gender },
              {
                label: 'Aadhaar',
                value: maskAadhaar(student.aadhaarNumber),
                mono: true,
                source: 'Last four digits only',
              },
              { label: 'Address', value: fullAddress },
              { label: 'Phone', value: student.phone, mono: true },
            ]}
          />
        </SheetSection>

        {/* Academic record */}
        <SheetSection
          title="Academic record"
          note="Your diploma branch decides which engineering branches you may apply to. Your SSLC school decides the rural quota."
        >
          <RecordGrid
            items={[
              { label: 'Diploma college', value: academic.diplomaCollege },
              { label: 'Diploma branch', value: academic.diplomaBranch },
              { label: 'Diploma USN', value: academic.diplomaUsn, mono: true },
              {
                label: 'Diploma aggregate',
                value: `${academic.aggregatePercentage}%`,
                mono: true,
                source: `${academic.diplomaBoard}, passed ${academic.diplomaPassingYear}`,
              },
              { label: 'SSLC roll number', value: academic.sslcRollNo, mono: true },
              {
                label: 'SSLC marks',
                value: `${count(academic.sslcSecuredMarks)} / ${count(academic.sslcMaxMarks)} · ${academic.sslcPercentage}%`,
                mono: true,
                source: `${academic.sslcBoard}, passed ${academic.sslcPassingYear}`,
              },
              {
                label: 'School location',
                value: academic.isRuralSchool ? 'Rural' : 'Urban',
                source: academic.isRuralSchool
                  ? 'Qualifies you for the rural quota'
                  : 'Rural quota not available',
              },
              {
                label: 'Final semester',
                value: academic.isFinalSemPending ? 'Result pending' : 'Complete',
              },
            ]}
          />
        </SheetSection>

        {/* Reservations */}
        <SheetSection
          title="Verified reservations"
          note="Each code below is a separate seat pool. You are considered in all of them at once and allotted under whichever one your rank clears first."
        >
          <RecordGrid
            items={[
              {
                label: 'Caste category',
                value: `${reservations.casteCategory} · ${reservations.subCaste}`,
                source: `Caste certificate ${reservations.casteRdNumber}`,
              },
              {
                label: 'Annual family income',
                value: rupees(reservations.annualIncome),
                mono: true,
                source: `Income certificate ${reservations.incomeRdNumber}`,
              },
              {
                label: 'Rural quota',
                value: reservations.isRuralQuota ? 'Verified' : 'Not claimed',
              },
              {
                label: 'Kannada medium quota',
                value: reservations.isKannadaMediumQuota ? 'Verified' : 'Not claimed',
              },
              {
                label: 'Article 371J',
                value: reservations.isKalyanaKarnataka
                  ? `Verified · ${reservations.kalyanaKarnatakaDistrict ?? 'Kalyana-Karnataka'}`
                  : 'Not applicable',
                source: reservations.isKalyanaKarnataka
                  ? reservations.kalyanaKarnatakaRdNumber
                  : `${address.district} is outside the Kalyana-Karnataka region`,
              },
              {
                label: 'Persons with disability',
                value: reservations.isPwd
                  ? `Verified · UDID ${reservations.pwdUdid ?? 'on record'}`
                  : 'Not claimed',
              },
            ]}
          />

          <ul className="mt-5 space-y-0 border-t border-hairline">
            {verification.verifiedCodes.map((code) => (
              <li
                key={code}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-hairline py-2.5 last:border-b-0"
              >
                <Badge tone="verified" mono className="shrink-0">
                  {code}
                </Badge>
                <span className="min-w-0 flex-1 text-sm text-ink-soft">
                  {codeMeanings[code] ?? 'Verified at the helpline centre.'}
                </span>
              </li>
            ))}
          </ul>
        </SheetSection>

        {/* What SNQ is worth, in rupees, off the real fee table. */}
        <SheetSection
          title={
            reservations.isSnqEligible
              ? 'What the fee waiver saves you'
              : 'Fee waiver (SNQ)'
          }
        >
          {reservations.isSnqEligible ? (
            <div className="space-y-3">
              <p className="measure text-sm text-ink-soft">
                Your verified family income of{' '}
                <span className="font-mono tabular-nums text-ink" data-numeric>
                  {rupees(reservations.annualIncome)}
                </span>{' '}
                is under the {rupees(800000)} ceiling, so the supernumerary quota
                caps your tuition at the government rate wherever you are allotted.
              </p>
              <dl className="border-t border-hairline">
                <DataRow
                  label="Tuition without the waiver"
                  value={`${rupees(SNQ_WORTH.lowestFull)} – ${rupees(SNQ_WORTH.highestFull)} a year`}
                  mono
                  source="Across the colleges open to your diploma branch"
                />
                <DataRow
                  label="Tuition with the waiver"
                  value={`${rupees(SNQ_WORTH.lowestCapped)} – ${rupees(SNQ_WORTH.highestCapped)} a year`}
                  mono
                />
                <DataRow
                  label="Saved each year"
                  value={`${rupees(SNQ_WORTH.smallestSaving)} – ${rupees(SNQ_WORTH.largestSaving)}`}
                  mono
                />
                <DataRow
                  label={`Saved over ${COURSE_YEARS} years`}
                  value={`${rupees(SNQ_WORTH.smallestSaving * COURSE_YEARS)} – ${rupees(SNQ_WORTH.largestSaving * COURSE_YEARS)}`}
                  mono
                  source="Lateral entry begins in the second year"
                />
              </dl>
            </div>
          ) : (
            <p className="measure text-sm text-ink-soft">
              The supernumerary quota caps tuition at the government rate for
              families earning up to {rupees(800000)} a year. Your verified income
              of{' '}
              <span className="font-mono tabular-nums text-ink" data-numeric>
                {rupees(reservations.annualIncome)}
              </span>{' '}
              is above that ceiling, so you pay the college&rsquo;s full tuition.
            </p>
          )}
        </SheetSection>

        {/* Attestation */}
        <footer className="flex flex-col gap-4 border-t border-rule bg-panel px-4 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div className="min-w-0 space-y-1">
            <p className="text-label text-ink-soft">
              Verified and attested at {verification.helplineCenter} on{' '}
              <span className="font-mono tabular-nums" data-numeric>
                {verifiedOn}
              </span>
              .
            </p>
            <p className="text-micro text-ink-muted">
              Demonstration build with sample data. Not issued by the Karnataka
              Examinations Authority.
            </p>
          </div>
          <p className="shrink-0 text-label text-ink-muted">
            Slip reference{' '}
            <span className="font-mono tabular-nums text-ink-soft" data-numeric>
              DCET26/{exam.dcetRollNo}/{verification.verificationDate.replace(/-/g, '')}
            </span>
          </p>
        </footer>
      </article>

      {/* Screen-only: the next stage. */}
      <div className="no-print flex flex-col gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="measure text-sm text-ink-soft">
          Verification is what unlocks the cutoff comparison. Every college you
          see next is compared against the codes on this slip, not against
          general merit alone.
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={onProceedToColleges}
          className="shrink-0"
        >
          Find colleges for rank {rank}
          <ArrowRight aria-hidden className="size-4" />
        </Button>
      </div>
    </div>
  );
};
