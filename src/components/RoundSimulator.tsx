'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { ArrowLeft, Printer, RotateCcw } from 'lucide-react';
import { AllotmentResult, OptionChoice, StudentProfile } from '@/types';
import { Badge, Button, DataRow, Dialog, Panel, Seal } from '@/components/ui';
import collegesData from '@/data/colleges.json';

interface RoundSimulatorProps {
  student: StudentProfile;
  optionChoices: OptionChoice[];
  onResetToOptions: () => void;
}

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

const NUMBERS = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

function rupees(amount: number): string {
  return `₹${NUMBERS.format(Math.round(amount))}`;
}

function count(value: number): string {
  return NUMBERS.format(value);
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function longDate(iso: string): string {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!parts) return iso;
  const month = Number(parts[2]);
  if (month < 1 || month > 12) return iso;
  return `${Number(parts[3])} ${MONTHS[month - 1]} ${parts[1]}`;
}

/* ------------------------------------------------------------------ */
/* The rules this simulation runs on, stated once so the screen can    */
/* explain itself instead of producing results out of nowhere.         */
/* ------------------------------------------------------------------ */

/**
 * Round 1 allots the highest choice whose 2025 closing rank the candidate
 * clears with room to spare. An `Ambitious` option is one their rank does
 * not clear, so Round 1 walks past it.
 */
const clearsInRound1 = (choice: OptionChoice) => choice.probabilityTier !== 'Ambitious';

/**
 * Between rounds, seats come back from candidates who froze elsewhere or
 * left counselling, and closing ranks move down a little. A choice that
 * only just missed can open in Round 2; one that missed by a wide margin
 * will not. 45% is where "just missed" stops being wishful.
 */
const ROUND_2_REACH = 45;

const ROUND_CALENDAR: Record<number, { allotment: string; feeBy: string; reportBy: string }> = {
  1: { allotment: '2026-08-20', feeBy: '2026-08-26', reportBy: '2026-08-31' },
  2: { allotment: '2026-09-03', feeBy: '2026-09-09', reportBy: '2026-09-14' },
};

type CutoffTable = Record<string, number>;

/**
 * Which seat pool this allotment actually comes out of.
 *
 * A candidate is considered in every pool their certificates open, and the
 * seat comes from whichever one their rank clears — so the pool with the
 * furthest closing rank that still sits at or beyond their rank wins. The
 * supernumerary quota is a pool like any other here: the fee waiver does not
 * lower a closing rank, so it is only the allotting pool when the rank
 * genuinely clears it. Saying otherwise would print a document claiming a
 * seat from a pool the student missed by hundreds of ranks.
 */
function findClosingRank(
  student: StudentProfile,
  choice: OptionChoice,
): { categoryKey: string; closingRank: number | null } {
  const college = collegesData.find((c) => c.code === choice.collegeCode);
  const branch = college?.branches.find((b) => b.branchCode === choice.branchCode);
  const cutoffs: CutoffTable | undefined = branch?.cutoffs.year2025;

  const category = student.reservations.casteCategory;
  const stem = category.replace(/G$/, '');
  const rank = student.exam.dcetRank;

  if (!cutoffs) {
    return { categoryKey: category, closingRank: null };
  }

  const candidateKeys = ['GM', category];
  if (student.reservations.isRuralQuota) candidateKeys.push(`${stem}R`);
  if (student.reservations.isKalyanaKarnataka) candidateKeys.push(`${stem}HK`, 'GMHK');
  if (choice.isSnqApplied) candidateKeys.push('SNQ');

  let clearedKey: string | null = null;
  let clearedRank = -1;
  let widestKey: string | null = null;
  let widestRank = -1;

  for (const key of candidateKeys) {
    const closing = cutoffs[key];
    if (typeof closing !== 'number') continue;
    if (closing > widestRank) {
      widestKey = key;
      widestRank = closing;
    }
    if (closing >= rank && closing > clearedRank) {
      clearedKey = key;
      clearedRank = closing;
    }
  }

  // Nothing cleared means the seat only comes free later, on returned seats.
  if (clearedKey) return { categoryKey: clearedKey, closingRank: clearedRank };
  if (widestKey) return { categoryKey: widestKey, closingRank: widestRank };
  return { categoryKey: category, closingRank: null };
}

