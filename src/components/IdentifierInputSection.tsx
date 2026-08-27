'use client';

import React, { useEffect, useReducer, useState } from 'react';
import { Check, MousePointerClick } from 'lucide-react';
import collegesData from '@/data/colleges.json';
import { College, StudentProfile } from '@/types';
import { Badge, Button, DataRow, Panel } from '@/components/ui';

interface IdentifierInputSectionProps {
  student: StudentProfile;
  onProceed: () => void;
}

type RegisterId = 'identity' | 'academics' | 'entitlements' | 'rank';
type RegisterStatus = 'empty' | 'waiting' | 'reading' | 'verified';

interface RecordRow {
  label: string;
  value: string;
  mono?: boolean;
  source?: string;
}

interface RegisterDescriptor {
  id: RegisterId;
  title: string;
  note: string;
  spokenName: string;
  rows: (student: StudentProfile) => RecordRow[];
  extra?: (student: StudentProfile) => React.ReactNode;
}

const SNQ_INCOME_CEILING = 800000;
const REGISTER_STEP_MS = 300;

const INDIAN_NUMBER = new Intl.NumberFormat('en-IN');

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatRupees(amount: number): string {
  return `₹${INDIAN_NUMBER.format(amount)}`;
}

function formatRank(rank: number): string {
  return INDIAN_NUMBER.format(rank);
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  const name = MONTHS[month - 1];
  if (!year || !name || !day) return iso;
  return `${day} ${name} ${year}`;
}

function readFeeSpread() {
  const branches = (collegesData as College[]).flatMap((college) => college.branches);
  const fullFees = branches.map((branch) => branch.annualTuitionFee);
  const snqFees = branches.map((branch) => branch.snqAnnualFee);
  const savings = branches.map((branch) => branch.annualTuitionFee - branch.snqAnnualFee);

  return {
    fullLow: Math.min(...fullFees),
    fullHigh: Math.max(...fullFees),
    snqLow: Math.min(...snqFees),
    snqHigh: Math.max(...snqFees),
    saveLow: Math.min(...savings),
    saveHigh: Math.max(...savings),
  };
}

const FEE_SPREAD = readFeeSpread();

interface QuotaNote {
  code: string;
  title: string;
  meaning: string;
  figure?: string;
}

function describeQuota(code: string, student: StudentProfile): QuotaNote {
  const { casteCategory, annualIncome } = student.reservations;

  if (code === 'SNQ') {
    return {
      code,
      title: 'Supernumerary quota — a private seat at the government fee',
      meaning: `Your family income is ${formatRupees(annualIncome)}, under the ${formatRupees(SNQ_INCOME_CEILING)} ceiling, so a private college bills you at the government rate.`,
      figure: `${formatRupees(FEE_SPREAD.snqLow)}–${formatRupees(FEE_SPREAD.snqHigh)} a year instead of ${formatRupees(FEE_SPREAD.fullLow)}–${formatRupees(FEE_SPREAD.fullHigh)} — between ${formatRupees(FEE_SPREAD.saveLow)} and ${formatRupees(FEE_SPREAD.saveHigh)} less every year you study.`,
    };
  }

  if (code === '3AR') {
    return {
      code,
      title: '3A Rural quota',
      meaning: '15% of government and government-quota seats are reserved for candidates who studied 1st to 10th standard in rural Karnataka schools.',
    };
  }

  return {
    code,
    title: `Category ${casteCategory}`,
    meaning: 'State-wide reservation pool for your caste group.',
  };
}

