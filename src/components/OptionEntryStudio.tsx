'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { Check, GripVertical, Lock, Printer, Trash2, Undo2 } from 'lucide-react';
import {
  Button,
  ProbabilityBar,
} from '@/components/ui';
import { College, OptionChoice, StudentProfile } from '@/types';
import { calculateCollegeRecommendations } from '@/lib/recommendation';
import studentsData from '@/data/students.json';
import collegesData from '@/data/colleges.json';

const CANDIDATE = (studentsData as StudentProfile[])[0];
const STORAGE_KEY = 'kea_submitted_preferences_certificate_v2';

const INDIAN_DIGITS = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const formatNumber = (value: number) => INDIAN_DIGITS.format(value);
const formatRupees = (value: number) => `₹${INDIAN_DIGITS.format(value)}`;

type SortKey = 'chance' | 'fee' | 'nirf';

interface SortSpec {
  key: SortKey;
  label: string;
}

const SORTS: SortSpec[] = [
  { key: 'chance', label: 'Best chance' },
  { key: 'fee', label: 'Lowest fees' },
  { key: 'nirf', label: 'NIRF rank' },
];

interface OptionFacts {
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
  isDragOver: boolean;
  isLocked: boolean;
  onDragStart: (e: React.DragEvent<HTMLLIElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLLIElement>) => void;
  onDrop: (e: React.DragEvent<HTMLLIElement>) => void;
  onDragEnd: () => void;
  onRemove: () => void;
}

