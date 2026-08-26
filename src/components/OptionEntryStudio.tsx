'use client';

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { clsx } from 'clsx';
import { ArrowDown, ArrowUp, GripVertical, Trash2, Undo2, X } from 'lucide-react';
import {
  Badge,
  Button,
  DataRow,
  Dialog,
  Panel,
  ProbabilityBar,
} from '@/components/ui';
import { College, OptionChoice, ProbabilityTier, StudentProfile } from '@/types';
import { calculateCollegeRecommendations } from '@/lib/recommendation';
import studentsData from '@/data/students.json';
import collegesData from '@/data/colleges.json';

/* ============================================================
   The option list is the whole product.
   Allotment walks it from priority 1 and stops at the first
   option the candidate's rank clears; everything below that is
   never read. So this screen has exactly two jobs: show what
   each row actually IS (college AND branch AND the category it
   is judged under AND the fee), and let the order be changed by
   pointer, by keyboard and by explicit buttons — never by drag
   alone.
   ============================================================ */

const CANDIDATE = (studentsData as StudentProfile[])[0];
const CANDIDATE_RANK = CANDIDATE.exam.dcetRank;

const MINIMUM_SENSIBLE_OPTIONS = 6;
const TIER_ORDER: ProbabilityTier[] = ['Ambitious', 'Moderate', 'Safe'];

const INDIAN_DIGITS = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const formatNumber = (value: number) => INDIAN_DIGITS.format(value);
const formatRupees = (value: number) => `₹${INDIAN_DIGITS.format(value)}`;

/* ------------------------------------------------------------
   Facts that belong to an option but are not carried on
   OptionChoice: the college's short name, the category the
   record is judged under at that college, that category's 2025
   closing rank, and the un-waived tuition. Recomputed once from
   the same source the recommendations came from, so a row can
   never state a probability without stating what it is measured
   against.
   ------------------------------------------------------------ */

interface OptionFacts {
  shortName: string;
  categoryCode: string;
  categoryLabel: string;
  closingRank2025: number;
  fullTuitionFee: number;
}