const REGISTERS: RegisterDescriptor[] = [
  {
    id: 'identity',
    title: 'Identity',
    note: 'Aadhaar record, read from DigiLocker.',
    spokenName: 'DigiLocker identity',
    rows: (s) => [
      { label: 'Aadhaar number', value: `XXXX XXXX ${s.aadhaarNumber.replace(/\s/g, '').slice(-4)}`, mono: true },
      { label: 'Full name', value: s.name },
      { label: 'Date of birth', value: formatDate(s.dob) },
      { label: 'Gender', value: s.gender },
      { label: "Father's name", value: s.fatherName },
      { label: "Mother's name", value: s.motherName },
      {
        label: 'Permanent address',
        value: `${s.address.line}, ${s.address.taluk}, ${s.address.district}, ${s.address.state} — ${s.address.pincode}`,
      },
    ],
  },
  {
    id: 'academics',
    title: 'Academic record',
    note: 'Diploma and SSLC records from DTE and KSEEB.',
    spokenName: 'DTE and KSEEB academic record',
    rows: (s) => [
      { label: 'Diploma college', value: s.academic.diplomaCollege },
      { label: 'Diploma branch', value: s.academic.diplomaBranch },
      { label: 'Diploma USN', value: s.academic.diplomaUsn, mono: true },
      {
        label: 'Diploma aggregate',
        value: `${s.academic.aggregatePercentage}%`,
        mono: true,
        source: `Passed ${s.academic.diplomaPassingYear}`,
      },
      {
        label: 'SSLC marks',
        value: `${s.academic.sslcSecuredMarks} / ${s.academic.sslcMaxMarks} (${s.academic.sslcPercentage}%)`,
        mono: true,
        source: `Roll ${s.academic.sslcRollNo}, passed ${s.academic.sslcPassingYear}`,
      },
      {
        label: 'SSLC school area',
        value: s.academic.isRuralSchool ? 'Rural' : 'Urban',
        source: s.reservations.isRuralQuota ? 'Qualifies for rural quota' : undefined,
      },
    ],
  },
  {
    id: 'entitlements',
    title: 'Caste, income & reservations',
    note: 'Certificates verified against Nadakacheri.',
    spokenName: 'Nadakacheri reservation certificates',
    rows: (s) => [
      {
        label: 'Caste category',
        value: `${s.reservations.casteCategory} (${s.reservations.subCaste})`,
        source: `RD ${s.reservations.casteRdNumber}`,
      },
      {
        label: 'Annual family income',
        value: formatRupees(s.reservations.annualIncome),
        mono: true,
        source: `RD ${s.reservations.incomeRdNumber}`,
      },
      {
        label: 'Rural quota',
        value: s.reservations.isRuralQuota ? 'Verified' : 'Not claimed',
      },
      {
        label: 'Kannada medium quota',
        value: s.reservations.isKannadaMediumQuota ? 'Verified' : 'Not claimed',
      },
      {
        label: 'Article 371J (Kalyana-Karnataka)',
        value: s.reservations.isKalyanaKarnataka ? 'Verified' : 'Not applicable',
      },
    ],
    extra: (s) => (
      <div className="mt-4 border-t border-hairline pt-3">
        <h4 className="text-label font-medium text-ink-soft">Verified seat pools</h4>
        <ul className="mt-2 space-y-2">
          {s.verification.verifiedCodes.map((code) => {
            const quota = describeQuota(code, s);
            return (
              <li key={code} className="flex gap-2.5 items-baseline">
                <Badge mono className="shrink-0">{code}</Badge>
                <div className="text-sm text-ink-soft">
                  <span className="font-medium text-ink">{quota.title}</span> — {quota.meaning}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    ),
  },
  {
    id: 'rank',
    title: 'DCET-2026 examination',
    note: 'Official merit rank from Karnataka Examinations Authority.',
    spokenName: 'KEA DCET rank',
    rows: (s) => [
      { label: 'DCET roll number', value: s.exam.dcetRollNo, mono: true },
      { label: 'State-wide rank', value: `Rank ${formatRank(s.exam.dcetRank)}`, mono: true },
      { label: 'DCET score', value: `${s.exam.score} / 100`, mono: true },
      { label: 'Exam centre', value: s.exam.examCenter },
    ],
  },
];

interface RecordState {
  phase: 'empty' | 'pulling' | 'pulled';
  answered: RegisterId[];
}

type RecordAction =
  | { type: 'pull' }
  | { type: 'answer'; registerId: RegisterId }
  | { type: 'clear' };

function reduceRecord(state: RecordState, action: RecordAction): RecordState {
  switch (action.type) {
    case 'pull':
      return { phase: 'pulling', answered: [] };
    case 'answer': {
      const answered = [...state.answered, action.registerId];
      const phase = answered.length === REGISTERS.length ? 'pulled' : 'pulling';
      return { phase, answered };
    }
    case 'clear':
      return { phase: 'empty', answered: [] };
  }
}

const RegisterStatusBadge: React.FC<{ status: RegisterStatus }> = ({ status }) => {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 text-micro font-medium text-pine">
        <Check aria-hidden className="size-3" />
        Verified
      </span>
    );
  }
  if (status === 'reading') {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-micro text-oxide">
        <span aria-hidden className="size-1.5 rounded-full bg-oxide animate-ping" />
        Reading…
      </span>
    );
  }
  return <span className="font-mono text-micro text-ink-off">Not read</span>;
};

const SkeletonRows: React.FC<{ count: number }> = ({ count }) => (
  <div className="space-y-2.5 py-1">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex justify-between items-center py-1.5 border-b border-hairline/60">
        <div className="h-3 w-28 rounded-xs bg-hairline animate-pulse" />
        <div className="h-3.5 w-44 rounded-xs bg-hairline animate-pulse" />
      </div>
    ))}
  </div>
);