interface Allotment {
  choice: OptionChoice;
  /** Position in the student's own list, zero-based. */
  index: number;
  closingRank: number | null;
  result: AllotmentResult;
}

function buildAllotment(
  student: StudentProfile,
  choice: OptionChoice,
  index: number,
  round: number,
): Allotment {
  const { categoryKey, closingRank } = findClosingRank(student, choice);
  const calendar = ROUND_CALENDAR[round] ?? ROUND_CALENDAR[1];

  return {
    choice,
    index,
    closingRank,
    result: {
      round,
      isAllotted: true,
      allottedChoice: choice,
      allottedCategory: categoryKey,
      cutoffRankAtAllotment: closingRank ?? student.exam.dcetRank,
      candidateRank: student.exam.dcetRank,
      allotmentDate: calendar.allotment,
      challanNumber: `KEA/DCET26/${student.exam.dcetRollNo}/R${round}`,
      feePayable: choice.tuitionFee,
    },
  };
}

const OrderSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="border-b border-hairline px-4 py-5 last:border-b-0 sm:px-6">
    <h4 className="text-sm font-semibold text-ink">{title}</h4>
    <div className="mt-3">{children}</div>
  </section>
);

/* ------------------------------------------------------------------ */
/* The four choices                                                    */
/* ------------------------------------------------------------------ */

type DecisionId = 'freeze' | 'hold' | 'reject' | 'exit';

interface ChoiceSpec {
  id: DecisionId;
  number: number;
  name: string;
  summary: string;
  inRound2: string;
  youKeep: string;
  youRisk: string;
  feeNow: string;
  irreversible: string | null;
  actionLabel: string;
  grave: boolean;
}

type OutcomeKind =
  | 'frozen'
  | 'upgraded'
  | 'held-no-upgrade'
  | 'reallotted'
  | 'no-seat'
  | 'exited';

interface Outcome {
  kind: OutcomeKind;
  heading: string;
  explanation: string;
  allotment: Allotment | null;
}

/* ------------------------------------------------------------------ */