function splitCategory(applicable: string): { code: string; label: string } {
  const match = /^([^\s(]+)\s*\((.+)\)\s*$/.exec(applicable);
  if (!match) return { code: applicable, label: '' };
  return { code: match[1], label: match[2] };
}

const optionKey = (collegeCode: string, branchCode: string) =>
  `${collegeCode}:${branchCode}`;

const OPTION_FACTS: ReadonlyMap<string, OptionFacts> = (() => {
  const index = new Map<string, OptionFacts>();
  const recommendations = calculateCollegeRecommendations(
    CANDIDATE,
    collegesData as College[],
  );

  for (const result of recommendations) {
    const { code, label } = splitCategory(result.applicableCategory);
    index.set(optionKey(result.college.code, result.branch.branchCode), {
      shortName: result.college.shortName,
      categoryCode: code,
      categoryLabel: label,
      closingRank2025: result.effectiveCutoff,
      fullTuitionFee: result.branch.annualTuitionFee,
    });
  }

  return index;
})();

/* ------------------------------------------------------------
   The balance audit. It warns on real mistakes only — an
   ordering that costs the candidate a seat — never on taste.
   ------------------------------------------------------------ */

interface ListWarning {
  id: string;
  text: string;
  fix: string;
}

function auditOptionList(choices: OptionChoice[]): ListWarning[] {
  const warnings: ListWarning[] = [];
  const total = choices.length;
  if (total === 0) return warnings;

  if (total < MINIMUM_SENSIBLE_OPTIONS) {
    warnings.push({
      id: 'too-few',
      text: `You have listed ${total} ${total === 1 ? 'option' : 'options'}. If every one of them misses, Round 1 ends with no seat — allotment never falls back to a college you did not enter.`,
      fix: `Add at least ${MINIMUM_SENSIBLE_OPTIONS - total} more from Colleges. An extra option costs you nothing: it is only read once everything above it has missed.`,
    });
  }

  const bottomHalfStart = Math.ceil(total / 2);
  const bottomHalf = choices.slice(bottomHalfStart);
  if (bottomHalf.length > 0 && !bottomHalf.some((c) => c.probabilityTier === 'Safe')) {
    warnings.push({
      id: 'no-safe-floor',
      text: `Nothing from priority ${bottomHalfStart + 1} downward is a Safe option, so the bottom of your list cannot catch you. If priorities 1 to ${total} all miss, this round ends unallotted.`,
      fix: `Put one college whose 2025 closing rank for your category sits well behind ${formatNumber(CANDIDATE_RANK)} at the very end of the list.`,
    });
  }

  const firstSafe = choices.findIndex((c) => c.probabilityTier === 'Safe');
  if (firstSafe !== -1) {
    const strandedOffset = choices
      .slice(firstSafe + 1)
      .findIndex((c) => c.probabilityTier === 'Ambitious');

    if (strandedOffset !== -1) {
      const stranded = firstSafe + 1 + strandedOffset;
      warnings.push({
        id: 'safe-above-ambitious',
        text: `Priority ${firstSafe + 1}, ${choices[firstSafe].collegeName}, is a Safe option sitting above priority ${stranded + 1}, ${choices[stranded].collegeName}, which is a stretch. Allotment stops at priority ${firstSafe + 1}, so priority ${stranded + 1} is never read.`,
        fix: `Move ${choices[stranded].collegeName} above priority ${firstSafe + 1}. A stretch below a sure thing is a wasted option.`,
      });
    }
  }

  return warnings;
}

function describeFloor(choices: OptionChoice[]): string {
  const total = choices.length;
  const firstSafe = choices.findIndex((c) => c.probabilityTier === 'Safe');

  if (firstSafe === -1) {
    return `Nothing on this list clears comfortably at rank ${formatNumber(CANDIDATE_RANK)}. If all ${total} miss, you carry your rank into Round 2 with no seat held.`;
  }

  const anchor = choices[firstSafe];
  if (firstSafe === 0) {
    return `Priority 1, ${anchor.collegeName} — ${anchor.branchName}, is itself a Safe option at ${anchor.probabilityScore}%. The round is very likely to stop there, so nothing below it would ever be read.`;
  }

  const above =
    firstSafe === 1 ? 'priority 1 does not come through' : `priorities 1 to ${firstSafe} all miss`;

  return `If ${above}, you are still very likely to be allotted priority ${firstSafe + 1} — ${anchor.collegeName}, ${anchor.branchName}, at ${anchor.probabilityScore}%.`;
}

/* ------------------------------------------------------------
   Row geometry. One template shared by the column header and
   every row so the columns actually line up. Below `lg` the row
   recomposes into two lines instead of shrinking six columns
   into a 390px viewport.
   ------------------------------------------------------------ */

const GRID_COLUMNS_LG =
  'lg:grid-cols-[3.25rem_minmax(0,1fr)_8.5rem_9.5rem_8rem_8.75rem]';

const ROW_GRID = clsx(
  'grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2',
  'md:grid-cols-[3.25rem_minmax(0,1fr)_8rem_8.75rem] md:items-center',
  GRID_COLUMNS_LG,
  'lg:gap-y-0',
);

/* Below `lg` the row becomes three bands — who it is, how likely and how to
   move it, then what it costs — rather than six columns squeezed to nothing.
   `lg:contents` dissolves the mobile-only meta band back into real columns. */
const CELL_PRIORITY = 'col-start-1 col-end-2 row-start-1';
const CELL_IDENTITY =
  'col-start-2 col-end-4 row-start-1 min-w-0 md:col-end-3 lg:col-end-3';
const CELL_CHANCE =
  'col-start-2 col-end-3 row-start-2 min-w-0 self-center md:col-start-3 md:col-end-4 md:row-start-1 lg:col-start-5 lg:col-end-6';
const CELL_ACTIONS =
  'col-start-3 col-end-4 row-start-2 justify-self-end md:col-start-4 md:col-end-5 md:row-start-1 lg:col-start-6 lg:col-end-7';
const CELL_META =
  'col-start-2 col-end-4 row-start-3 flex flex-wrap items-start gap-x-6 gap-y-1 md:col-end-5 md:row-start-2 lg:contents';
const CELL_CATEGORY = 'min-w-0 lg:col-start-3 lg:col-end-4 lg:row-start-1';
const CELL_FEE = 'min-w-0 lg:col-start-4 lg:col-end-5 lg:row-start-1';

const SETTLE_KEYFRAMES: Keyframe[] = [
  { opacity: 0.45, transform: 'translateY(4px)' },
  { opacity: 1, transform: 'none' },
];

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ------------------------------------------------------------
   A 44px icon control. Used for reorder, remove and dismiss —
   every one of them reachable by touch and by keyboard.
   ------------------------------------------------------------ */

interface IconButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  title: string;
  onClick: () => void;
  disabled?: boolean;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  label,
  title,
  onClick,
  disabled,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={title}
    className={clsx(
      'grid size-11 shrink-0 place-items-center rounded-sm border border-transparent',
      'text-ink-muted transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-quart)]',
      'hover:border-hairline hover:bg-sunken hover:text-ink',
      'active:bg-panel',
      'disabled:cursor-not-allowed disabled:border-transparent disabled:bg-transparent disabled:text-ink-off',
    )}
  >
    <Icon aria-hidden className="size-4" />
  </button>
);

