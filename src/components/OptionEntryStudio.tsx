'use client';

import React, { useCallback, useId, useMemo, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { GripVertical, SlidersHorizontal, Trash2, Undo2, X } from 'lucide-react';
import {
  Badge,
  Button,
  Dialog,
  Panel,
  ProbabilityBar,
} from '@/components/ui';
import { College, OptionChoice, ProbabilityTier, RecommendationResult, StudentProfile } from '@/types';
import { calculateCollegeRecommendations } from '@/lib/recommendation';
import studentsData from '@/data/students.json';
import collegesData from '@/data/colleges.json';

const CANDIDATE = (studentsData as StudentProfile[])[0];
const CANDIDATE_RANK = CANDIDATE.exam.dcetRank;

const INDIAN_DIGITS = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const formatNumber = (value: number) => INDIAN_DIGITS.format(value);
const formatRupees = (value: number) => `₹${INDIAN_DIGITS.format(value)}`;

type SortKey = 'cutoff' | 'chance' | 'fee' | 'nirf';

interface SortSpec {
  key: SortKey;
  label: string;
}

const SORTS: SortSpec[] = [
  { key: 'cutoff', label: 'Hardest first' },
  { key: 'chance', label: 'Best chance' },
  { key: 'fee', label: 'Cheapest first' },
  { key: 'nirf', label: 'NIRF rank' },
];

interface FilterState {
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

interface FacetOption {
  value: string;
  label: string;
  count: number;
}

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

const GRID_COLUMNS_LG =
  'lg:grid-cols-[3.25rem_minmax(0,1fr)_8.5rem_9.5rem_8rem_4rem]';

const ROW_GRID = clsx(
  'grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2',
  'md:grid-cols-[3.25rem_minmax(0,1fr)_8rem_4rem] md:items-center',
  GRID_COLUMNS_LG,
  'lg:gap-y-0',
);

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

interface OptionRowProps {
  choice: OptionChoice;
  index: number;
  total: number;
  isDragOver: boolean;
  onDragStart: (e: React.DragEvent<HTMLLIElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLLIElement>) => void;
  onDrop: (e: React.DragEvent<HTMLLIElement>) => void;
  onDragEnd: () => void;
  onRemove: () => void;
}

const OptionRow: React.FC<OptionRowProps> = ({
  choice,
  index,
  total,
  isDragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onRemove,
}) => {
  const priority = index + 1;
  const facts = OPTION_FACTS.get(optionKey(choice.collegeCode, choice.branchCode));

  return (
    <li
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={clsx(
        'relative border-b border-hairline bg-panel px-4 py-3 sm:px-5 transition-colors cursor-grab active:cursor-grabbing',
        isDragOver ? 'border-t-2 border-t-oxide bg-sunken' : 'hover:bg-ground',
      )}
    >
      <div className={ROW_GRID}>
        <div className={clsx(CELL_PRIORITY, 'flex items-center gap-1.5')}>
          <GripVertical aria-hidden className="size-4 text-ink-muted shrink-0" />
          <span
            data-numeric
            className="font-mono text-sm tabular-nums text-ink font-medium"
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
            {choice.probabilityScore}% · {choice.probabilityTier}
          </span>
        </div>

        <div className={clsx(CELL_ACTIONS, 'flex items-center justify-end')}>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove option ${priority}`}
            title="Remove option"
            className="grid size-9 place-items-center rounded-sm text-ink-muted hover:bg-sunken hover:text-ink transition-colors"
          >
            <Trash2 aria-hidden className="size-4" />
          </button>
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
            <span className="block truncate text-micro text-ink-muted">
              {choice.isSnqApplied && facts
                ? `SNQ waiver from ${formatRupees(facts.fullTuitionFee)}`
                : 'no fee waiver'}
            </span>
          </div>
        </div>
      </div>
    </li>
  );
};

/* ------------------------------------------------------------
   Filter Dialog
   ------------------------------------------------------------ */

interface FilterDialogProps {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  districtOptions: FacetOption[];
  branchOptions: FacetOption[];
  feeCeiling: number;
}

const FilterDialog: React.FC<FilterDialogProps> = ({
  open,
  onClose,
  filters,
  setFilters,
  districtOptions,
  branchOptions,
  feeCeiling,
}) => {
  const toggleDistrict = (d: string) => {
    setFilters((prev) => ({
      ...prev,
      districts: prev.districts.includes(d)
        ? prev.districts.filter((item) => item !== d)
        : [...prev.districts, d],
    }));
  };

  const toggleBranch = (b: string) => {
    setFilters((prev) => ({
      ...prev,
      branchCodes: prev.branchCodes.includes(b)
        ? prev.branchCodes.filter((item) => item !== b)
        : [...prev.branchCodes, b],
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Filter options"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setFilters(NO_FILTERS)}
          >
            Clear all
          </Button>
          <Button size="sm" variant="primary" onClick={onClose}>
            Apply filters
          </Button>
        </div>
      }
    >
      <div className="space-y-5 text-sm">
        {/* District */}
        <div>
          <h4 className="font-semibold text-ink mb-2">District</h4>
          <div className="flex flex-wrap gap-1.5">
            {districtOptions.map((opt) => {
              const active = filters.districts.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleDistrict(opt.value)}
                  className={clsx(
                    'px-2.5 py-1 rounded-sm border text-label transition-colors',
                    active
                      ? 'border-ink bg-ink text-ground'
                      : 'border-hairline bg-panel text-ink hover:border-ink',
                  )}
                >
                  {opt.label} ({opt.count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Branch */}
        <div>
          <h4 className="font-semibold text-ink mb-2">Branch</h4>
          <div className="flex flex-wrap gap-1.5">
            {branchOptions.map((opt) => {
              const active = filters.branchCodes.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleBranch(opt.value)}
                  className={clsx(
                    'px-2.5 py-1 rounded-sm border text-label transition-colors',
                    active
                      ? 'border-ink bg-ink text-ground'
                      : 'border-hairline bg-panel text-ink hover:border-ink',
                  )}
                >
                  {opt.label} ({opt.count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Campus Hostel */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.hostelOnly}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, hostelOnly: e.target.checked }))
              }
              className="size-4 accent-ink"
            />
            <span className="text-ink">Campus hostel available only</span>
          </label>
        </div>
      </div>
    </Dialog>
  );
};

/* ------------------------------------------------------------
   Main OptionEntryStudio Component
   ------------------------------------------------------------ */

interface OptionEntryStudioProps {
  student: StudentProfile;
  colleges: College[];
  optionChoices: OptionChoice[];
  onReorderChoices: (choices: OptionChoice[]) => void;
  onRemoveChoice: (index: number) => void;
  onProceedToRounds: () => void;
}

export const OptionEntryStudio: React.FC<OptionEntryStudioProps> = ({
  student,
  colleges,
  optionChoices,
  onReorderChoices,
  onRemoveChoice,
  onProceedToRounds,
}) => {
  const [sortKey, setSortKey] = useState<SortKey>('cutoff');
  const [filters, setFilters] = useState<FilterState>(NO_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [removed, setRemoved] = useState<{ choice: OptionChoice; index: number } | null>(null);

  const allRecs = useMemo(
    () => calculateCollegeRecommendations(student, colleges),
    [student, colleges],
  );

  const byName = (a: RecommendationResult, b: RecommendationResult) =>
    a.college.name.localeCompare(b.college.name);

  const sortChoices = useCallback(
    (choicesToSort: OptionChoice[], key: SortKey) => {
      const recMap = new Map(allRecs.map((r) => [optionKey(r.college.code, r.branch.branchCode), r]));
      const sorted = [...choicesToSort].sort((a, b) => {
        const recA = recMap.get(optionKey(a.collegeCode, a.branchCode));
        const recB = recMap.get(optionKey(b.collegeCode, b.branchCode));
        if (!recA || !recB) return 0;

        if (key === 'cutoff') {
          return recA.effectiveCutoff - recB.effectiveCutoff || byName(recA, recB);
        }
        if (key === 'chance') {
          return (
            recB.probabilityScore - recA.probabilityScore ||
            recA.effectiveCutoff - recB.effectiveCutoff ||
            byName(recA, recB)
          );
        }
        if (key === 'fee') {
          return recA.tuitionFee - recB.tuitionFee || byName(recA, recB);
        }
        if (key === 'nirf') {
          return (
            (recA.college.nirfRank ?? Number.MAX_SAFE_INTEGER) -
              (recB.college.nirfRank ?? Number.MAX_SAFE_INTEGER) || byName(recA, recB)
          );
        }
        return 0;
      });

      return sorted.map((c, i) => ({ ...c, priority: i + 1 }));
    },
    [allRecs],
  );

  const handleSortChange = (key: SortKey) => {
    setSortKey(key);
    onReorderChoices(sortChoices(optionChoices, key));
  };

  // Drag & Drop
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (dropIdx: number) => {
    if (draggedIndex === null || draggedIndex === dropIdx) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...optionChoices];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(dropIdx, 0, moved);

    onReorderChoices(updated.map((item, i) => ({ ...item, priority: i + 1 })));
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleRemove = (index: number) => {
    const choice = optionChoices[index];
    if (!choice) return;
    setRemoved({ choice, index });
    onRemoveChoice(index);
  };

  const handleRestore = () => {
    if (!removed) return;
    const next = [...optionChoices];
    const at = Math.min(removed.index, next.length);
    next.splice(at, 0, removed.choice);
    onReorderChoices(next.map((c, i) => ({ ...c, priority: i + 1 })));
    setRemoved(null);
  };

  // Filter facets
  const districtOptions: FacetOption[] = useMemo(() => {
    const tally = new Map<string, number>();
    allRecs.forEach((r) => tally.set(r.college.district, (tally.get(r.college.district) ?? 0) + 1));
    return Array.from(tally.entries()).map(([value, count]) => ({
      value,
      label: value,
      count,
    }));
  }, [allRecs]);

  const branchOptions: FacetOption[] = useMemo(() => {
    const tally = new Map<string, FacetOption>();
    allRecs.forEach((r) => {
      const existing = tally.get(r.branch.branchCode);
      tally.set(r.branch.branchCode, {
        value: r.branch.branchCode,
        label: r.branch.branchName,
        count: (existing?.count ?? 0) + 1,
      });
    });
    return Array.from(tally.values());
  }, [allRecs]);

  const fees = allRecs.map((rec) => rec.tuitionFee);
  const feeCeiling = fees.length ? Math.ceil(Math.max(...fees) / 1000) * 1000 : 0;

  // Filtered visible choices
  const visibleChoices = useMemo(() => {
    const recMap = new Map(allRecs.map((r) => [optionKey(r.college.code, r.branch.branchCode), r]));
    return optionChoices.filter((c) => {
      const rec = recMap.get(optionKey(c.collegeCode, c.branchCode));
      if (!rec) return true;
      if (filters.districts.length > 0 && !filters.districts.includes(rec.college.district)) return false;
      if (filters.branchCodes.length > 0 && !filters.branchCodes.includes(rec.branch.branchCode)) return false;
      if (filters.hostelOnly && !rec.college.hasCampusHostel) return false;
      return true;
    });
  }, [allRecs, filters, optionChoices]);

  const total = optionChoices.length;

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold tracking-[-0.012em] text-ink">
          Order your options
        </h2>
      </header>

      {/* Filter and Sort bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Sort pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {SORTS.map((s) => {
            const active = sortKey === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => handleSortChange(s.key)}
                className={clsx(
                  'px-3.5 py-1.5 text-label font-medium rounded-sm border transition-colors',
                  active
                    ? 'border-ink bg-ink text-ground shadow-xs'
                    : 'border-hairline bg-panel text-ink hover:bg-sunken',
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Filter Trigger button */}
        <div className="flex items-center gap-2">
          <Button
            size="md"
            variant="secondary"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-1.5"
          >
            <SlidersHorizontal aria-hidden className="size-3.5" />
            Filters
            {(filters.districts.length > 0 ||
              filters.branchCodes.length > 0 ||
              filters.hostelOnly) && (
              <Badge tone="neutral" className="ml-1 px-1 py-0 text-micro">
                {filters.districts.length +
                  filters.branchCodes.length +
                  (filters.hostelOnly ? 1 : 0)}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {total === 0 ? (
        <Panel headingLevel="h3" title="No options entered">
          <p className="measure text-sm text-ink-soft">
            An empty list ends the season with no seat. Click below to reload the recommended options.
          </p>
          <Button
            size="md"
            variant="primary"
            className="mt-3"
            onClick={() => onReorderChoices(sortChoices(allRecs.map((r, i) => ({
              priority: i + 1,
              collegeCode: r.college.code,
              collegeName: r.college.name,
              collegeDistrict: r.college.district,
              branchCode: r.branch.branchCode,
              branchName: r.branch.branchName,
              tuitionFee: r.tuitionFee,
              isSnqApplied: r.isSnqApplied,
              probabilityTier: r.probabilityTier,
              probabilityScore: r.probabilityScore,
            })), sortKey))}
          >
            Reload all options
          </Button>
        </Panel>
      ) : (
        <Panel
          headingLevel="h3"
          padded={false}
          title="Your option list"
          aside={
            <Badge tone="neutral" mono>
              {visibleChoices.length} {visibleChoices.length === 1 ? 'option' : 'options'}
            </Badge>
          }
        >
          {removed && (
            <div className="border-b border-hairline bg-ground px-4 py-2.5 sm:px-5 flex items-center justify-between text-sm">
              <span className="text-ink-soft">
                Removed <strong className="text-ink">{removed.choice.collegeName}</strong>
              </span>
              <Button size="sm" variant="secondary" onClick={handleRestore}>
                <Undo2 aria-hidden className="size-3.5" />
                Undo
              </Button>
            </div>
          )}

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
            <span className="text-right">Action</span>
          </div>

          <ol>
            {visibleChoices.map((choice, index) => (
              <OptionRow
                key={optionKey(choice.collegeCode, choice.branchCode)}
                choice={choice}
                index={index}
                total={visibleChoices.length}
                isDragOver={dragOverIndex === index}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={() => {
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                onRemove={() => handleRemove(index)}
              />
            ))}
          </ol>
        </Panel>
      )}

      {/* Next Step */}
      <div className="flex justify-end pt-2">
        <Button
          variant="primary"
          size="lg"
          onClick={onProceedToRounds}
          disabled={total === 0}
        >
          Proceed to seat allotment rounds
        </Button>
      </div>

      <FilterDialog
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        districtOptions={districtOptions}
        branchOptions={branchOptions}
        feeCeiling={feeCeiling}
      />
    </div>
  );
};