export const RoundSimulator: React.FC<RoundSimulatorProps> = ({
  student,
  optionChoices,
  onResetToOptions,
}) => {
  const [selected, setSelected] = useState<DecisionId | null>(null);
  const [confirming, setConfirming] = useState<DecisionId | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const rank = count(student.exam.dcetRank);

  const ordered = useMemo(
    () => [...optionChoices].sort((a, b) => a.priority - b.priority),
    [optionChoices],
  );

  /** Round 1: the highest choice this rank actually clears. */
  const roundOne = useMemo<Allotment | null>(() => {
    const index = ordered.findIndex(clearsInRound1);
    if (index === -1) return null;
    return buildAllotment(student, ordered[index], index, 1);
  }, [ordered, student]);

  /** The one higher choice that could open in Round 2, if any. */
  const upgradeTarget = useMemo<Allotment | null>(() => {
    if (!roundOne) return null;
    const above = ordered.slice(0, roundOne.index);
    const index = above.findIndex((c) => c.probabilityScore >= ROUND_2_REACH);
    if (index === -1) return null;
    return buildAllotment(student, above[index], index, 2);
  }, [ordered, roundOne, student]);

  /** Where giving the seat back would realistically land them. */
  const fallbackTarget = useMemo<Allotment | null>(() => {
    if (!roundOne) return null;
    const below = ordered.slice(roundOne.index + 1);
    const index = below.findIndex(clearsInRound1);
    if (index === -1) return null;
    return buildAllotment(student, below[index], roundOne.index + 1 + index, 2);
  }, [ordered, roundOne, student]);

  /** Round 2 for a candidate who came out of Round 1 with nothing. */
  const secondChanceTarget = useMemo<Allotment | null>(() => {
    if (roundOne) return null;
    const index = ordered.findIndex((c) => c.probabilityScore >= ROUND_2_REACH);
    if (index === -1) return null;
    return buildAllotment(student, ordered[index], index, 2);
  }, [ordered, roundOne, student]);

  const describe = useCallback(
    (allotment: Allotment) =>
      `choice ${allotment.choice.priority} — ${allotment.choice.branchName} at ${allotment.choice.collegeName}`,
    [],
  );

  const commit = useCallback(
    (decision: DecisionId) => {
      setConfirming(null);

      if (decision === 'freeze' && roundOne) {
        setOutcome({
          kind: 'frozen',
          heading: 'Seat frozen',
          explanation:
            roundOne.index === 0
              ? 'Your Round 1 seat is confirmed and you are out of counselling. It was your first choice, so there was nothing above it to wait for.'
              : `Your Round 1 seat is confirmed and you are out of counselling. The ${roundOne.index === 1 ? 'one choice' : `${count(roundOne.index)} choices`} above it on your list will not be tried again.`,
          allotment: roundOne,
        });
        return;
      }

      if (decision === 'hold') {
        if (!roundOne) {
          if (secondChanceTarget) {
            setOutcome({
              kind: 'reallotted',
              heading: 'Round 2 allotted a seat',
              explanation: `Seats returned after Round 1 moved the closing ranks down far enough for ${describe(secondChanceTarget)}. That is the highest choice on your list that rank ${rank} now clears.`,
              allotment: secondChanceTarget,
            });
            return;
          }
          setOutcome({
            kind: 'no-seat',
            heading: 'Round 2 allotted nothing either',
            explanation: `The returned seats did not move any of your ${count(ordered.length)} choices within reach of rank ${rank}. What is left is the mop-up round, on whatever seats are still vacant, with no say in which college.`,
            allotment: null,
          });
          return;
        }

        if (upgradeTarget) {
          setOutcome({
            kind: 'upgraded',
            heading: 'Upgraded in Round 2',
            explanation: `A seat came back in ${upgradeTarget.choice.branchName} at ${upgradeTarget.choice.collegeName}, and it sits above your Round 1 seat on your list. The upgrade is automatic: your Round 1 seat has been released and this one is now yours. The fee you paid in Round 1 is adjusted against the new fee.`,
            allotment: upgradeTarget,
          });
          return;
        }

        setOutcome({
          kind: 'held-no-upgrade',
          heading: 'No upgrade — you keep your Round 1 seat',
          explanation:
            roundOne && roundOne.index === 0
              ? 'There was nothing to upgrade to. Round 1 already gave you your first choice, and Round 2 cannot go above the top of your own list. Your seat is unchanged and now confirmed.'
              : `Round 2 ran your list again from choice 1. None of the choices above your seat came within reach of rank ${rank} — the returned seats did not move their closing ranks far enough. Holding cost you nothing: your Round 1 seat is unchanged and now confirmed.`,
          allotment: roundOne,
        });
        return;
      }

      if (decision === 'reject') {
        if (fallbackTarget) {
          setOutcome({
            kind: 'reallotted',
            heading: 'Round 2 allotted a lower choice',
            explanation: `Your Round 1 seat went back to the pool and a candidate below you took it. Your rank did not change, so the choices above it were still out of reach in Round 2. You were allotted the next choice on your list that rank ${rank} clears.`,
            allotment: fallbackTarget,
          });
          return;
        }

        setOutcome({
          kind: 'no-seat',
          heading: 'Round 2 allotted nothing',
          explanation: `Your Round 1 seat went back to the pool. Nothing below it on your list is within reach of rank ${rank}, and nothing above it moved. You now hold no seat. What is left is the mop-up round, on whatever seats are still vacant, with no say in which college.`,
          allotment: null,
        });
        return;
      }

      setOutcome({
        kind: 'exited',
        heading: 'You have left DCET counselling',
        explanation:
          'Your name is off every remaining round, including mop-up. Any seat you held has gone back to the pool. Nothing here can be reopened this year.',
        allotment: null,
      });
    },
    [describe, fallbackTarget, ordered.length, rank, roundOne, secondChanceTarget, upgradeTarget],
  );

  const restart = useCallback(() => {
    setOutcome(null);
    setSelected(null);
    setConfirming(null);
  }, []);

  /* ---------------- Empty list ---------------- */

  if (ordered.length === 0) {
    return (
      <div className="space-y-6">
        <Panel
          title="Nothing to allot"
          note="Rounds run on your option list, in the order you set."
        >
          <p className="measure text-sm text-ink-soft">
            Round 1 walks down your option list and stops at the first college
            your rank clears. Your list is empty, so there is nothing for it to
            walk down and no seat can be allotted — in this round or any round
            after it.
          </p>
          <p className="measure mt-3 text-sm text-ink-soft">
            Add the colleges you would accept, put the one you want most at the
            top, and come back.
          </p>
          <div className="mt-5">
            <Button variant="primary" onClick={onResetToOptions}>
              <ArrowLeft aria-hidden className="size-4" />
              Build my option list
            </Button>
          </div>
        </Panel>
      </div>
    );
  }

  /* ---------------- Choice definitions ---------------- */

  const feeNow = roundOne ? rupees(roundOne.choice.tuitionFee) : rupees(0);

  const choices: ChoiceSpec[] = roundOne
    ? [
        {
          id: 'freeze',
          number: 1,
          name: 'Freeze',
          summary: 'Keep this seat and stop here. You do not take part in Round 2.',
          inRound2: 'You are not in Round 2 at all. This seat is confirmed as it stands.',
          youKeep: 'This seat, confirmed, with a reporting date you can plan around.',
          youRisk:
            roundOne.index === 0
              ? 'Nothing. This is already your first choice, so there is nothing above it to give up.'
              : `The ${roundOne.index === 1 ? 'one choice' : `${count(roundOne.index)} choices`} above this one on your list. ${roundOne.index === 1 ? 'It is' : 'They are'} never tried again.`,
          feeNow: `${feeNow} due by ${longDate(ROUND_CALENDAR[1].feeBy)}.`,
          irreversible: 'Once frozen, the seat cannot be swapped or upgraded later.',
          actionLabel: 'Freeze this seat',
          grave: false,
        },
        {
          id: 'hold',
          number: 2,
          name: 'Hold and upgrade',
          summary:
            'Keep this seat and let Round 2 try the choices above it. You cannot end up with less than you have now.',
          inRound2: upgradeTarget
            ? `Your list is run again from choice 1. ${upgradeTarget.choice.branchName} at ${upgradeTarget.choice.collegeName} (choice ${upgradeTarget.choice.priority}) is the one close enough to open.`
            : roundOne.index === 0
              ? 'Your list is run again from choice 1 — but you already hold choice 1, so there is nothing above it to move to.'
              : `Your list is run again from choice 1. On last year's closing ranks, none of the ${roundOne.index} choices above your seat is within reach of rank ${rank}, so the likely result is no change.`,
          youKeep: 'This seat, unless a higher choice opens — then that one instead.',
          youRisk:
            'The upgrade is automatic, not an offer. If a higher choice opens you are moved to it and this seat is released, whether or not you have changed your mind about the order.',
          feeNow: `${feeNow} due by ${longDate(ROUND_CALENDAR[1].feeBy)}. If you upgrade, it is adjusted against the new college's fee.`,
          irreversible: null,
          actionLabel: 'Hold this seat and run Round 2',
          grave: false,
        },
        {
          id: 'reject',
          number: 3,
          name: 'Reject and re-enter',
          summary:
            'Give this seat back and enter Round 2 holding nothing.',
          inRound2: fallbackTarget
            ? `You are treated as unallotted. Your rank has not changed, so the choices above this seat are still out of reach — the realistic landing point is ${describe(fallbackTarget)}.`
            : 'You are treated as unallotted. Nothing else on your list is within reach of your rank, so Round 2 would very likely allot you nothing.',
          youKeep: 'Nothing. You hold no seat between the two rounds.',
          youRisk: 'This seat goes straight back to the pool and a candidate below you takes it. You cannot ask for it back.',
          feeNow: 'Nothing now. Fee already paid is refunded less the counselling charge.',
          irreversible: 'Surrendering the seat cannot be undone.',
          actionLabel: 'Give back this seat',
          grave: true,
        },
        {
          id: 'exit',
          number: 4,
          name: 'Exit',
          summary: 'Leave DCET counselling altogether.',
          inRound2: 'There is no Round 2 for you, and no mop-up round either.',
          youKeep: 'Nothing from this counselling.',
          youRisk: 'Your seat is released and your name is removed from every remaining round.',
          feeNow: 'Nothing now. Fee already paid is refunded less the counselling charge.',
          irreversible: 'This closes DCET 2026 for you. The next chance is DCET 2027.',
          actionLabel: 'Leave counselling',
          grave: true,
        },
      ]
    : [
        {
          id: 'hold',
          number: 2,
          name: 'Stay in for Round 2',
          summary: 'Keep your list as it is and wait for Round 2.',
          inRound2:
            'Your list is run again against the new closing ranks. Seats returned by other candidates are what you are competing for.',
          youKeep: 'Your option list, exactly as you ordered it.',
          youRisk: 'Nothing is guaranteed. Round 2 can allot nothing as well.',
          feeNow: 'Nothing due — you hold no seat.',
          irreversible: null,
          actionLabel: 'Run Round 2',
          grave: false,
        },
        {
          id: 'exit',
          number: 4,
          name: 'Exit',
          summary: 'Leave DCET counselling altogether.',
          inRound2: 'There is no Round 2 for you, and no mop-up round either.',
          youKeep: 'Nothing from this counselling.',
          youRisk: 'Your name is removed from every remaining round.',
          feeNow: 'Nothing due.',
          irreversible: 'This closes DCET 2026 for you. The next chance is DCET 2027.',
          actionLabel: 'Leave counselling',
          grave: true,
        },
      ];

  const selectedSpec = choices.find((c) => c.id === selected) ?? null;
  const confirmingSpec = choices.find((c) => c.id === confirming) ?? null;

  const displayed = outcome ? outcome.allotment : roundOne;
  const sealed = Boolean(outcome && outcome.allotment);

  /* ---------------- Document ---------------- */

  const order = displayed && (
    <article className="print-sheet rounded-sm border border-rule bg-ground">
      <header className="flex items-start justify-between gap-4 border-b border-hairline bg-panel px-4 py-5 sm:px-6">
        <div className="min-w-0">
          <h3 className="text-xl font-semibold tracking-[-0.01em] text-ink sm:text-2xl">
            Seat allotment order
          </h3>
          <p className="mt-0.5 text-sm text-ink-soft">
            Diploma CET 2026 · Round {displayed.result.round} ·{' '}
            {longDate(displayed.result.allotmentDate)}
          </p>
          <div className="mt-3">
            {sealed ? (
              <Badge tone="verified">Confirmed</Badge>
            ) : (
              <Badge tone="outline">Provisional until you choose below</Badge>
            )}
          </div>
        </div>
        {sealed && (
          <Seal
            mark="ALLOTTED"
            date={displayed.result.allotmentDate.split('-').reverse().join('-')}
            caption={`ROUND ${displayed.result.round}`}
          />
        )}
      </header>

      <OrderSection title="Seat allotted">
        <p className="text-lg font-semibold text-ink">
          {displayed.choice.branchName}
        </p>
        <p className="mt-0.5 text-base text-ink-soft">
          {displayed.choice.collegeName}, {displayed.choice.collegeDistrict}
        </p>
        <dl className="mt-4">
          <DataRow
            label="Your position on this list"
            value={`Choice ${displayed.choice.priority} of ${ordered.length}`}
            mono
          />
          <DataRow
            label="College and branch code"
            value={`${displayed.choice.collegeCode} · ${displayed.choice.branchCode}`}
            mono
          />
          <DataRow
            label="Allotted under"
            value={displayed.result.allottedCategory}
            mono
            source="The seat pool your rank cleared first"
          />
        </dl>
      </OrderSection>

      <OrderSection title="How your rank compared">
        <dl>
          <DataRow label="Your DCET rank" value={rank} mono />
          <DataRow
            label="Closing rank in this pool"
            value={
              displayed.closingRank === null
                ? 'Not published'
                : count(displayed.closingRank)
            }
            mono
            source="2025 actual — the 2026 rounds here are simulated from it"
          />
          {displayed.closingRank !== null && (
            <DataRow
              label="Margin"
              value={
                displayed.closingRank >= displayed.result.candidateRank
                  ? `${count(displayed.closingRank - displayed.result.candidateRank)} ranks inside`
                  : `${count(displayed.result.candidateRank - displayed.closingRank)} ranks outside`
              }
              mono
              source={
                displayed.closingRank >= displayed.result.candidateRank
                  ? 'Your rank was inside this pool when it closed last year'
                  : `Outside last year's close — allotted on seats returned before Round ${displayed.result.round}`
              }
            />
          )}
        </dl>
      </OrderSection>

      <OrderSection title="Fee and reporting">
        <dl>
          <DataRow
            label="Annual tuition"
            value={rupees(displayed.result.feePayable)}
            mono
            source={
              displayed.choice.isSnqApplied
                ? 'Capped at the government rate under the supernumerary quota'
                : 'Full college tuition — the fee waiver does not apply to this seat'
            }
          />
          <DataRow
            label="Challan number"
            value={displayed.result.challanNumber}
            mono
          />
          <DataRow
            label="Fee due by"
            value={longDate(
              (ROUND_CALENDAR[displayed.result.round] ?? ROUND_CALENDAR[1]).feeBy,
            )}
            mono
          />
          <DataRow
            label="Report to college by"
            value={longDate(
              (ROUND_CALENDAR[displayed.result.round] ?? ROUND_CALENDAR[1]).reportBy,
            )}
            mono
            source="Carry your verification slip and secret key"
          />
        </dl>
      </OrderSection>

      <footer className="border-t border-rule bg-panel px-4 py-4 sm:px-6">
        <p className="text-label text-ink-soft">
          Candidate {student.name} · DCET roll number{' '}
          <span className="font-mono tabular-nums" data-numeric>
            {student.exam.dcetRollNo}
          </span>
        </p>
        <p className="mt-1 text-micro text-ink-muted">
          Demonstration build with sample data. Not issued by the Karnataka
          Examinations Authority.
        </p>
      </footer>
    </article>
  );

  /* ---------------- Render ---------------- */

  return (
    <div className="space-y-6">
      {/* Screen-only header */}
      <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <p className="measure text-sm text-ink-soft">
          This is a walk-through of the allotment rounds, not a submission.
          Nothing here reaches KEA. On the real portal each of the four choices
          below is final the moment you confirm it, which is why they are spelled
          out in full first.
        </p>
        <div className="flex shrink-0 gap-2">
          {displayed && (
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer aria-hidden className="size-3.5" />
              Print order
            </Button>
          )}
          <Button variant="ghost" onClick={onResetToOptions}>
            <RotateCcw aria-hidden className="size-3.5" />
            Change my order
          </Button>
        </div>
      </div>

      {/* Round 1 result — a document either way */}
      {order}

      {!roundOne && !outcome && (
        <Panel
          title="Round 1 allotted you nothing"
          note={`All ${ordered.length} of your choices closed above rank ${rank} last year.`}
        >
          <p className="measure text-sm text-ink-soft">
            Round 1 walks down your list and stops at the first college your rank
            clears. It reached the end of your list without stopping, so no seat
            was allotted. This is not a rejection and it does not affect Round 2.
          </p>
          <p className="measure mt-3 text-sm text-ink-soft">
            Two things help: seats returned after Round 1 push closing ranks down
            a little, and adding colleges your rank clears comfortably gives
            Round 2 somewhere to stop. Choices 1 and 3 do not apply to you —
            there is no seat to freeze or give back.
          </p>
        </Panel>
      )}

      {/* The four choices */}
      {!outcome && (
        <Panel
          title={
            roundOne
              ? 'What you do next — pick one'
              : 'What you do next'
          }
          note={
            roundOne
              ? 'Read the four consequences before you pick. Each one is final on the real portal.'
              : 'With no seat in hand, two of the four choices apply to you.'
          }
          padded={false}
          className="no-print"
        >
          <fieldset className="border-0 p-0">
            <legend className="sr-only">
              Choose what happens next after your Round 1 result
            </legend>

            <ul>
              {choices.map((choice) => {
                const isSelected = selected === choice.id;
                return (
                  <li key={choice.id} className="border-b border-hairline last:border-b-0">
                    <label
                      className={clsx(
                        'flex cursor-pointer gap-3 px-4 py-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-quart)] sm:gap-4 sm:px-5',
                        isSelected ? 'bg-panel' : 'hover:bg-sunken',
                      )}
                    >
                      <input
                        type="radio"
                        name="round-decision"
                        value={choice.id}
                        checked={isSelected}
                        onChange={() => setSelected(choice.id)}
                        className="mt-1 size-4 shrink-0 accent-ink"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <span
                            className={clsx(
                              'text-base text-ink',
                              isSelected ? 'font-semibold' : 'font-medium',
                            )}
                          >
                            Choice {choice.number} · {choice.name}
                          </span>
                          {choice.irreversible && (
                            <Badge tone="grave">Cannot be undone</Badge>
                          )}
                        </div>

                        <p className="measure mt-1 text-sm text-ink-soft">
                          {choice.summary}
                        </p>

                        <dl className="mt-3 grid gap-x-8 gap-y-3 border-t border-hairline pt-3 sm:grid-cols-2">
                          <div className="min-w-0">
                            <dt className="text-label text-ink-muted">In Round 2</dt>
                            <dd className="mt-0.5 text-sm text-ink">{choice.inRound2}</dd>
                          </div>
                          <div className="min-w-0">
                            <dt className="text-label text-ink-muted">You keep</dt>
                            <dd className="mt-0.5 text-sm text-ink">{choice.youKeep}</dd>
                          </div>
                          <div className="min-w-0">
                            <dt className="text-label text-ink-muted">You risk</dt>
                            <dd className="mt-0.5 text-sm text-ink">{choice.youRisk}</dd>
                          </div>
                          <div className="min-w-0">
                            <dt className="text-label text-ink-muted">Fee due now</dt>
                            <dd className="mt-0.5 text-sm text-ink">{choice.feeNow}</dd>
                          </div>
                          {choice.irreversible && (
                            <div className="min-w-0 sm:col-span-2">
                              <dt className="text-label text-ink-muted">Irreversible</dt>
                              <dd className="mt-0.5 text-sm text-oxide-deep">
                                {choice.irreversible}
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>

          <div className="flex flex-col gap-3 border-t border-hairline bg-panel px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="measure text-label text-ink-soft" aria-live="polite">
              {selectedSpec
                ? selectedSpec.irreversible
                  ? `Choice ${selectedSpec.number} — ${selectedSpec.irreversible}`
                  : `Choice ${selectedSpec.number} — ${selectedSpec.summary}`
                : 'Pick one of the choices above to see what confirming it would do.'}
            </p>
            <Button
              variant={selectedSpec?.grave ? 'grave' : 'primary'}
              size="lg"
              disabled={!selectedSpec}
              onClick={() => {
                if (!selectedSpec) return;
                // Anything that cannot be undone stops for a confirmation that
                // names what is lost. Everything else runs straight away.
                if (selectedSpec.irreversible) setConfirming(selectedSpec.id);
                else commit(selectedSpec.id);
              }}
              className="shrink-0"
            >
              {selectedSpec ? selectedSpec.actionLabel : 'Pick a choice first'}
            </Button>
          </div>
        </Panel>
      )}

      {/* Outcome */}
      {outcome && (
        <div aria-live="polite" className="space-y-6">
          <Panel title={outcome.heading}>
            <p className="measure text-sm text-ink-soft">{outcome.explanation}</p>

            {outcome.kind === 'no-seat' && (
              <p className="measure mt-3 text-sm text-ink-soft">
                This is the outcome most candidates who reject a seat do not
                expect. A rank that cleared one college in Round 1 does not clear
                a better one in Round 2 just because the seat was given back.
              </p>
            )}

            {outcome.kind === 'exited' && (
              <p className="measure mt-3 text-sm text-ink-soft">
                If this was not what you meant to do, the real portal has no way
                back. Here you can start the round again and try another choice.
              </p>
            )}

            <div className="no-print mt-5 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={restart}>
                <RotateCcw aria-hidden className="size-3.5" />
                Try a different choice
              </Button>
              <Button variant="ghost" onClick={onResetToOptions}>
                <ArrowLeft aria-hidden className="size-4" />
                Change my option order
              </Button>
            </div>
          </Panel>
        </div>
      )}

      {/* Confirmation for anything that cannot be undone */}
      <Dialog
        open={confirmingSpec !== null}
        onClose={() => setConfirming(null)}
        title={
          confirmingSpec
            ? `Confirm choice ${confirmingSpec.number} — ${confirmingSpec.name}?`
            : 'Confirm'
        }
        subtitle={confirmingSpec?.irreversible ?? undefined}
        footer={
          confirmingSpec && (
            <>
              <Button variant="secondary" onClick={() => setConfirming(null)}>
                Go back
              </Button>
              <Button
                variant={confirmingSpec.grave ? 'grave' : 'primary'}
                onClick={() => commit(confirmingSpec.id)}
              >
                {confirmingSpec.actionLabel}
              </Button>
            </>
          )
        }
      >
        {confirmingSpec && (
          <dl className="space-y-4">
            <div>
              <dt className="text-label text-ink-muted">What you give up</dt>
              <dd className="mt-0.5 text-sm text-ink">{confirmingSpec.youRisk}</dd>
            </div>
            <div>
              <dt className="text-label text-ink-muted">What happens in Round 2</dt>
              <dd className="mt-0.5 text-sm text-ink">{confirmingSpec.inRound2}</dd>
            </div>
            <div>
              <dt className="text-label text-ink-muted">Fee</dt>
              <dd className="mt-0.5 text-sm text-ink">{confirmingSpec.feeNow}</dd>
            </div>
            {roundOne && (
              <div>
                <dt className="text-label text-ink-muted">The seat in question</dt>
                <dd className="mt-0.5 text-sm text-ink">
                  {roundOne.choice.branchName} at {roundOne.choice.collegeName},{' '}
                  {roundOne.choice.collegeDistrict} — choice{' '}
                  <span className="font-mono tabular-nums" data-numeric>
                    {roundOne.choice.priority}
                  </span>{' '}
                  on your list.
                </dd>
              </div>
            )}
          </dl>
        )}
      </Dialog>
    </div>
  );
};
