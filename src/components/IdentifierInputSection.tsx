'use client';

import React, { useEffect, useReducer } from 'react';
import { Check } from 'lucide-react';
import collegesData from '@/data/colleges.json';
import { College, StudentProfile } from '@/types';
import { Badge, Button, DataRow, Field, Panel } from '@/components/ui';

interface IdentifierInputSectionProps {
  student: StudentProfile;
  onProceed: () => void;
}

/* ------------------------------------------------------------------ *
 * The record
 *
 * Four state registers hold one record. They are not four features and
 * they are not four cards: they are four sections of a single document
 * the student is about to sign. Everything below is driven off one
 * descriptor list and one reducer, so a fifth register would be a new
 * entry in an array, not a fifth copy of the same state quadruplet.
 * ------------------------------------------------------------------ */

type RegisterId = 'identity' | 'academics' | 'entitlements' | 'rank';
type RegisterStatus = 'empty' | 'waiting' | 'reading' | 'verified';

interface RegisterField {
  key: string;
  label: string;
  hint: string;
  read: (student: StudentProfile) => string;
}

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
  /** Named in the live region as each register answers. */
  spokenName: string;
  fields: RegisterField[];
  rows: (student: StudentProfile) => RecordRow[];
  extra?: (student: StudentProfile) => React.ReactNode;
}

const SNQ_INCOME_CEILING = 800000;
const REGISTER_STEP_MS = 300;

/* --- Formatting. Rupees and ranks use Indian grouping. --- */

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

/** ISO date to "1 January 2004". Parsed by hand so no timezone shifts it. */
function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  const name = MONTHS[month - 1];
  if (!year || !name || !day) return iso;
  return `${day} ${name} ${year}`;
}

/* --- What the fee waiver is actually worth, read off this year's list. --- */

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

/* --- Quotas, explained in one plain line each. --- */

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

  if (code === casteCategory) {
    return {
      code,
      title: `Category ${code} — you are ranked against your own category`,
      meaning: `Seats kept for ${code} are filled from ${code} candidates only. Your rank is measured against them, not against every candidate in the state.`,
    };
  }

  if (code.endsWith('R')) {
    return {
      code,
      title: `Rural quota — ${code}`,
      meaning: 'You studied 1st to 10th in a rural school, so the rural cutoff for your category also applies. Whichever of the two is easier to reach is the one used.',
    };
  }

  return {
    code,
    title: `${code} — claimed on your verified certificates`,
    meaning: 'KEA has accepted this code against your record.',
  };
}

/* --- The four registers. --- */