const RegisterSection: React.FC<{
  register: RegisterDescriptor;
  student: StudentProfile;
  status: RegisterStatus;
}> = ({ register, student, status }) => {
  const rows = register.rows(student);
  const isVerified = status === 'verified';
  const isPending = status === 'reading' || status === 'waiting';

  return (
    <Panel
      headingLevel="h3"
      title={register.title}
      note={register.note}
      aside={<RegisterStatusBadge status={status} />}
    >
      <div>
        {isPending && <SkeletonRows count={rows.length} />}

        {status === 'empty' && (
          <dl>
            {rows.map((row) => (
              <DataRow
                key={row.label}
                label={row.label}
                value={<span className="text-ink-off">—</span>}
              />
            ))}
          </dl>
        )}

        {isVerified && (
          <div style={{ animation: 'row-settle var(--dur-slow) var(--ease-out-quart) both' }}>
            <dl>
              {rows.map((row) => (
                <DataRow
                  key={row.label}
                  label={row.label}
                  value={row.value}
                  mono={row.mono}
                  source={row.source}
                  className="break-words"
                />
              ))}
            </dl>
            {register.extra?.(student)}
          </div>
        )}
      </div>
    </Panel>
  );
};

export const IdentifierInputSection: React.FC<IdentifierInputSectionProps> = ({
  student,
  onProceed,
}) => {
  const [record, dispatch] = useReducer(reduceRecord, { phase: 'empty', answered: [] });

  const [shimmerKey, setShimmerKey] = useState<number>(0);

  useEffect(() => {
    // Initial gentle shimmer on arrival
    setShimmerKey(1);
    // Second gentle shimmer at 5 seconds
    const timer = window.setTimeout(() => {
      setShimmerKey(2);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (record.phase !== 'pulling') return;

    const timers = REGISTERS.map((register, index) =>
      window.setTimeout(
        () =>
          dispatch({
            type: 'answer',
            registerId: register.id,
          }),
        (index + 1) * REGISTER_STEP_MS,
      ),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [record.phase]);

  const statusOf = (index: number): RegisterStatus => {
    if (index < record.answered.length) return 'verified';
    if (record.phase !== 'pulling') return 'empty';
    return index === record.answered.length ? 'reading' : 'waiting';
  };

  const nextRegister = REGISTERS[record.answered.length];

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold tracking-[-0.015em] text-ink">Your record</h2>
      </header>

      {/* Candidate Verification Gate — Non-editable Pre-filled Credentials */}
      <div className="rounded-sm border border-hairline bg-panel p-4 sm:p-5 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-ink">Candidate Verification Gate</h3>
          <p className="mt-0.5 text-label text-ink-muted">
            Enter your 4 primary identifiers to automatically pull your complete dossier from DigiLocker, DTE, KSEEB, and Nadakacheri.
          </p>
        </div>

        {/* The 4 Non-Editable Pre-filled Input Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* 1. Application No */}
          <div>
            <label className="block text-label font-medium text-ink mb-1">
              Application No / DCET No
            </label>
            <input
              type="text"
              readOnly
              disabled
              value={student.exam.dcetRollNo}
              className="w-full h-9 rounded-sm border border-field/70 bg-sunken px-2.5 font-mono text-sm text-ink opacity-90 cursor-not-allowed"
            />
          </div>

          {/* 2. Date of Birth */}
          <div>
            <label className="block text-label font-medium text-ink mb-1">
              Date of Birth (DOB)
            </label>
            <input
              type="text"
              readOnly
              disabled
              value={student.dob}
              className="w-full h-9 rounded-sm border border-field/70 bg-sunken px-2.5 font-mono text-sm text-ink opacity-90 cursor-not-allowed"
            />
          </div>

          {/* 3. Category */}
          <div>
            <label className="block text-label font-medium text-ink mb-1">
              Caste Category
            </label>
            <input
              type="text"
              readOnly
              disabled
              value={`Category ${student.reservations.casteCategory.replace(/G$/, '')}`}
              className="w-full h-9 rounded-sm border border-field/70 bg-sunken px-2.5 text-sm text-ink opacity-90 cursor-not-allowed"
            />
          </div>

          {/* 4. Special Quotas */}
          <div>
            <label className="block text-label font-medium text-ink mb-1">
              Special Quotas
            </label>
            <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1.5 opacity-90">
              <label className="inline-flex items-center gap-1.5 text-label text-ink cursor-not-allowed">
                <input
                  type="checkbox"
                  disabled
                  checked={student.reservations.isRuralQuota}
                  className="size-3.5 accent-ink cursor-not-allowed"
                />
                Rural
              </label>
              <label className="inline-flex items-center gap-1.5 text-label text-ink cursor-not-allowed">
                <input
                  type="checkbox"
                  disabled
                  checked={student.reservations.isKannadaMediumQuota}
                  className="size-3.5 accent-ink cursor-not-allowed"
                />
                Kannada
              </label>
              <label className="inline-flex items-center gap-1.5 text-label text-ink cursor-not-allowed">
                <input
                  type="checkbox"
                  disabled
                  checked={student.reservations.isKalyanaKarnataka}
                  className="size-3.5 accent-ink cursor-not-allowed"
                />
                371J
              </label>
            </div>
          </div>
        </div>

        {/* Primary CTA and resolution status */}
        <div className="border-t border-hairline pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {record.phase === 'pulled' ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={onProceed}
                className="group relative overflow-hidden animate-click-nudge inline-flex items-center justify-center px-7 py-3 rounded-sm bg-ink text-ground text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
              >
                <span className="relative z-10 tracking-wide">Continue</span>
                {/* Continuous tilted shimmer sweep reflection with 1s pause buffer */}
                <span
                  className="pointer-events-none absolute -inset-y-4 -left-1/3 w-2/3 -skew-x-[25deg] animate-continuous-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent ease-out"
                />
              </button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => dispatch({ type: 'clear' })}
                className="w-full sm:w-auto"
              >
                Clear and start over
              </Button>
            </div>
          ) : (
            <div className="flex items-center">
              <button
                type="button"
                disabled={record.phase === 'pulling'}
                onClick={() => dispatch({ type: 'pull' })}
                className="group relative overflow-hidden animate-click-nudge inline-flex items-center justify-center px-7 py-3 rounded-sm bg-ink text-ground text-sm font-medium transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                <span className="relative z-10 font-semibold tracking-wide">
                  {record.phase === 'pulling' ? 'Reading registers...' : 'Get details'}
                </span>
                {/* Continuous tilted shimmer sweep reflection with 1s pause buffer */}
                <span
                  className="pointer-events-none absolute -inset-y-4 -left-1/3 w-2/3 -skew-x-[25deg] animate-continuous-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent ease-out"
                />
              </button>
            </div>
          )}

          <p className="measure text-label text-ink-muted">
            {record.phase === 'pulling' && nextRegister
              ? `Reading ${nextRegister.spokenName}...`
              : record.phase === 'pulled'
              ? 'All 4 government registers verified.'
              : 'Click to pull the complete verified record.'}
          </p>
        </div>
      </div>

      {/* Verified Document Registers (Only visible once "Get details" is clicked) */}
      {record.phase !== 'empty' && (
        <div className="space-y-4 animate-[row-settle_var(--dur-base)_var(--ease-out-quart)]">
          {REGISTERS.map((register, index) => (
            <RegisterSection
              key={register.id}
              register={register}
              student={student}
              status={statusOf(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
