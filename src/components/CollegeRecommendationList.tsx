'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { Check, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import {
  College,
  OptionChoice,
  RecommendationResult,
  StudentProfile,
} from '@/types';
import { calculateCollegeRecommendations } from '@/lib/recommendation';
import { Badge, Button, Dialog, Panel, ProbabilityBar } from '@/components/ui';
import {
  CollegeDetailModal,
  StudentRankProvider,
  cutoffHistory,
  formatRank,
  formatRupees,
  parseApplicableCategory,
  readStanding,
  readTrend,
} from './CollegeDetailModal';

interface CollegeRecommendationListProps {
  student: StudentProfile;
  colleges: College[];
  optionChoices: OptionChoice[];
  onAddChoice: (rec: RecommendationResult) => void;
  onAddAllChoices: (recs: RecommendationResult[]) => void;
  onProceedToOptionEntry: () => void;
}

/** KEA reads one option list per round; ten is what a student can defend. */
const OPTION_CEILING = 10;

/* ------------------------------------------------------------------
   Sorting
   ------------------------------------------------------------------ */

type SortKey = 'cutoff' | 'chance' | 'fee' | 'nirf';

interface SortSpec {
  key: SortKey;
  label: string;
  /** Shown under the control. Sorting a seat list has consequences; say them. */
  note: string;
  /** Which column the order applies to, for `aria-sort`. */
  column: 'college' | 'chance' | 'fee';
  direction: 'ascending' | 'descending';
  compare: (a: RecommendationResult, b: RecommendationResult) => number;
}

const byName = (a: RecommendationResult, b: RecommendationResult) =>
  a.college.name.localeCompare(b.college.name);

/**
 * The default is `cutoff` — hardest seat first — and it is the only defensible one.
 *
 * KEA allots you the highest-priority option you clear, then stops looking. So an
 * option list filled safest-first hands you your fallback and never tests your
 * reach, which is exactly the mistake this product exists to prevent. Ordering by
 * last year's closing rank puts the most contested seat at the top, which means
 * "add the top ten" produces a well-formed priority list rather than one the
 * student has to undo in the next stage. Closing rank is also the only ordering
 * key here that is a published fact rather than a derived estimate.
 */
const SORTS: SortSpec[] = [
  {
    key: 'cutoff',
    label: 'Hardest first',
    note: 'Most contested seat at the top, safest at the bottom — the order an option list should be filled in.',
    column: 'chance',
    direction: 'ascending',
    compare: (a, b) => a.effectiveCutoff - b.effectiveCutoff || byName(a, b),
  },
  {
    key: 'chance',
    label: 'Best chance',
    note: 'Safest seat at the top. Filling your list in this order gets your fallback allotted before your reach is ever tested.',
    column: 'chance',
    direction: 'descending',
    compare: (a, b) =>
      b.probabilityScore - a.probabilityScore ||
      a.effectiveCutoff - b.effectiveCutoff ||
      byName(a, b),
  },
  {
    key: 'fee',
    label: 'Cheapest first',
    note: 'Lowest net annual fee at the top, after any SNQ waiver you qualify for.',
    column: 'fee',
    direction: 'ascending',
    compare: (a, b) => a.tuitionFee - b.tuitionFee || byName(a, b),
  },
  {
    key: 'nirf',
    label: 'NIRF rank',
    note: 'National ranking, best first. Colleges with no NIRF rank sit at the end.',
    column: 'college',
    direction: 'ascending',
    compare: (a, b) =>
      (a.college.nirfRank ?? Number.MAX_SAFE_INTEGER) -
        (b.college.nirfRank ?? Number.MAX_SAFE_INTEGER) || byName(a, b),
  },
];

/* ------------------------------------------------------------------
   Filtering
   ------------------------------------------------------------------ */

interface FilterState {
  /** Rupees. `null` means no ceiling. */
  maxFee: number | null;
  districts: string[];
  branchCodes: string[];
  hostelOnly: boolean;
}

const NO_FILTERS: FilterState = {
  maxFee: null,
  districts: [],
  branchCodes: [],
  hostelOnly: false,
};

/**
 * One entry per facet, never per selected value. Two districts is still one
 * district filter: if each selected district were its own predicate, dropping
 * one from the diagnosis below would leave the other still testing the whole
 * selection, and the empty state would accuse the wrong control.
 */