const OptionRow: React.FC<OptionRowProps> = ({
  choice,
  index,
  isDragOver,
  isLocked,
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
      draggable={!isLocked}
      onDragStart={isLocked ? undefined : onDragStart}
      onDragOver={isLocked ? undefined : onDragOver}
      onDrop={isLocked ? undefined : onDrop}
      onDragEnd={isLocked ? undefined : onDragEnd}
      className={clsx(
        'relative border-b border-hairline bg-panel px-4 py-3 sm:px-5 transition-all',
        !isLocked && 'cursor-grab active:cursor-grabbing hover:bg-ground',
        !isLocked && index === 0 && 'animate-row-intro-lift',
        isDragOver && 'border-t-2 border-t-oxide bg-sunken',
      )}
    >
      <div className={ROW_GRID}>
        <div className={clsx(CELL_PRIORITY, 'flex items-center gap-1.5')}>
          {isLocked ? (
            <Lock aria-hidden className="size-3.5 text-pine/80 shrink-0" />
          ) : (
            <GripVertical aria-hidden className="size-4 text-ink-muted shrink-0" />
          )}
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
          {isLocked ? (
            <span className="font-mono text-micro text-pine font-medium">Locked</span>
          ) : (
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove option ${priority}`}
              title="Remove option"
              className="grid size-9 place-items-center rounded-sm text-ink-muted hover:bg-sunken hover:text-ink transition-colors"
            >
              <Trash2 aria-hidden className="size-4" />
            </button>
          )}
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

function sortChoices(choices: OptionChoice[], key: SortKey): OptionChoice[] {
  const sorted = [...choices];
  switch (key) {
    case 'chance':
      sorted.sort((a, b) => b.probabilityScore - a.probabilityScore);
      break;
    case 'fee':
      sorted.sort((a, b) => a.tuitionFee - b.tuitionFee);
      break;
    case 'nirf': {
      const collegeMap = new Map(
        (collegesData as College[]).map((c) => [c.code, c.nirfRank ?? 9999]),
      );
      sorted.sort(
        (a, b) =>
          (collegeMap.get(a.collegeCode) ?? 9999) -
          (collegeMap.get(b.collegeCode) ?? 9999),
      );
      break;
    }
  }
  return sorted.map((c, i) => ({ ...c, priority: i + 1 }));
}

interface SubmissionRecord {
  isSubmitted: boolean;
  submittedAt: string;
  referenceNo: string;
}

interface OptionEntryStudioProps {
  optionChoices: OptionChoice[];
  onReorderChoices: (choices: OptionChoice[]) => void;
  onProceedToRounds: () => void;
  student?: StudentProfile;
  colleges?: College[];
  onRemoveChoice?: (index: number) => void;
}

export const OptionEntryStudio: React.FC<OptionEntryStudioProps> = ({
  optionChoices,
  onReorderChoices,
  student,
}) => {
  const choices = optionChoices;
  const [sortKey, setSortKey] = useState<SortKey>('chance');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [removed, setRemoved] = useState<{ choice: OptionChoice; index: number } | null>(null);
  const [submission, setSubmission] = useState<SubmissionRecord | null>(null);

  // Load persistent submission certificate from browser localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.isSubmitted) {
          setSubmission(parsed);
        }
      }
    } catch {
      // Ignore local storage error
    }
  }, []);

  const allRecs = useMemo(
    () => calculateCollegeRecommendations(CANDIDATE, collegesData as College[]),
    [],
  );

  const handleSortChange = (key: SortKey) => {
    if (submission?.isSubmitted) return;
    setSortKey(key);
    onReorderChoices(sortChoices(choices, key));
  };

  const handleDragStart = (index: number) => {
    if (submission?.isSubmitted) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    if (submission?.isSubmitted) return;
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (dropIndex: number) => {
    if (submission?.isSubmitted) return;
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...choices];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(dropIndex, 0, moved);

    const updated = reordered.map((item, idx) => ({
      ...item,
      priority: idx + 1,
    }));

    onReorderChoices(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleRemove = useCallback(
    (index: number) => {
      if (submission?.isSubmitted) return;
      const choice = choices[index];
      if (!choice) return;

      const next = choices
        .filter((_, i) => i !== index)
        .map((c, i) => ({ ...c, priority: i + 1 }));

      onReorderChoices(next);
      setRemoved({ choice, index });
    },
    [choices, onReorderChoices, submission?.isSubmitted],
  );

  const handleRestore = useCallback(() => {
    if (!removed || submission?.isSubmitted) return;
    const next = [...choices];
    next.splice(removed.index, 0, removed.choice);
    onReorderChoices(next.map((c, i) => ({ ...c, priority: i + 1 })));
    setRemoved(null);
  }, [choices, onReorderChoices, removed, submission?.isSubmitted]);

  const handleSubmit = () => {
    const record: SubmissionRecord = {
      isSubmitted: true,
      submittedAt: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      referenceNo: `KEA/DCET26/OPT-${Math.floor(10000 + Math.random() * 90000)}`,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {}
    setSubmission(record);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isLocked = Boolean(submission?.isSubmitted);
  const total = choices.length;

  // -------------------------------------------------------------------------
  // Submitted Acknowledgement View (Clean Card + 10-Option Table + Print)
  // -------------------------------------------------------------------------
  if (isLocked && submission) {
    const candidateName = student?.name ?? CANDIDATE.name;
    const rank = student?.exam.dcetRank ?? CANDIDATE.exam.dcetRank;
    const rollNo = student?.exam.dcetRollNo ?? CANDIDATE.exam.dcetRollNo;

    return (
      <div className="space-y-6 max-w-4xl mx-auto py-2 animate-[row-settle_var(--dur-base)_var(--ease-out-quart)]">
        {/* Main Acknowledgement Card (On-Screen View Only) */}
        <article className="overflow-hidden rounded-sm border border-rule bg-panel shadow-sm no-print">
          {/* Masthead */}
          <div className="border-b border-rule px-5 py-5 sm:px-8 sm:py-6 bg-ground/50">
            <span className="text-micro font-semibold uppercase tracking-[0.08em] text-pine flex items-center gap-1.5">
              <Check className="size-3.5" />
              Application Submitted &amp; Locked
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">
              College Priority Acknowledgement
            </h2>
            <p className="mt-1 font-mono text-sm text-ink-soft">
              Application Ref:{' '}
              <span className="font-semibold text-ink select-all">
                {submission.referenceNo}
              </span>
            </p>
          </div>

          {/* Core Notice */}
          <div className="border-b border-hairline bg-pine/5 px-5 py-4 sm:px-8 text-sm text-ink">
            <p className="font-medium text-pine">
              Round 1 seat allocation results will be announced on the portal within 24–48 hours.
            </p>
          </div>

          {/* Candidate & Submission Summary */}
          <div className="px-5 py-5 sm:px-8">
            <h3 className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted mb-3">
              Candidate &amp; Submission Summary
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div className="border-b border-hairline/60 pb-2">
                <dt className="text-xs text-ink-muted">Candidate Name</dt>
                <dd className="font-medium text-ink mt-0.5">{candidateName}</dd>
              </div>
              <div className="border-b border-hairline/60 pb-2">
                <dt className="text-xs text-ink-muted">DCET Rank &amp; Roll Number</dt>
                <dd className="font-mono font-medium text-ink mt-0.5">
                  Rank {rank.toLocaleString('en-IN')} · Roll {rollNo}
                </dd>
              </div>
            </dl>
          </div>

          {/* Action Bar */}
          <div className="bg-ground px-5 py-4 sm:px-8 flex items-center justify-end border-t border-hairline">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                const prev = document.title;
                document.title = ' ';
                window.print();
                setTimeout(() => {
                  document.title = prev;
                }, 500);
              }}
              className="flex items-center gap-1.5"
            >
              <Printer className="size-4" />
              Print Allotment List
            </Button>
          </div>
        </article>

        {/* Single-Page Printable Slip Document (Hidden on screen, renders in Print / PDF only) */}
        <div className="hidden print:block space-y-4 text-ink">
          {/* Top Line: Application Ref & KEA */}
          <div className="border-b border-ink/30 pb-2 flex items-center justify-between text-xs">
            <span className="font-mono text-ink-muted">
              Application Ref: <span className="font-semibold text-ink">{submission.referenceNo}</span>
            </span>
            <span className="font-bold text-base uppercase tracking-wider text-ink">KEA</span>
          </div>

          {/* Candidate Details */}
          <div className="border-b border-ink/30 pb-3">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div>
                <dt className="text-ink-muted">Candidate Name</dt>
                <dd className="font-semibold text-ink text-sm mt-0.5">{candidateName}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">DCET Rank &amp; Roll Number</dt>
                <dd className="font-mono font-semibold text-ink text-sm mt-0.5">
                  Rank {rank.toLocaleString('en-IN')} · Roll {rollNo}
                </dd>
              </div>
            </dl>
          </div>

          {/* Single-Page Table of Entered Colleges */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-ink/40 pb-1 text-xs font-semibold uppercase text-ink">
              <span className="w-12 text-center">Sl No.</span>
              <span className="flex-1 pl-2">College &amp; Branch Preference</span>
            </div>

            <ol className="divide-y divide-hairline">
              {choices.map((choice, index) => {
                const cleanName = choice.collegeName.replace(/\s*\([^)]*\)/g, '').trim();
                return (
                  <li
                    key={optionKey(choice.collegeCode, choice.branchCode)}
                    className="py-1.5 flex items-start text-xs"
                  >
                    <span className="w-12 text-center font-mono font-medium text-ink pt-0.5 shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 pl-2 min-w-0">
                      <span className="block font-semibold text-ink text-sm leading-snug">
                        {cleanName}
                      </span>
                      <span className="block text-ink-soft text-xs mt-0.5">
                        {choice.branchName} · {choice.collegeDistrict}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Normal Editable Preferences View (Before Submission)
  // -------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-2xl font-semibold tracking-[-0.015em] text-ink">
          College Preferences
        </h2>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-sunken border border-hairline text-micro font-medium text-ink-soft self-start sm:self-auto">
          <GripVertical aria-hidden className="size-3.5 text-oxide animate-drag-hint shrink-0" />
          <span>Reorder priorities</span>
        </div>
      </header>

      {/* Filter and Sort bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
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
      </div>

      {total === 0 ? (
        <div className="rounded-sm border border-hairline bg-panel p-5">
          <p className="measure text-sm text-ink-soft">
            An empty list ends the season with no seat. Click below to reload the recommended options.
          </p>
          <Button
            size="md"
            variant="primary"
            className="mt-3"
            onClick={() =>
              onReorderChoices(
                sortChoices(
                  allRecs.map((r, i) => ({
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
                  })),
                  sortKey,
                ),
              )
            }
          >
            Reload all options
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-sm border border-hairline bg-panel shadow-xs">
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
            {choices.map((choice, index) => (
              <OptionRow
                key={optionKey(choice.collegeCode, choice.branchCode)}
                choice={choice}
                index={index}
                isDragOver={dragOverIndex === index}
                isLocked={false}
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
        </div>
      )}

      {/* Apply for Seat Allocation CTA Button */}
      <div className="flex justify-end pt-2">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={total === 0}
        >
          Apply for Seat Allocation
        </Button>
      </div>
    </div>
  );
};