const REGISTERS: RegisterDescriptor[] = [
  {
    id: 'identity',
    title: 'Identity',
    note: 'Aadhaar record, read from DigiLocker.',
    spokenName: 'Identity, from DigiLocker',
    fields: [
      {
        key: 'aadhaarNumber',
        label: 'Aadhaar number',
        hint: 'As printed on your card.',
        read: (student) => student.aadhaarNumber,
      },
    ],
    rows: (student) => [
      { label: 'Name', value: student.name },
      { label: 'Date of birth', value: formatDate(student.dob) },
      { label: 'Gender', value: student.gender },
      { label: "Father's name", value: student.fatherName },
      { label: "Mother's name", value: student.motherName },
      {
        label: 'Address',
        value: `${student.address.line}, ${student.address.taluk}, ${student.address.district} ${student.address.pincode}`,
        source: student.address.state,
      },
      { label: 'Mobile', value: student.phone, mono: true },
      { label: 'Email', value: student.email },
    ],
  },
  {
    id: 'academics',
    title: 'Academics',
    note: 'Diploma marks from DTE Karnataka, SSLC marks from the KSEEB board.',
    spokenName: 'Academics, from DTE Karnataka and KSEEB',
    fields: [
      {
        key: 'diplomaUsn',
        label: 'Diploma USN',
        hint: 'On your polytechnic marks card.',
        read: (student) => student.academic.diplomaUsn,
      },
      {
        key: 'sslcRollNo',
        label: 'SSLC register number',
        hint: 'On your 10th marks card.',
        read: (student) => student.academic.sslcRollNo,
      },
    ],
    rows: (student) => [
      { label: 'Diploma branch', value: student.academic.diplomaBranch },
      {
        label: 'Polytechnic',
        value: student.academic.diplomaCollege,
        source: `${student.academic.diplomaDistrict} · ${student.academic.diplomaBoard}`,
      },
      {
        label: 'Diploma aggregate',
        value: `${student.academic.aggregatePercentage}%`,
        mono: true,
        source: `Six semesters averaged · passed ${student.academic.diplomaPassingYear}`,
      },
      {
        label: 'SSLC percentage',
        value: `${student.academic.sslcPercentage}%`,
        mono: true,
        source: `${student.academic.sslcSecuredMarks} of ${student.academic.sslcMaxMarks} marks · ${student.academic.sslcBoard} ${student.academic.sslcPassingYear}`,
      },
      {
        label: 'Result status',
        value: student.academic.isFinalSemPending
          ? 'Sixth semester result awaited'
          : 'All six semesters declared',
      },
      {
        label: 'School',
        value: student.academic.isRuralSchool ? 'Rural, 1st to 10th' : 'Urban',
        source: student.academic.isRuralSchool
          ? 'This is what earns you the rural quota'
          : 'Rural quota does not apply',
      },
      {
        label: 'Kannada medium',
        value: student.academic.isKannadaMedium ? 'Yes' : 'No',
        source: student.academic.isKannadaMedium
          ? 'Kannada-medium quota applies'
          : 'Kannada-medium quota does not apply',
      },
    ],
    extra: (student) => <SemesterMarks marks={student.academic.semMarks} />,
  },
  {
    id: 'entitlements',
    title: 'Category and income',
    note: 'Caste and income certificates from Nadakacheri, matched on their RD numbers.',
    spokenName: 'Category and income, from Nadakacheri',
    fields: [
      {
        key: 'casteRdNumber',
        label: 'Caste certificate RD number',
        hint: 'Printed at the top of the certificate.',
        read: (student) => student.reservations.casteRdNumber,
      },
      {
        key: 'incomeRdNumber',
        label: 'Income certificate RD number',
        hint: 'A separate number from the caste one.',
        read: (student) => student.reservations.incomeRdNumber,
      },
    ],
    rows: (student) => [
      {
        label: 'Category',
        value: student.reservations.casteCategory,
        mono: true,
        source: `${student.reservations.subCaste} · certified by Nadakacheri`,
      },
      {
        label: 'Annual family income',
        value: formatRupees(student.reservations.annualIncome),
        mono: true,
        source: `The fee-waiver ceiling is ${formatRupees(SNQ_INCOME_CEILING)}`,
      },
      {
        label: 'Kalyana-Karnataka',
        value: student.reservations.isKalyanaKarnataka ? 'Yes' : 'No',
        source: student.reservations.isKalyanaKarnataka
          ? 'Article 371J regional reservation applies'
          : 'Article 371J does not cover your district',
      },
    ],
    extra: (student) => <QuotaList student={student} />,
  },
  {
    id: 'rank',
    title: 'DCET 2026 rank',
    note: 'Rank, score and centre from the Karnataka Examinations Authority.',
    spokenName: 'DCET rank, from KEA',
    fields: [
      {
        key: 'dcetRollNo',
        label: 'DCET roll number',
        hint: 'On your admission ticket.',
        read: (student) => student.exam.dcetRollNo,
      },
      {
        key: 'dcetRank',
        label: 'DCET rank',
        hint: 'As published by KEA.',
        read: (student) => String(student.exam.dcetRank),
      },
    ],
    rows: (student) => [
      {
        label: 'Rank',
        value: formatRank(student.exam.dcetRank),
        mono: true,
        source: 'Karnataka lateral-entry rank list',
      },
      { label: 'Score', value: `${student.exam.score} / 100`, mono: true },
      { label: 'Exam centre', value: student.exam.examCenter },
      {
        label: 'Verified at',
        value: student.verification.helplineCenter,
        source: `Checked on ${formatDate(student.verification.verificationDate)}`,
      },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * One reducer for the whole record.
 * ------------------------------------------------------------------ */

type Phase = 'empty' | 'pulling' | 'pulled';

interface RecordState {
  phase: Phase;
  /** Register ids in the order they answered. */
  answered: RegisterId[];
  /** Every editable identifier on the screen, keyed by field key. */
  values: Record<string, string>;
  /** Read out by the polite live region. */
  notice: string;
}

type RecordAction =
  | { type: 'pull' }
  | { type: 'answer'; registerId: RegisterId; values: Record<string, string> }
  | { type: 'edit'; key: string; value: string }
  | { type: 'clear' };

const EMPTY_RECORD: RecordState = { phase: 'empty', answered: [], values: {}, notice: '' };

function reduceRecord(state: RecordState, action: RecordAction): RecordState {
  switch (action.type) {
    case 'pull':
      return { ...EMPTY_RECORD, phase: 'pulling', notice: 'Reading four registers.' };

    case 'answer': {
      if (state.phase !== 'pulling') return state;
      const answered = [...state.answered, action.registerId];
      const register = REGISTERS.find((item) => item.id === action.registerId);
      const isComplete = answered.length === REGISTERS.length;
      return {
        phase: isComplete ? 'pulled' : 'pulling',
        answered,
        values: { ...state.values, ...action.values },
        notice: isComplete
          ? 'All four registers verified. Continue to your verification slip.'
          : `${register?.spokenName ?? 'Register'} verified. ${answered.length} of ${REGISTERS.length}.`,
      };
    }

    case 'edit':
      return { ...state, values: { ...state.values, [action.key]: action.value } };

    case 'clear':
      return { ...EMPTY_RECORD, notice: 'Record cleared. The four registers are empty again.' };
  }
}

function readRegister(
  register: RegisterDescriptor,
  student: StudentProfile,
): Record<string, string> {
  return Object.fromEntries(
    register.fields.map((field) => [field.key, field.read(student)]),
  );
}

/* ------------------------------------------------------------------ *
 * Pieces
 * ------------------------------------------------------------------ */

const STATUS_LABEL: Record<RegisterStatus, string> = {
  empty: 'Not read',
  waiting: 'Waiting',
  reading: 'Reading…',
  verified: 'Verified',
};

const RegisterStatusBadge: React.FC<{ status: RegisterStatus }> = ({ status }) => {
  if (status === 'verified') {
    return (
      <Badge tone="verified">
        <Check aria-hidden className="size-3" />
        {STATUS_LABEL.verified}
      </Badge>
    );
  }
  return (
    <Badge tone={status === 'empty' ? 'outline' : 'neutral'}>{STATUS_LABEL[status]}</Badge>
  );
};

const SKELETON_WIDTHS = ['w-40', 'w-28', 'w-36', 'w-24', 'w-32'];

/** Skeletons in the final layout — same rule, same rhythm, same row count. */
const SkeletonRows: React.FC<{ count: number }> = ({ count }) => (
  <div aria-hidden className="animate-pulse">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="flex items-center justify-between gap-4 border-b border-hairline py-2.5 last:border-b-0"
      >
        <span className="block h-2.5 w-20 rounded-xs bg-sunken" />
        <span
          className={`block h-2.5 rounded-xs bg-sunken ${SKELETON_WIDTHS[index % SKELETON_WIDTHS.length]}`}
        />
      </div>
    ))}
  </div>
);