interface FacetFilter {
  id: string;
  /** How the empty state names it in a sentence. */
  named: string;
  clear: () => void;
  test: (rec: RecommendationResult) => boolean;
}

/** One removable chip per selected value, so a student can drop just the one. */
interface FilterChip {
  id: string;
  label: string;
  clear: () => void;
}

const identify = (rec: RecommendationResult) =>
  `${rec.college.code}-${rec.branch.branchCode}`;

const isChosen = (rec: RecommendationResult, chosen: OptionChoice[]) =>
  chosen.some(
    (choice) =>
      choice.collegeCode === rec.college.code &&
      choice.branchCode === rec.branch.branchCode,
  );

const priorityOf = (rec: RecommendationResult, chosen: OptionChoice[]) =>
  chosen.findIndex(
    (choice) =>
      choice.collegeCode === rec.college.code &&
      choice.branchCode === rec.branch.branchCode,
  ) + 1;

/* ------------------------------------------------------------------
   Three years of closing ranks, drawn small.

   The solid line is the closing rank; the dashed line is the student's
   own rank. Where the solid line sits above the dashed one, they were
   inside that year. The direction is also stated in words next to it,
   because a slope alone can be read backwards.
   ------------------------------------------------------------------ */

const CutoffSparkline: React.FC<{ values: number[]; studentRank: number }> = ({
  values,
  studentRank,
}) => {
  if (values.length < 2) return null;

  const width = 44;
  const height = 14;
  const pad = 1.5;
  const low = Math.min(...values, studentRank);
  const high = Math.max(...values, studentRank);
  const span = high - low || 1;

  const x = (index: number) => (index / (values.length - 1)) * width;
  const y = (value: number) =>
    height - pad - ((value - low) / span) * (height - pad * 2);

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className="shrink-0"
    >
      <line
        x1={0}
        x2={width}
        y1={y(studentRank)}
        y2={y(studentRank)}
        className="stroke-ink-muted"
        strokeWidth={1}
        strokeDasharray="2 2"
      />
      <polyline
        points={values.map((value, index) => `${x(index)},${y(value)}`).join(' ')}
        fill="none"
        className="stroke-ink"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {values.map((value, index) => (
        <circle key={index} cx={x(index)} cy={y(value)} r={1.4} className="fill-ink" />
      ))}
    </svg>
  );
};

const Figure: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <span
    className={clsx('font-mono tabular-nums tracking-tight', className)}
    data-numeric
  >
    {children}
  </span>
);

/* ------------------------------------------------------------------
   One matched option.

   At `md` and up this is a real table row. Below `md` the row and its
   cells are blockified into a full-width stack — college and branch,
   then chance against the cutoff, then fee, then the action — and every
   cell carries `w-full` so none of them can collapse. A flex row here
   would size cells from their content, which silently crushes the
   short one: the fee is three of the numbers a student decides on.
   ------------------------------------------------------------------ */

const cellPadding = 'md:py-4 md:pr-4 md:align-top';

interface OptionRowProps {
  rec: RecommendationResult;
  studentRank: number;
  isAdded: boolean;
  priority: number;
  onAdd: () => void;
  onOpenRecord: (trigger: HTMLButtonElement) => void;
}