/* ------------------------------------------------------------
   One row = one real option entry.
   ------------------------------------------------------------ */

interface OptionRowProps {
  choice: OptionChoice;
  index: number;
  total: number;
  isLifted: boolean;
  isDragSource: boolean;
  dropEdge: 'top' | 'bottom' | null;
  isTabStop: boolean;
  instructionsId: string;
  registerRow: (node: HTMLLIElement | null) => void;
  onRowFocus: () => void;
  onRowKeyDown: (event: React.KeyboardEvent<HTMLLIElement>) => void;
  onDragStart: () => void;
  onDragOver: (event: React.DragEvent<HTMLLIElement>) => void;
  onDrop: () => void;
  onDragEnd: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

const OptionRow: React.FC<OptionRowProps> = ({
  choice,
  index,
  total,
  isLifted,
  isDragSource,
  dropEdge,
  isTabStop,
  instructionsId,
  registerRow,
  onRowFocus,
  onRowKeyDown,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onMoveUp,
  onMoveDown,
  onRemove,
}) => {
  const facts = OPTION_FACTS.get(optionKey(choice.collegeCode, choice.branchCode));
  const priority = index + 1;
  const optionName = `${choice.collegeName}, ${choice.branchName}`;

  const rowLabel = [
    `Priority ${priority} of ${total}.`,
    `${optionName}, ${choice.collegeDistrict}.`,
    facts
      ? `Judged under ${facts.categoryCode}, which closed at rank ${formatNumber(facts.closingRank2025)} in 2025.`
      : '',
    `Tuition ${formatRupees(choice.tuitionFee)} a year.`,
    `${choice.probabilityScore} percent chance, rated ${choice.probabilityTier}.`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <li
      ref={registerRow}
      tabIndex={isTabStop ? 0 : -1}
      draggable
      aria-roledescription="Reorderable option"
      aria-label={rowLabel}
      aria-describedby={instructionsId}
      onFocus={onRowFocus}
      onKeyDown={onRowKeyDown}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={clsx(
        ROW_GRID,
        'relative border-b border-hairline px-4 py-3 last:border-b-0 sm:px-5',
        'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-quart)]',
        'lg:cursor-grab lg:active:cursor-grabbing',
        isLifted && 'bg-oxide-wash',
        !isLifted && isDragSource && 'bg-sunken',
        !isLifted && !isDragSource && 'hover:bg-panel',
      )}
    >
      {dropEdge && (
        <span
          aria-hidden
          className={clsx(
            'absolute inset-x-0 h-0.5 bg-oxide',
            dropEdge === 'top' ? '-top-px' : '-bottom-px',
          )}
        />
      )}

      <div className={clsx(CELL_PRIORITY, 'flex items-center gap-2')}>
        <GripVertical
          aria-hidden
          className={clsx(
            'hidden size-4 shrink-0 lg:block',
            isLifted ? 'text-oxide' : 'text-ink-off',
          )}
        />
        <span
          data-numeric
          className={clsx(
            'font-mono text-sm tabular-nums',
            isLifted ? 'font-medium text-oxide' : 'text-ink-soft',
          )}
        >
          {priority}
        </span>
      </div>

      <div className={CELL_IDENTITY}>
        <span className="block truncate text-sm font-medium text-ink">
          {choice.collegeName}
          {facts?.shortName && (
            <span className="ml-1.5 text-micro font-normal text-ink-muted">
              {facts.shortName}
            </span>
          )}
        </span>
        <span className="block truncate text-sm text-ink-soft">
          {choice.branchName}
          <span className="text-micro text-ink-muted"> · {choice.collegeDistrict}</span>
        </span>
      </div>

      <div className={CELL_CHANCE}>
        <ProbabilityBar
          score={choice.probabilityScore}
          tier={choice.probabilityTier}
          density="inline"
        />
        <span className="mt-0.5 block text-micro text-ink-muted">
          {choice.probabilityTier}
        </span>
      </div>

      <div className={clsx(CELL_ACTIONS, 'flex items-center gap-0.5')}>
        <IconButton
          icon={ArrowUp}
          title="Move up"
          label={`Move ${optionName} up to priority ${priority - 1}`}
          onClick={onMoveUp}
          disabled={index === 0}
        />
        <IconButton
          icon={ArrowDown}
          title="Move down"
          label={`Move ${optionName} down to priority ${priority + 1}`}
          onClick={onMoveDown}
          disabled={index === total - 1}
        />
        <IconButton
          icon={Trash2}
          title="Remove"
          label={`Remove ${optionName} from priority ${priority}`}
          onClick={onRemove}
        />
      </div>

      <div className={CELL_META}>
        <div
          className={CELL_CATEGORY}
          title={
            facts?.categoryLabel
              ? `${facts.categoryCode} — ${facts.categoryLabel}`
              : undefined
          }
        >
          <span data-numeric className="block font-mono text-sm tabular-nums text-ink">
            {facts ? facts.categoryCode : '—'}
          </span>
          <span
            data-numeric
            className="block truncate font-mono text-micro tabular-nums text-ink-muted"
          >
            {facts ? `closed ${formatNumber(facts.closingRank2025)}` : 'category unavailable'}
          </span>
        </div>

        <div className={CELL_FEE}>
          <span data-numeric className="block font-mono text-sm tabular-nums text-ink">
            {formatRupees(choice.tuitionFee)}
            <span className="text-micro text-ink-muted"> /yr</span>
          </span>
          <span
            className="block truncate text-micro text-ink-muted"
            title={
              choice.isSnqApplied && facts
                ? `Supernumerary Quota waiver. Full tuition here is ${formatRupees(facts.fullTuitionFee)} a year.`
                : undefined
            }
          >
            {choice.isSnqApplied && facts
              ? `SNQ waiver from ${formatRupees(facts.fullTuitionFee)}`
              : 'no fee waiver'}
          </span>
        </div>
      </div>
    </li>
  );
};

/* ------------------------------------------------------------ */

interface OptionEntryStudioProps {
  optionChoices: OptionChoice[];
  onReorderChoices: (choices: OptionChoice[]) => void;
  onRemoveChoice: (index: number) => void;
  onProceedToRounds: () => void;
}

interface RemovedOption {
  choice: OptionChoice;
  index: number;
}

/**
 * A picked-up row. The origin index and the order it was picked up from are
 * rendered — the footer tells the student exactly where escape will put the
 * row back — so they are state, never a ref. A ref read during render can
 * hand React a frame whose sentence disagrees with the list.
 */
interface LiftState {
  id: string;
  originIndex: number;
  originOrder: OptionChoice[];
}

const RESTORE_FOCUS = ' restore';

export const OptionEntryStudio: React.FC<OptionEntryStudioProps> = ({
  optionChoices,
  onReorderChoices,
  onRemoveChoice,
  onProceedToRounds,
}) => {
  const instructionsId = useId();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [lift, setLift] = useState<LiftState | null>(null);
  const [dragSourceId, setDragSourceId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [removed, setRemoved] = useState<RemovedOption | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [announcement, setAnnouncement] = useState({ text: '', seq: 0 });

  const rowRefs = useRef(new Map<string, HTMLLIElement>());
  const restoreWrapRef = useRef<HTMLDivElement | null>(null);
  const pendingFocusRef = useRef<string | null>(null);
  const pendingSettleRef = useRef<string | null>(null);

  const total = optionChoices.length;
  const rowIds = useMemo(
    () => optionChoices.map((c) => optionKey(c.collegeCode, c.branchCode)),
    [optionChoices],
  );

  const announce = useCallback((text: string) => {
    setAnnouncement((prev) => ({ text, seq: prev.seq + 1 }));
  }, []);

  const activeRowId =
    activeId && rowIds.includes(activeId) ? activeId : (rowIds[0] ?? null);

  /* --- move / remove / restore ---------------------------- */

  const commit = useCallback(
    (next: OptionChoice[]) => {
      onReorderChoices(next.map((choice, i) => ({ ...choice, priority: i + 1 })));
    },
    [onReorderChoices],
  );

  const moveOption = useCallback(
    (from: number, to: number, verb: 'moved' | 'dropped') => {
      if (from === to || from < 0 || to < 0 || from >= total || to >= total) return;

      const next = [...optionChoices];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      commit(next);

      const id = optionKey(moved.collegeCode, moved.branchCode);
      pendingSettleRef.current = id;
      setRemoved(null);
      announce(
        `${moved.collegeName}, ${moved.branchName}, ${verb} to priority ${to + 1} of ${total}.`,
      );
    },
    [announce, commit, optionChoices, total],
  );

  const moveByButton = useCallback(
    (index: number, direction: -1 | 1) => {
      const to = index + direction;
      if (to < 0 || to >= total) return;

      const id = rowIds[index];
      moveOption(index, to, 'moved');
      // The button that was pressed becomes disabled at the ends of the
      // list, so hand focus to the row rather than dropping it on the body.
      if (to === 0 || to === total - 1) pendingFocusRef.current = id;
    },
    [moveOption, rowIds, total],
  );

  const handleRemove = useCallback(
    (index: number) => {
      const choice = optionChoices[index];
      if (!choice) return;

      const id = optionKey(choice.collegeCode, choice.branchCode);
      if (lift?.id === id) setLift(null);

      const successor = rowIds[index + 1] ?? rowIds[index - 1] ?? null;
      pendingFocusRef.current = successor ?? RESTORE_FOCUS;

      setRemoved({ choice, index });
      onRemoveChoice(index);
      announce(
        `Removed ${choice.collegeName}, ${choice.branchName}, from priority ${index + 1}. ${
          total - 1
        } options remain. Put it back from the notice above the list.`,
      );
    },
    [announce, lift, onRemoveChoice, optionChoices, rowIds, total],
  );

  const handleRestore = useCallback(() => {
    if (!removed) return;

    const at = Math.min(removed.index, optionChoices.length);
    const next = [...optionChoices];
    next.splice(at, 0, removed.choice);
    commit(next);

    const id = optionKey(removed.choice.collegeCode, removed.choice.branchCode);
    pendingFocusRef.current = id;
    pendingSettleRef.current = id;
    announce(
      `${removed.choice.collegeName}, ${removed.choice.branchName}, put back at priority ${at + 1} of ${optionChoices.length + 1}.`,
    );
    setRemoved(null);
  }, [announce, commit, optionChoices, removed]);

  /* --- keyboard reordering -------------------------------- */

  const liftRow = useCallback(
    (index: number) => {
      const choice = optionChoices[index];
      if (!choice) return;

      setLift({ id: rowIds[index], originIndex: index, originOrder: [...optionChoices] });
      announce(
        `Picked up ${choice.collegeName}, ${choice.branchName}, at priority ${index + 1} of ${total}. Use the up and down arrow keys to move it, space to drop it, escape to cancel.`,
      );
    },
    [announce, optionChoices, rowIds, total],
  );

  const dropRow = useCallback(
    (index: number) => {
      const choice = optionChoices[index];
      setLift(null);
      if (!choice) return;
      announce(
        `Dropped ${choice.collegeName}, ${choice.branchName}, at priority ${index + 1} of ${total}.`,
      );
    },
    [announce, optionChoices, total],
  );

  const cancelLift = useCallback(() => {
    if (!lift) return;
    setLift(null);

    const choice = lift.originOrder[lift.originIndex];
    commit(lift.originOrder);
    pendingFocusRef.current = optionKey(choice.collegeCode, choice.branchCode);
    announce(
      `Move cancelled. ${choice.collegeName}, ${choice.branchName}, is back at priority ${lift.originIndex + 1} of ${lift.originOrder.length}.`,
    );
  }, [announce, commit, lift]);

  const handleRowKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLLIElement>, index: number) => {
      // Space and the arrows also belong to the buttons inside the row.
      if (event.target !== event.currentTarget) return;

      const id = rowIds[index];
      const isLifted = lift?.id === id;

      if (event.key === 'Escape') {
        if (!isLifted) return;
        event.preventDefault();
        cancelLift();
        return;
      }

      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        if (isLifted) dropRow(index);
        else liftRow(index);
        return;
      }

      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        const direction = event.key === 'ArrowUp' ? -1 : 1;
        const to = index + direction;
        if (to < 0 || to >= total) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        if (isLifted) moveOption(index, to, 'moved');
        else rowRefs.current.get(rowIds[to])?.focus();
        return;
      }