const SemesterMarks: React.FC<{ marks: number[] }> = ({ marks }) => (
  <div className="mt-4 border-t border-hairline pt-3">
    <h4 className="text-label font-medium text-ink-soft">Semester by semester</h4>
    <ol className="mt-2 grid grid-cols-3 gap-px overflow-hidden rounded-sm border border-hairline bg-hairline sm:grid-cols-6">
      {marks.map((mark, index) => (
        <li key={index} className="bg-ground px-2 py-2 text-center">
          <span className="block text-micro text-ink-muted">Sem {index + 1}</span>
          <span className="block font-mono text-sm tabular-nums text-ink" data-numeric>
            {mark}
          </span>
        </li>
      ))}
    </ol>
  </div>
);

const QuotaList: React.FC<{ student: StudentProfile }> = ({ student }) => {
  const quotas = student.verification.verifiedCodes.map((code) => describeQuota(code, student));

  return (
    <div className="mt-4 border-t border-hairline pt-3">
      <h4 className="text-label font-medium text-ink-soft">What these certificates are worth</h4>
      <ul className="mt-2 space-y-3">
        {quotas.map((quota) => (
          <li key={quota.code} className="flex gap-3">
            <Badge mono className="mt-0.5 shrink-0">
              {quota.code}
            </Badge>
            <div className="min-w-0">
              <p className="text-sm text-ink">{quota.title}</p>
              <p className="measure mt-0.5 text-label text-ink-muted">{quota.meaning}</p>
              {quota.figure && (
                <p className="measure mt-1 font-mono text-label tabular-nums text-ink-soft" data-numeric>
                  {quota.figure}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

interface RegisterSectionProps {
  register: RegisterDescriptor;
  student: StudentProfile;
  status: RegisterStatus;
  values: Record<string, string>;
  onEdit: (key: string, value: string) => void;
}

const RegisterSection: React.FC<RegisterSectionProps> = ({
  register,
  student,
  status,
  values,
  onEdit,
}) => {
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
      <div className="grid gap-5 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] lg:gap-8">
        <div className="max-w-sm space-y-3 lg:max-w-none">
          {register.fields.map((field) => (
            <Field
              key={field.key}
              label={field.label}
              hint={field.hint}
              value={values[field.key] ?? ''}
              disabled={!isVerified}
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => onEdit(field.key, event.target.value)}
            />
          ))}
        </div>

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
      </div>
    </Panel>
  );
};

/* ------------------------------------------------------------------ *
 * Stage 1 — Record
 * ------------------------------------------------------------------ */

export const IdentifierInputSection: React.FC<IdentifierInputSectionProps> = ({
  student,
  onProceed,
}) => {
  const [record, dispatch] = useReducer(reduceRecord, EMPTY_RECORD);

  useEffect(() => {
    if (record.phase !== 'pulling') return;

    const timers = REGISTERS.map((register, index) =>
      window.setTimeout(
        () =>
          dispatch({
            type: 'answer',
            registerId: register.id,
            values: readRegister(register, student),
          }),
        (index + 1) * REGISTER_STEP_MS,
      ),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [record.phase, student]);

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
        <p className="measure mt-1.5 text-ink-soft">
          Four government registers already hold everything KEA needs to place you. Pull them
          once, read what they say, and correct anything that is wrong before your slip is made.
        </p>
      </header>

      {/* The instrument. One primary action, and the sentence that explains it. */}
      <div className="rounded-sm border border-hairline bg-panel px-4 py-4 sm:px-5">
        {record.phase === 'pulled' ? (
          <>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button variant="primary" size="lg" onClick={onProceed} className="w-full sm:w-auto">
                Continue to verification slip
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => dispatch({ type: 'clear' })}
                className="w-full sm:w-auto"
              >
                Clear and start over
              </Button>
            </div>
            <p className="measure mt-2.5 text-label text-ink-muted">
              All four registers answered. If anything below is wrong — an RD number, your rank —
              correct it in the record itself. Your slip is built from these values.
            </p>
          </>
        ) : (
          <>
            <span className="relative inline-flex w-full sm:w-auto">
              {record.phase === 'empty' && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-1.5 rounded-md border border-oxide opacity-0"
                  style={{ animation: 'record-breathe 2400ms var(--ease-out-quart) infinite' }}
                />
              )}
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
                isLoading={record.phase === 'pulling'}
                loadingLabel="Reading registers"
                onClick={() => dispatch({ type: 'pull' })}
              >
                Pull my record
              </Button>
            </span>
            <p className="measure mt-2.5 text-label text-ink-muted">
              {record.phase === 'pulling' && nextRegister
                ? `Reading ${nextRegister.spokenName}. ${record.answered.length} of ${REGISTERS.length} answered.`
                : 'Reads your name and address from DigiLocker, your diploma and SSLC marks from DTE and KSEEB, your caste and income certificates from Nadakacheri, and your rank from KEA. Nothing is typed by hand.'}
            </p>
          </>
        )}
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {record.notice}
      </p>

      <div className="space-y-4">
        {REGISTERS.map((register, index) => (
          <RegisterSection
            key={register.id}
            register={register}
            student={student}
            status={statusOf(index)}
            values={record.values}
            onEdit={(key, value) => dispatch({ type: 'edit', key, value })}
          />
        ))}
      </div>
    </div>
  );
};