const OptionRow: React.FC<OptionRowProps> = ({
  rec,
  studentRank,
  isAdded,
  priority,
  onAdd,
  onOpenRecord,
}) => {
  const { college, branch } = rec;
  const category = parseApplicableCategory(rec.applicableCategory);
  const standing = readStanding(studentRank, rec.effectiveCutoff);
  const history = cutoffHistory(branch, category.key);
  const trend = readTrend(history);

  return (
    <tr
      className={clsx(
        'block border-b border-hairline px-4 py-4',
        'md:table-row md:px-0 md:py-0',
      )}
    >
      <td className={clsx('block w-full min-w-0 md:table-cell md:w-[34%] md:pl-4', cellPadding)}>
        <button
          type="button"
          onClick={(event) => onOpenRecord(event.currentTarget)}
          aria-haspopup="dialog"
          className="group inline-flex items-start gap-1 text-left text-base font-medium leading-snug text-ink transition-colors duration-[var(--dur-fast)] hover:text-ink-hover"
        >
          <span className="underline decoration-hairline decoration-1 underline-offset-[3px] group-hover:decoration-ink">
            {college.name}
          </span>
          <ChevronRight
            aria-hidden
            className="mt-1 size-3.5 shrink-0 text-ink-muted transition-transform duration-[var(--dur-fast)] group-hover:translate-x-0.5 group-hover:text-ink"
          />
          <span className="sr-only">— open the full record</span>
        </button>
        <p className="mt-0.5 text-sm text-ink-soft">
          {branch.branchName}{' '}
          <Figure className="text-ink-muted">({branch.branchCode})</Figure>
        </p>
        <p className="mt-1 text-micro text-ink-muted">
          {college.type} · {college.district}
          {college.nirfRank !== null && (
            <>
              {' · NIRF '}
              <Figure>{formatRank(college.nirfRank)}</Figure>
            </>
          )}
          {college.hasCampusHostel ? (
            <>
              {' · Hostel '}
              <Figure>{formatRupees(college.hostelAnnualFee)}</Figure>
            </>
          ) : (
            ' · No campus hostel'
          )}
        </p>
      </td>

      <td className={clsx('mt-3 block w-full min-w-0 md:mt-0 md:table-cell md:w-[29%]', cellPadding)}>
        <ProbabilityBar
          score={rec.probabilityScore}
          tier={rec.probabilityTier}
          density="full"
        />
        {/* §6: a probability never appears without the figure it is measured against. */}
        <p className="mt-1.5 text-label leading-snug text-ink-soft">
          Your <Figure>{formatRank(studentRank)}</Figure> against last year&rsquo;s{' '}
          <Figure className="text-ink">{category.key}</Figure> close at{' '}
          <Figure>{formatRank(rec.effectiveCutoff)}</Figure> —{' '}
          <span className="font-medium text-ink">{standing.phrase}</span>
        </p>
        <p className="mt-0.5 text-micro text-ink-muted">
          {category.label.toLowerCase()}
        </p>
        {trend && (
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-micro text-ink-muted">
            <span aria-hidden>
              <Figure>
                {trend.values.map((value) => formatRank(value)).join(' → ')}
              </Figure>
            </span>
            <CutoffSparkline values={trend.values} studentRank={studentRank} />
            <span className="text-ink-soft">{trend.word}</span>
            <span className="sr-only">
              Closing ranks in this category:{' '}
              {history
                .filter((point) => point.value !== null)
                .map((point) => `${formatRank(point.value as number)} in ${point.year}`)
                .join(', ')}
              . {trend.sentence}.
            </span>
          </p>
        )}
      </td>

      <td className={clsx('mt-3 block w-full min-w-0 md:mt-0 md:table-cell md:w-[19%]', cellPadding)}>
        <p>
          <Figure className="text-base text-ink">{formatRupees(rec.tuitionFee)}</Figure>
          <span className="text-label text-ink-muted"> a year</span>
        </p>
        {rec.isSnqApplied ? (
          <>
            <p className="mt-1">
              <Badge tone="outline">SNQ waiver</Badge>
            </p>
            <p className="mt-1 text-micro text-ink-muted">
              full tuition{' '}
              <Figure className="line-through">
                {formatRupees(branch.annualTuitionFee)}
              </Figure>
            </p>
          </>
        ) : (
          <p className="mt-1 text-micro text-ink-muted">
            Full tuition — no SNQ waiver at this cutoff
          </p>
        )}
      </td>

      <td className={clsx('mt-3 block w-full md:mt-0 md:table-cell md:w-[18%]', cellPadding)}>
        {isAdded ? (
          /* Still focusable and still reachable, but a second press adds nothing.
             A disabled control here would read as broken rather than as done. */
          <button
            type="button"
            aria-disabled="true"
            onClick={(event) => event.preventDefault()}
            className="inline-flex h-11 w-full cursor-default items-center justify-center gap-1.5 rounded-sm border border-pine-edge bg-ground px-3 text-label font-medium text-pine md:h-10 md:w-auto"
          >
            <Check aria-hidden className="size-3.5" />
            In your list
            <Figure>· {formatRank(priority)}</Figure>
            <span className="sr-only">
              — already added as option {formatRank(priority)}
            </span>
          </button>
        ) : (
          <Button variant="secondary" size="md" onClick={onAdd} className="h-11 w-full md:h-10 md:w-auto">
            Add
            <span className="sr-only">
              {' '}
              {college.name}, {branch.branchName}, to my option list
            </span>
          </Button>
        )}
      </td>
    </tr>
  );
};