      if (event.key === 'Home' || event.key === 'End') {
        const to = event.key === 'Home' ? 0 : total - 1;
        if (to === index) return;
        event.preventDefault();
        if (isLifted) moveOption(index, to, 'moved');
        else rowRefs.current.get(rowIds[to])?.focus();
      }
    },
    [cancelLift, dropRow, lift, liftRow, moveOption, rowIds, total],
  );

  /* --- pointer dragging ----------------------------------- */

  const clearDrag = useCallback(() => {
    setDragSourceId(null);
    setDropIndex(null);
  }, []);

  const handleDrop = useCallback(
    (targetIndex: number) => {
      const from = dragSourceId ? rowIds.indexOf(dragSourceId) : -1;
      clearDrag();
      if (from === -1 || from === targetIndex) return;
      moveOption(from, targetIndex, 'dropped');
    },
    [clearDrag, dragSourceId, moveOption, rowIds],
  );

  /* --- focus and settle after the list changes ------------ */

  useEffect(() => {
    const settleId = pendingSettleRef.current;
    pendingSettleRef.current = null;
    if (settleId && !prefersReducedMotion()) {
      rowRefs.current.get(settleId)?.animate(SETTLE_KEYFRAMES, {
        duration: 180,
        easing: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
      });
    }

    const focusId = pendingFocusRef.current;
    pendingFocusRef.current = null;
    if (!focusId) return;
    if (focusId === RESTORE_FOCUS)
      restoreWrapRef.current?.querySelector('button')?.focus();
    else rowRefs.current.get(focusId)?.focus();
  }, [optionChoices]);

  useEffect(() => {
    if (!isLocking) return;
    const timer = window.setTimeout(() => onProceedToRounds(), 460);
    return () => window.clearTimeout(timer);
  }, [isLocking, onProceedToRounds]);

  /* --- derived reading of the list ------------------------ */

  const warnings = useMemo(() => auditOptionList(optionChoices), [optionChoices]);
  const floorSentence = useMemo(() => describeFloor(optionChoices), [optionChoices]);

  const tierCounts = useMemo(() => {
    const counts: Record<ProbabilityTier, number> = {
      Ambitious: 0,
      Moderate: 0,
      Safe: 0,
    };
    for (const choice of optionChoices) counts[choice.probabilityTier] += 1;
    return counts;
  }, [optionChoices]);

  const categoryCodes = useMemo(() => {
    const codes = new Set<string>();
    for (const choice of optionChoices) {
      const facts = OPTION_FACTS.get(optionKey(choice.collegeCode, choice.branchCode));
      if (facts) codes.add(facts.categoryCode);
    }
    return [...codes];
  }, [optionChoices]);

  const liftedIndex = lift ? rowIds.indexOf(lift.id) : -1;
  const liftedChoice = liftedIndex >= 0 ? optionChoices[liftedIndex] : null;
  const dragSourceIndex = dragSourceId ? rowIds.indexOf(dragSourceId) : -1;
  const firstSafeIndex = optionChoices.findIndex((c) => c.probabilityTier === 'Safe');

  const restoreNotice = removed && (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline bg-panel px-4 py-2.5 sm:px-5">
      <p className="text-sm text-ink-soft">
        Removed <span className="font-medium text-ink">{removed.choice.collegeName}</span>,{' '}
        {removed.choice.branchName}, from priority{' '}
        <span data-numeric className="font-mono tabular-nums">
          {removed.index + 1}
        </span>
        .
      </p>
      <div ref={restoreWrapRef} className="flex items-center gap-1">
        <Button size="lg" variant="secondary" onClick={handleRestore}>
          <Undo2 aria-hidden className="size-3.5" />
          Put it back
        </Button>
        <IconButton
          icon={X}
          title="Dismiss"
          label="Dismiss this removal notice"
          onClick={() => setRemoved(null)}
        />
      </div>
    </div>
  );

  /* ------------------------------------------------------- */

  return (
    <div className="space-y-6">
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement.text
          ? `${announcement.text}${' '.repeat(announcement.seq % 2)}`
          : ''}
      </div>

      <p id={instructionsId} className="sr-only">
        Press space or enter to pick an option up. While it is picked up, the up and
        down arrow keys move it, home and end send it to the top or the bottom, space
        or enter drops it, and escape returns it to where it started. When nothing is
        picked up, the arrow keys move between rows.
      </p>

      <header>
        <h2 className="text-2xl font-semibold tracking-[-0.012em] text-ink">
          Order your options
        </h2>
        <p className="measure mt-2 text-sm text-ink-soft">
          Round 1 walks this list from priority 1 downward and stops at the first
          option your rank clears. Anything below that is never looked at. Once you
          lock the order, this is what KEA reads.
        </p>
      </header>

      {total === 0 ? (
        <Panel headingLevel="h3" title="No options entered">
          <p className="measure text-sm text-ink-soft">
            An empty list is the one way a good rank still ends the season with no
            seat. Allotment reads only the options you enter — it never falls back to
            a college you left off.
          </p>
          <p className="measure mt-3 text-sm text-ink-soft">
            Go back to <span className="font-medium text-ink">Colleges</span> in the
            stage rail above and add every college and branch you would accept. Six is
            the fewest worth entering, and there is no cost to entering more.
          </p>
          {removed && (
            <div ref={restoreWrapRef} className="mt-5 border-t border-hairline pt-4">
              <p className="text-sm text-ink-soft">
                You removed{' '}
                <span className="font-medium text-ink">{removed.choice.collegeName}</span>,{' '}
                {removed.choice.branchName}, a moment ago.
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="mt-3"
                onClick={handleRestore}
              >
                <Undo2 aria-hidden className="size-3.5" />
                Put it back
              </Button>
            </div>
          )}
        </Panel>
      ) : (
        <Panel
          headingLevel="h3"
          padded={false}
          title="Your option list"
          note={`Read in this order by Round 1. Your DCET rank is ${formatNumber(CANDIDATE_RANK)}.`}
          aside={
            <Badge tone="neutral" mono>
              {total} {total === 1 ? 'option' : 'options'}
            </Badge>
          }
        >
          <p className="measure border-b border-hairline px-4 py-3 text-sm text-ink-soft sm:px-5">
            Priority 1 is your longest shot and the last line is your surest — that is
            the right way round. A low chance at the top costs you nothing, because the
            list keeps going. Putting a sure thing high is what costs you: the moment
            your rank clears it, the round ends there.
          </p>

          {restoreNotice}

          <div
            aria-hidden
            className={clsx(
              'hidden border-b border-hairline bg-panel px-4 py-2 text-micro font-medium text-ink-muted sm:px-5 lg:grid',
              GRID_COLUMNS_LG,
              'items-center gap-x-3',
            )}
          >
            <span>Priority</span>
            <span>College and branch</span>
            <span>Category</span>
            <span>Fee a year</span>
            <span>Chance</span>
            <span className="text-right">Reorder</span>
          </div>

          {/* No onDragLeave here: dragleave bubbles from every row, so clearing
              the drop mark on it wipes the indicator the moment the pointer
              crosses a row boundary. drop and dragend already clear it. */}
          <ol>
            {optionChoices.map((choice, index) => {
              const id = rowIds[index];
              const isDropTarget =
                dropIndex === index && dragSourceIndex !== -1 && dragSourceIndex !== index;

              return (
                <OptionRow
                  key={id}
                  choice={choice}
                  index={index}
                  total={total}
                  isLifted={lift?.id === id}
                  isDragSource={dragSourceId === id}
                  dropEdge={
                    isDropTarget ? (dragSourceIndex > index ? 'top' : 'bottom') : null
                  }
                  isTabStop={id === activeRowId}
                  instructionsId={instructionsId}
                  registerRow={(node) => {
                    if (node) rowRefs.current.set(id, node);
                    else rowRefs.current.delete(id);
                  }}
                  onRowFocus={() => setActiveId(id)}
                  onRowKeyDown={(event) => handleRowKeyDown(event, index)}
                  onDragStart={() => {
                    setDragSourceId(id);
                    setDropIndex(index);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'move';
                    if (dropIndex !== index) setDropIndex(index);
                  }}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={clearDrag}
                  onMoveUp={() => moveByButton(index, -1)}
                  onMoveDown={() => moveByButton(index, 1)}
                  onRemove={() => handleRemove(index)}
                />
              );
            })}
          </ol>

          <div className="border-t border-hairline bg-panel px-4 py-3 sm:px-5">
            {lift && liftedChoice ? (
              <p className="measure text-sm text-oxide-deep">
                Moving {liftedChoice.collegeName}, {liftedChoice.branchName}. The up and
                down arrows move it, space or enter drops it here, escape puts it back at
                priority {lift.originIndex + 1}.
              </p>
            ) : (
              <p className="measure text-label text-ink-muted">
                Reorder with the arrows on each row, by dragging a row, or from the
                keyboard: focus a row, press space, move it with the up and down arrows,
                then press space again to drop it.
              </p>
            )}
            <p className="measure mt-1.5 text-label text-ink-muted">
              Category is the quota your verified record is judged under at that college
              {categoryCodes.length > 0 ? ` — here that is ${categoryCodes.join(', ')}` : ''}
              . The rank beneath it is that category&rsquo;s 2025 closing rank at that
              college and branch, against your {formatNumber(CANDIDATE_RANK)}.
            </p>
          </div>
        </Panel>
      )}

      {total > 0 && (
        <Panel
          headingLevel="h3"
          title="How this list is balanced"
          note="What you have entered, and what happens if the top of the list misses."
          aside={
            warnings.length > 0 ? (
              <Badge tone="grave" mono>
                {warnings.length} to check
              </Badge>
            ) : (
              <Badge tone="neutral">Nothing to check</Badge>
            )
          }
        >
          <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
            {TIER_ORDER.map((tier) => (
              <p key={tier} className="text-sm text-ink-soft">
                <span
                  data-numeric
                  className="font-mono text-lg font-medium tabular-nums text-ink"
                >
                  {tierCounts[tier]}
                </span>{' '}
                {tier}
              </p>
            ))}
          </div>

          <p className="measure mt-4 text-sm text-ink">{floorSentence}</p>

          {warnings.length > 0 ? (
            <ul className="mt-5 border-t border-hairline">
              {warnings.map((warning) => (
                <li
                  key={warning.id}
                  className="border-b border-hairline py-3 last:border-b-0"
                >
                  <p className="measure text-sm text-oxide-deep">{warning.text}</p>
                  <p className="measure mt-1 text-label text-ink-muted">{warning.fix}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="measure mt-5 border-t border-hairline pt-3 text-label text-ink-muted">
              Nothing to flag. The order runs from your longest shot to your surest, and
              the bottom of the list can still catch you.
            </p>
          )}
        </Panel>
      )}

      {total > 0 && (
        <div className="flex flex-col gap-4 border-t border-rule pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="measure text-label text-ink-muted">
            Locking fixes this order for Round 1. You cannot change it again until the
            Round 1 result is published.
          </p>
          <Button
            variant="grave"
            size="lg"
            onClick={() => setIsConfirmOpen(true)}
            className="sm:shrink-0"
          >
            Lock this order and open Round 1
          </Button>
        </div>
      )}

      <Dialog
        open={isConfirmOpen}
        onClose={() => {
          if (!isLocking) setIsConfirmOpen(false);
        }}
        title="Lock this order?"
        subtitle="Round 1 will read the list exactly as it stands."
        footer={
          <>
            <Button
              variant="secondary"
              size="lg"
              disabled={isLocking}
              onClick={() => setIsConfirmOpen(false)}
            >
              Keep editing
            </Button>
            <Button
              variant="grave"
              size="lg"
              isLoading={isLocking}
              loadingLabel="Locking the order"
              onClick={() => setIsLocking(true)}
            >
              Lock and open Round 1
            </Button>
          </>
        }
      >
        <p className="measure text-sm text-ink-soft">
          Allotment starts at priority 1 and stops at the first option your rank of{' '}
          {formatNumber(CANDIDATE_RANK)} clears. Everything below that is never read.
          After this you cannot reorder, add or remove until the Round 1 result is
          published.
        </p>

        {total > 0 && (
          <dl className="mt-4">
            <DataRow label="Options locked" value={total} mono />
            <DataRow
              label="Priority 1"
              value={`${optionChoices[0].collegeName} — ${optionChoices[0].branchName}`}
              source={`${optionChoices[0].probabilityScore}% chance · ${optionChoices[0].probabilityTier}`}
            />
            <DataRow
              label="First option likely to clear"
              value={
                firstSafeIndex === -1
                  ? 'None on this list'
                  : `Priority ${firstSafeIndex + 1} — ${optionChoices[firstSafeIndex].collegeName}`
              }
              source={
                firstSafeIndex === -1
                  ? 'Every option here is a stretch at your rank'
                  : `${optionChoices[firstSafeIndex].probabilityScore}% chance`
              }
            />
            <DataRow
              label="Points to check"
              value={warnings.length}
              mono
              source={
                warnings.length === 0
                  ? 'The order reads correctly'
                  : 'Listed below, and on the balance panel'
              }
            />
          </dl>
        )}

        {warnings.length > 0 && (
          <ul className="mt-4 border-t border-hairline">
            {warnings.map((warning) => (
              <li key={warning.id} className="border-b border-hairline py-3 last:border-b-0">
                <p className="measure text-sm text-oxide-deep">{warning.text}</p>
              </li>
            ))}
          </ul>
        )}
      </Dialog>
    </div>
  );
};