/* ------------------------------------------------------------------
   The filter surface.

   One form, rendered inside a native <dialog> at every width: at 390px a
   row of inline controls is unusable, and a dialog gives a real focus
   trap, Escape, and room for the counts that make each choice legible.
   ------------------------------------------------------------------ */

interface FacetOption {
  value: string;
  label: string;
  count: number;
}

interface FilterFormProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  feeCeiling: number;
  feeFloor: number;
  districtOptions: FacetOption[];
  branchOptions: FacetOption[];
  hostelCount: number;
  allCount: number;
  visibleCount: number;
}

const FilterForm: React.FC<FilterFormProps> = ({
  filters,
  setFilters,
  feeCeiling,
  feeFloor,
  districtOptions,
  branchOptions,
  hostelCount,
  allCount,
  visibleCount,
}) => {
  const feeId = useId();
  const feeValue = filters.maxFee ?? feeCeiling;

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  return (
    <div className="space-y-5">
      <fieldset>
        <label htmlFor={feeId} className="block text-label font-medium text-ink-soft">
          Most I can pay in tuition a year
        </label>
        <output
          htmlFor={feeId}
          className="mt-1 block font-mono text-lg tabular-nums tracking-tight text-ink"
        >
          {filters.maxFee === null ? 'No limit' : formatRupees(filters.maxFee)}
        </output>
        <input
          id={feeId}
          type="range"
          min={0}
          max={feeCeiling}
          step={1000}
          value={feeValue}
          onChange={(event) => {
            const next = Number(event.target.value);
            setFilters((current) => ({
              ...current,
              maxFee: next >= feeCeiling ? null : next,
            }));
          }}
          className="mt-2 h-11 w-full cursor-pointer accent-ink"
        />
        <p className="text-micro text-ink-muted">
          Net of the SNQ waiver where it applies. Cheapest option here is{' '}
          <Figure>{formatRupees(feeFloor)}</Figure>; the dearest is{' '}
          <Figure>{formatRupees(feeCeiling)}</Figure>. Slide fully right for no limit.
        </p>
      </fieldset>

      {districtOptions.length > 1 && (
        <fieldset className="border-t border-hairline pt-4">
          <legend className="text-label font-medium text-ink-soft">District</legend>
          <div className="mt-1">
            {districtOptions.map((option) => (
              <label
                key={option.value}
                className="flex min-h-11 items-center gap-2.5 border-b border-hairline text-sm text-ink last:border-b-0"
              >
                <input
                  type="checkbox"
                  className="size-4 shrink-0 accent-ink"
                  checked={filters.districts.includes(option.value)}
                  onChange={() =>
                    setFilters((current) => ({
                      ...current,
                      districts: toggle(current.districts, option.value),
                    }))
                  }
                />
                <span className="flex-1">{option.label}</span>
                <Figure className="text-label text-ink-muted">{option.count}</Figure>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {branchOptions.length > 1 && (
        <fieldset className="border-t border-hairline pt-4">
          <legend className="text-label font-medium text-ink-soft">Branch</legend>
          <div className="mt-1">
            {branchOptions.map((option) => (
              <label
                key={option.value}
                className="flex min-h-11 items-center gap-2.5 border-b border-hairline text-sm text-ink last:border-b-0"
              >
                <input
                  type="checkbox"
                  className="size-4 shrink-0 accent-ink"
                  checked={filters.branchCodes.includes(option.value)}
                  onChange={() =>
                    setFilters((current) => ({
                      ...current,
                      branchCodes: toggle(current.branchCodes, option.value),
                    }))
                  }
                />
                <span className="flex-1">{option.label}</span>
                <Figure className="text-label text-ink-muted">{option.count}</Figure>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="border-t border-hairline pt-4">
        <legend className="text-label font-medium text-ink-soft">Living arrangements</legend>
        <label className="mt-1 flex min-h-11 items-center gap-2.5 text-sm text-ink">
          <input
            type="checkbox"
            className="size-4 shrink-0 accent-ink"
            checked={filters.hostelOnly}
            onChange={() =>
              setFilters((current) => ({ ...current, hostelOnly: !current.hostelOnly }))
            }
          />
          <span className="flex-1">Only colleges with a hostel on campus</span>
          <Figure className="text-label text-ink-muted">{hostelCount}</Figure>
        </label>
      </fieldset>

      <p aria-live="polite" className="border-t border-hairline pt-3 text-label text-ink-muted">
        <Figure className="text-ink">{formatRank(visibleCount)}</Figure> of{' '}
        <Figure>{formatRank(allCount)}</Figure> options match.
      </p>
    </div>
  );
};

/* ------------------------------------------------------------------ */

export const CollegeRecommendationList: React.FC<CollegeRecommendationListProps> = ({
  student,
  colleges,
  optionChoices,
  onAddChoice,
  onAddAllChoices,
  onProceedToOptionEntry,
}) => {
  const [sortKey, setSortKey] = useState<SortKey>('cutoff');
  const [filters, setFilters] = useState<FilterState>(NO_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openRecord, setOpenRecord] = useState<RecommendationResult | null>(null);
  const sortName = useId();
  const filterButtonId = useId();

  /* Both dialogs are unmounted on close, so the platform cannot hand focus back
     to the control that opened them — the invoker is gone by then. Park it and
     restore in an effect, which runs after the unmount has committed. Without
     this, Escape drops a keyboard user at the top of the document. */
  const returnFocusTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (openRecord !== null || isFilterOpen) return;
    const target = returnFocusTo.current;
    if (!target) return;
    returnFocusTo.current = null;
    target.focus();
  }, [openRecord, isFilterOpen]);

  const studentRank = student.exam.dcetRank;

  /* Recommendations are computed unfiltered and narrowed here, so the screen
     can still count what each filter costs and name the one that emptied the
     list. Handing the filters to the engine would throw that away. */
  const all = useMemo(
    () => calculateCollegeRecommendations(student, colleges),
    [student, colleges],
  );

  const fees = all.map((rec) => rec.tuitionFee);
  const feeCeiling = fees.length ? Math.ceil(Math.max(...fees) / 1000) * 1000 : 0;
  const feeFloor = fees.length ? Math.min(...fees) : 0;

  const countBy = (pick: (rec: RecommendationResult) => string): FacetOption[] => {
    const tally = new Map<string, number>();
    all.forEach((rec) => tally.set(pick(rec), (tally.get(pick(rec)) ?? 0) + 1));
    return Array.from(tally.entries())
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  const districtOptions = countBy((rec) => rec.college.district);
  const branchOptions = useMemo(() => {
    const tally = new Map<string, FacetOption>();
    all.forEach((rec) => {
      const existing = tally.get(rec.branch.branchCode);
      tally.set(rec.branch.branchCode, {
        value: rec.branch.branchCode,
        label: rec.branch.branchName,
        count: (existing?.count ?? 0) + 1,
      });
    });
    return Array.from(tally.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [all]);
  const hostelCount = all.filter((rec) => rec.college.hasCampusHostel).length;

  const facetFilters: FacetFilter[] = [];
  const chips: FilterChip[] = [];

  if (filters.maxFee !== null) {
    const ceiling = filters.maxFee;
    facetFilters.push({
      id: 'fee',
      named: `the fee ceiling of ${formatRupees(ceiling)}`,
      clear: () => setFilters((current) => ({ ...current, maxFee: null })),
      test: (rec) => rec.tuitionFee <= ceiling,
    });
    chips.push({
      id: 'fee',
      label: `Fee at most ${formatRupees(ceiling)}`,
      clear: () => setFilters((current) => ({ ...current, maxFee: null })),
    });
  }

  if (filters.districts.length > 0) {
    facetFilters.push({
      id: 'districts',
      named: filters.districts.length === 1 ? 'the district filter' : 'the district filters',
      clear: () => setFilters((current) => ({ ...current, districts: [] })),
      test: (rec) => filters.districts.includes(rec.college.district),
    });
    filters.districts.forEach((district) => {
      chips.push({
        id: `district-${district}`,
        label: district,
        clear: () =>
          setFilters((current) => ({
            ...current,
            districts: current.districts.filter((item) => item !== district),
          })),
      });
    });
  }

  if (filters.branchCodes.length > 0) {
    facetFilters.push({
      id: 'branches',
      named: filters.branchCodes.length === 1 ? 'the branch filter' : 'the branch filters',
      clear: () => setFilters((current) => ({ ...current, branchCodes: [] })),
      test: (rec) => filters.branchCodes.includes(rec.branch.branchCode),
    });
    filters.branchCodes.forEach((code) => {
      chips.push({
        id: `branch-${code}`,
        label: branchOptions.find((option) => option.value === code)?.label ?? code,
        clear: () =>
          setFilters((current) => ({
            ...current,
            branchCodes: current.branchCodes.filter((item) => item !== code),
          })),
      });
    });
  }

  if (filters.hostelOnly) {
    facetFilters.push({
      id: 'hostel',
      named: 'the campus-hostel requirement',
      clear: () => setFilters((current) => ({ ...current, hostelOnly: false })),
      test: (rec) => rec.college.hasCampusHostel,
    });
    chips.push({
      id: 'hostel',
      label: 'Hostel on campus',
      clear: () => setFilters((current) => ({ ...current, hostelOnly: false })),
    });
  }

  const sort = SORTS.find((spec) => spec.key === sortKey) ?? SORTS[0];
  const visible = all
    .filter((rec) => facetFilters.every((facet) => facet.test(rec)))
    .sort(sort.compare);

  /* When the list empties, name the filter responsible rather than shrugging. */
  const culprit =
    visible.length === 0 && facetFilters.length > 0
      ? facetFilters
          .map((facet) => ({
            facet,
            restored: all.filter((rec) =>
              facetFilters
                .filter((other) => other.id !== facet.id)
                .every((other) => other.test(rec)),
            ).length,
          }))
          .sort((a, b) => b.restored - a.restored)[0]
      : null;

  const room = Math.max(0, OPTION_CEILING - optionChoices.length);
  const addableTop = visible
    .filter((rec) => !isChosen(rec, optionChoices))
    .slice(0, room);

  const chosenCount = optionChoices.length;

  return (
    <StudentRankProvider rank={studentRank}>
      <div className="space-y-6">
        <p aria-live="polite" className="sr-only">
          {formatRank(visible.length)} options shown. {formatRank(chosenCount)} added to
          your option list.
        </p>

        <Panel
          padded={false}
          title="Colleges that will take your diploma"
          note={`${formatRank(all.length)} college-and-branch options accept a ${student.academic.diplomaBranch} diploma. Every closing rank below is last year's, in the category you are judged under — never the general merit rank.`}
          aside={
            <div className="text-right">
              <span className="block text-micro text-ink-muted">Your DCET rank</span>
              <Figure className="text-lg font-medium text-ink">
                {formatRank(studentRank)}
              </Figure>
            </div>
          }
        >
          {/* Toolbar */}
          <div className="border-b border-hairline bg-panel px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <fieldset className="min-w-0">
                <legend className="sr-only">Order these options by</legend>
                <div className="flex flex-wrap gap-1.5">
                  {SORTS.map((spec) => (
                    <label key={spec.key} className="cursor-pointer">
                      <input
                        type="radio"
                        name={sortName}
                        value={spec.key}
                        checked={sortKey === spec.key}
                        onChange={() => setSortKey(spec.key)}
                        className="peer sr-only"
                      />
                      <span
                        className={clsx(
                          'inline-flex h-11 items-center rounded-sm border px-3 text-label font-medium sm:h-8',
                          'transition-[background-color,border-color,color] duration-[var(--dur-fast)] ease-[var(--ease-out-quart)]',
                          'border-hairline bg-ground text-ink-soft hover:border-field hover:text-ink',
                          'peer-checked:border-ink peer-checked:bg-ink peer-checked:text-ground',
                          'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-oxide',
                        )}
                      >
                        {spec.label}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="ms-auto flex flex-wrap items-center gap-2">
                <Button
                  id={filterButtonId}
                  variant="secondary"
                  size="sm"
                  onClick={(event) => {
                    returnFocusTo.current = event.currentTarget;
                    setIsFilterOpen(true);
                  }}
                  aria-haspopup="dialog"
                  className="h-11 sm:h-8"
                >
                  <SlidersHorizontal aria-hidden className="size-3.5" />
                  Filters
                  {facetFilters.length > 0 && (
                    <Figure>({formatRank(facetFilters.length)})</Figure>
                  )}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="h-11 sm:h-8"
                  disabled={addableTop.length === 0}
                  onClick={() => onAddAllChoices(addableTop)}
                >
                  Add the top {formatRank(addableTop.length || OPTION_CEILING)} in this
                  order
                </Button>
              </div>
            </div>

            <p className="mt-2 text-label text-ink-muted measure">{sort.note}</p>

            {chips.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-micro text-ink-muted">Filtering by</span>
                {chips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={chip.clear}
                    className="inline-flex items-center gap-1 rounded-xs border border-rule bg-ground px-2 py-1 text-micro font-medium text-ink-soft transition-colors duration-[var(--dur-fast)] hover:border-ink hover:text-ink"
                  >
                    {chip.label}
                    <X aria-hidden className="size-3" />
                    <span className="sr-only">— remove this filter</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setFilters(NO_FILTERS)}
                  className="rounded-xs px-1 text-micro font-medium text-ink-soft underline decoration-hairline underline-offset-2 transition-colors duration-[var(--dur-fast)] hover:text-ink hover:decoration-ink"
                >
                  Clear all
                </button>
              </div>
            )}

            {addableTop.length === 0 && visible.length > 0 && (
              <p className="mt-2 text-label text-ink-muted">
                {room === 0 ? (
                  <>
                    Your option list is full at{' '}
                    <Figure>{formatRank(OPTION_CEILING)}</Figure>. Remove one in the next
                    stage to make room.
                  </>
                ) : (
                  'Everything shown is already in your list. Clear a filter to see the rest.'
                )}
              </p>
            )}
          </div>

          {/* The list */}
          {visible.length > 0 ? (
            <>
              <table className="block w-full border-collapse md:table">
                <caption className="sr-only">
                  College and branch options matched to DCET rank{' '}
                  {formatRank(studentRank)}, ordered by {sort.label.toLowerCase()}.
                </caption>
                <thead className="hidden md:table-header-group">
                  <tr className="border-b border-rule">
                    <th
                      scope="col"
                      aria-sort={sort.column === 'college' ? sort.direction : 'none'}
                      className="py-2 pl-4 pr-4 text-left text-label font-medium text-ink-muted"
                    >
                      College and branch
                    </th>
                    <th
                      scope="col"
                      aria-sort={sort.column === 'chance' ? sort.direction : 'none'}
                      className="py-2 pr-4 text-left text-label font-medium text-ink-muted"
                    >
                      Chance against last year&rsquo;s closing rank
                    </th>
                    <th
                      scope="col"
                      aria-sort={sort.column === 'fee' ? sort.direction : 'none'}
                      className="py-2 pr-4 text-left text-label font-medium text-ink-muted"
                    >
                      Tuition you pay
                    </th>
                    <th scope="col" className="py-2 pr-4 text-left">
                      <span className="sr-only">Add to your option list</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="block md:table-row-group">
                  {visible.map((rec) => (
                    <OptionRow
                      key={identify(rec)}
                      rec={rec}
                      studentRank={studentRank}
                      isAdded={isChosen(rec, optionChoices)}
                      priority={priorityOf(rec, optionChoices)}
                      onAdd={() => onAddChoice(rec)}
                      onOpenRecord={(trigger) => {
                        returnFocusTo.current = trigger;
                        setOpenRecord(rec);
                      }}
                    />
                  ))}
                </tbody>
              </table>

              <p className="border-b border-hairline px-4 py-3 text-micro text-ink-muted sm:px-5">
                Three figures under each chance are that category&rsquo;s closing rank in
                2023, 2024 and 2025. A closing rank that falls year on year is{' '}
                <span className="text-ink-soft">tightening</span> — fewer ranks get in.
                The dashed line in each sketch is your own rank.
              </p>
            </>
          ) : (
            <div className="px-4 py-10 sm:px-5">
              {culprit && culprit.restored > 0 ? (
                <>
                  <p className="text-base font-medium text-ink">
                    Nothing matches all {formatRank(facetFilters.length)} filters at once.
                  </p>
                  <p className="mt-1 text-sm text-ink-soft measure">
                    {culprit.facet.named.charAt(0).toUpperCase() +
                      culprit.facet.named.slice(1)}{' '}
                    is the one ruling them out —{' '}
                    <Figure>{formatRank(culprit.restored)}</Figure> option
                    {culprit.restored === 1 ? '' : 's'} come
                    {culprit.restored === 1 ? 's' : ''} back without it.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="primary" size="sm" onClick={culprit.facet.clear}>
                      Drop {culprit.facet.named}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setFilters(NO_FILTERS)}>
                      Clear all filters
                    </Button>
                  </div>
                </>
              ) : facetFilters.length > 0 ? (
                <>
                  <p className="text-base font-medium text-ink">
                    No option survives these filters.
                  </p>
                  <p className="mt-1 text-sm text-ink-soft measure">
                    Every filter you have set rules out the rest on its own. Clear them and
                    start from the full list of {formatRank(all.length)}.
                  </p>
                  <div className="mt-4">
                    <Button variant="primary" size="sm" onClick={() => setFilters(NO_FILTERS)}>
                      Clear all filters
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-base font-medium text-ink">
                    No branch at these colleges accepts your diploma.
                  </p>
                  <p className="mt-1 text-sm text-ink-soft measure">
                    A {student.academic.diplomaBranch} diploma does not map to any lateral-entry
                    branch on this list. Your KEA helpline centre,{' '}
                    {student.verification.helplineCenter}, can confirm which branches your
                    diploma is cleared for.
                  </p>
                </>
              )}
            </div>
          )}

          {/* Proceed */}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 bg-panel px-4 py-4 sm:px-5">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">
                <Figure>{formatRank(chosenCount)}</Figure>{' '}
                {chosenCount === 1 ? 'option chosen' : 'options chosen'}
                {chosenCount > 0 && (
                  <span className="font-normal text-ink-muted">
                    {' '}
                    of <Figure>{formatRank(OPTION_CEILING)}</Figure>
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-label text-ink-muted measure">
                {chosenCount === 0
                  ? 'Add colleges above before you can order them. You can change the order, and remove any of them, in the next stage.'
                  : chosenCount >= OPTION_CEILING
                    ? 'That is the practical ceiling for one round. Next you set the order KEA reads them in.'
                    : 'Next you set the order KEA reads them in — it allots the highest option you clear, then stops.'}
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              disabled={chosenCount === 0}
              onClick={onProceedToOptionEntry}
            >
              Order my option list
            </Button>
          </div>
        </Panel>

        {/* Only one <dialog> is ever mounted: the shared primitive labels itself
            with a fixed id, so two live at once would collide. */}
        {isFilterOpen && (
          <Dialog
            open
            onClose={() => setIsFilterOpen(false)}
            title="Narrow these options"
            subtitle={`Filters apply as you set them. ${formatRank(all.length)} options accept your diploma.`}
            footer={
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mr-auto"
                  disabled={facetFilters.length === 0}
                  onClick={() => setFilters(NO_FILTERS)}
                >
                  Clear all filters
                </Button>
                <Button variant="primary" size="sm" onClick={() => setIsFilterOpen(false)}>
                  Show {formatRank(visible.length)}{' '}
                  {visible.length === 1 ? 'option' : 'options'}
                </Button>
              </>
            }
          >
            <FilterForm
              filters={filters}
              setFilters={setFilters}
              feeCeiling={feeCeiling}
              feeFloor={feeFloor}
              districtOptions={districtOptions}
              branchOptions={branchOptions}
              hostelCount={hostelCount}
              allCount={all.length}
              visibleCount={visible.length}
            />
          </Dialog>
        )}

        {openRecord && (
          <CollegeDetailModal
            key={identify(openRecord)}
            item={openRecord}
            onClose={() => setOpenRecord(null)}
            onAddToOption={onAddChoice}
            isAlreadyAdded={isChosen(openRecord, optionChoices)}
          />
        )}
      </div>
    </StudentRankProvider>
  );
};
