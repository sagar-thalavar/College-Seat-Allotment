'use client';

import React, { createContext, useContext } from 'react';
import { clsx } from 'clsx';
import { ExternalLink } from 'lucide-react';
import { BranchCutoff, RecommendationResult } from '@/types';
import { Badge, Button, DataRow, Dialog, ProbabilityBar } from '@/components/ui';

/* ------------------------------------------------------------------
   Record formatting.
   These live here, and CollegeRecommendationList imports them, because
   the dependency runs list -> modal in one direction only. A shared
   third file would be cleaner, but this lane owns exactly two files.
   ------------------------------------------------------------------ */

const INDIAN = new Intl.NumberFormat('en-IN');

/** ₹1,26,000 — Indian grouping. Always render in mono, tabular. */
export const formatRupees = (amount: number): string =>
  `₹${INDIAN.format(Math.round(amount))}`;

/** 1,250 */
export const formatRank = (value: number): string => INDIAN.format(value);

export interface ApplicableCategory {
  /** The raw cutoff key — `3AR`, `GM`, `SNQ`. Indexes `branch.cutoffs.*`. */
  key: string;
  /** The human clause the engine attached — "Rural 1st-10th Quota". */
  label: string;
}

/** The engine hands back "3AR (Rural 1st-10th Quota)". Both halves are useful. */
export function parseApplicableCategory(applicable: string): ApplicableCategory {
  const parsed = /^(\S+)\s*\((.+)\)\s*$/.exec(applicable.trim());
  if (!parsed) {
    const key = applicable.trim();
    return { key, label: decodeCategoryKey(key) };
  }
  return { key: parsed[1], label: parsed[2] };
}

/** Turns a bare cutoff key into words a student who has never read the PDF can use. */
export function decodeCategoryKey(key: string): string {
  if (key === 'GM') return 'General merit';
  if (key === 'SNQ') return 'Supernumerary, fee waiver';
  if (key.endsWith('HK')) return `${key.slice(0, -2)} · Article 371J`;
  if (key.endsWith('R')) return `${key.slice(0, -1)} rural quota`;
  if (key.endsWith('G')) return `${key.slice(0, -1)} category`;
  return key;
}

export interface CutoffPoint {
  year: number;
  value: number | null;
}

/** The 3-year run of closing ranks for one category. The thing the PDF hides. */
export function cutoffHistory(branch: BranchCutoff, key: string): CutoffPoint[] {
  return [
    { year: 2023, value: branch.cutoffs.year2023[key] ?? null },
    { year: 2024, value: branch.cutoffs.year2024[key] ?? null },
    { year: 2025, value: branch.cutoffs.year2025[key] ?? null },
  ];
}

export interface CutoffTrend {
  /** Closing ranks in year order, nulls dropped. */
  values: number[];
  /** 2025 minus the earliest known year. */
  delta: number;
  /** "tightening" | "easing" | "steady" — in rank terms, not in optimism terms. */
  word: 'tightening' | 'easing' | 'steady';
  sentence: string;
}

/**
 * A closing rank that FALLS year on year means fewer ranks get in: tightening.
 * Getting this backwards would be the single most misleading thing on the screen,
 * so the direction is named in words and never left to a line's slope.
 */
export function readTrend(points: CutoffPoint[]): CutoffTrend | null {
  const values = points
    .map((point) => point.value)
    .filter((value): value is number => value !== null);
  if (values.length < 2) return null;

  const first = points.find((point) => point.value !== null);
  const delta = values[values.length - 1] - values[0];
  const fromYear = first ? first.year : points[0].year;

  if (delta === 0) {
    return { values, delta, word: 'steady', sentence: `unchanged since ${fromYear}` };
  }
  if (delta < 0) {
    return {
      values,
      delta,
      word: 'tightening',
      sentence: `${formatRank(-delta)} ranks harder than ${fromYear}`,
    };
  }
  return {
    values,
    delta,
    word: 'easing',
    sentence: `${formatRank(delta)} ranks easier than ${fromYear}`,
  };
}

export interface Standing {
  gap: number;
  isInside: boolean;
  /** "1,350 ranks inside" / "230 ranks over" */
  phrase: string;
}

/** A probability is never shown without this. §6 of the brief. */
export function readStanding(rank: number, cutoff: number): Standing {
  const gap = cutoff - rank;
  if (gap === 0) return { gap, isInside: true, phrase: 'exactly on the line' };
  if (gap > 0) {
    return { gap, isInside: true, phrase: `${formatRank(gap)} ranks inside` };
  }
  return { gap, isInside: false, phrase: `${formatRank(-gap)} ranks over` };
}

/* ------------------------------------------------------------------
   The student's rank travels by context, not by prop.

   `RecommendationResult` carries the cutoff but not the rank it was
   judged against, and this component's props are fixed by the build
   contract. Recovering the rank by inverting the probability score
   would be lossy — the score is rounded, so 1,250 comes back as 1,187
   — and a record that misquotes the student's own rank is worse than
   one that omits it. So the list provides the rank; the modal reads it
   and degrades honestly to a bare cutoff statement if no provider sits
   above it.
   ------------------------------------------------------------------ */

const StudentRankContext = createContext<number | null>(null);

export const StudentRankProvider: React.FC<{
  rank: number;
  children: React.ReactNode;
}> = ({ rank, children }) => (
  <StudentRankContext.Provider value={rank}>{children}</StudentRankContext.Provider>
);

/* ------------------------------------------------------------------
   The full record
   ------------------------------------------------------------------ */

interface CollegeDetailModalProps {
  item: RecommendationResult | null;
  onClose: () => void;
  onAddToOption: (item: RecommendationResult) => void;
  isAlreadyAdded: boolean;
}

/** The link text is the host, but a malformed URL must not take the record down. */
function hostOf(website: string): string {
  try {
    return new URL(website).host;
  } catch {
    return 'College website';
  }
}

const Section: React.FC<{
  title: string;
  note?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, note, children }) => (
  <section className="border-t border-hairline pt-5 first:border-t-0 first:pt-0">
    <h3 className="text-label font-semibold tracking-[-0.004em] text-ink">{title}</h3>
    {note && <p className="mt-1 text-label text-ink-muted measure">{note}</p>}
    <div className="mt-2.5">{children}</div>
  </section>
);

const Figure: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="font-mono tabular-nums tracking-tight" data-numeric>
    {children}
  </span>
);

export const CollegeDetailModal: React.FC<CollegeDetailModalProps> = ({
  item,
  onClose,
  onAddToOption,
  isAlreadyAdded,
}) => {
  const studentRank = useContext(StudentRankContext);
  const college = item?.college;
  const branch = item?.branch;

  const category = item ? parseApplicableCategory(item.applicableCategory) : null;
  const standing =
    item && studentRank !== null ? readStanding(studentRank, item.effectiveCutoff) : null;
  const trend = branch && category ? readTrend(cutoffHistory(branch, category.key)) : null;

  /* Every category on the record, 2025's order first so the document reads
     the way the published sheet does, then anything only older years carry. */
  const categoryKeys = branch
    ? Array.from(
        new Set([
          ...Object.keys(branch.cutoffs.year2025),
          ...Object.keys(branch.cutoffs.year2024),
          ...Object.keys(branch.cutoffs.year2023),
        ]),
      )
    : [];

  return (
    <Dialog
      open={!!item}
      onClose={onClose}
      title={college ? college.name : 'College record'}
      subtitle={
        college ? (
          <span>
            {college.shortName} · {college.type} · {college.city}, {college.district} ·
            established <Figure>{college.establishedYear}</Figure>
          </span>
        ) : undefined
      }
      footer={
        <>
          {college && (
            <a
              href={college.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mr-auto inline-flex items-center gap-1.5 rounded-xs text-label font-medium text-ink-soft underline decoration-hairline underline-offset-2 transition-colors duration-[var(--dur-fast)] hover:text-ink hover:decoration-ink"
            >
              {hostOf(college.website)}
              <ExternalLink aria-hidden className="size-3" />
            </a>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          {isAlreadyAdded ? (
            <Badge tone="verified">Already in your option list</Badge>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (item) onAddToOption(item);
                onClose();
              }}
            >
              Add to my option list
            </Button>
          )}
        </>
      }
    >
      {item && college && branch && category ? (
        <div className="space-y-5">
          <Section
            title="What you are judged on here"
            note={`The engine picked ${category.key} for you because it is the loosest closing rank you hold a verified claim to at this branch.`}
          >
            <p className="text-base font-medium text-ink">
              {branch.branchName}{' '}
              <span className="text-ink-muted">({branch.branchCode})</span>
            </p>

            <div className="mt-3 rounded-sm border border-hairline bg-panel px-3 py-3">
              <ProbabilityBar
                score={item.probabilityScore}
                tier={item.probabilityTier}
                density="full"
              />
              <p className="mt-2 text-sm text-ink-soft">
                {standing && studentRank !== null ? (
                  <>
                    Your rank <Figure>{formatRank(studentRank)}</Figure> against last
                    year&rsquo;s <Figure>{category.key}</Figure> closing rank of{' '}
                    <Figure>{formatRank(item.effectiveCutoff)}</Figure> —{' '}
                    <span className="font-medium text-ink">{standing.phrase}</span>.
                  </>
                ) : (
                  <>
                    Measured against last year&rsquo;s <Figure>{category.key}</Figure>{' '}
                    closing rank of{' '}
                    <Figure>{formatRank(item.effectiveCutoff)}</Figure>.
                  </>
                )}
              </p>
              {trend && (
                <p className="mt-1 text-label text-ink-muted">
                  That closing rank has been {trend.word}: {trend.sentence}.
                </p>
              )}
            </div>

            <ul className="mt-3 space-y-1.5">
              {item.matchReasons.map((reason) => (
                <li
                  key={reason}
                  className="flex gap-2 text-sm text-ink-soft before:mt-2 before:size-1 before:shrink-0 before:rounded-xs before:bg-ink-muted before:content-['']"
                >
                  {reason}
                </li>
              ))}
            </ul>
          </Section>

          <Section
            title="Closing ranks, every category, 2023 to 2025"
            note="This is the whole published record for this branch, not only your slice of it. Read down your own row to see whether the line is moving toward you or away."
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[19rem] border-collapse text-sm">
                <caption className="sr-only">
                  Closing rank by reservation category for {branch.branchName} at{' '}
                  {college.name}, 2023 to 2025.
                </caption>
                <thead>
                  <tr className="border-b border-rule">
                    <th
                      scope="col"
                      className="py-1.5 pr-2 text-left text-label font-medium text-ink-muted"
                    >
                      Category
                    </th>
                    {[2023, 2024, 2025].map((year) => (
                      <th
                        key={year}
                        scope="col"
                        className="w-[3.75rem] py-1.5 pl-2 text-right font-mono text-label font-medium tabular-nums text-ink-muted"
                      >
                        {year}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categoryKeys.map((key) => {
                    const isYours = key === category.key;
                    const row = cutoffHistory(branch, key);
                    return (
                      <tr
                        key={key}
                        className={clsx(
                          'border-b border-hairline last:border-b-0',
                          isYours && 'bg-sunken',
                        )}
                      >
                        <th scope="row" className="py-2 pr-2 text-left font-normal">
                          <span className="flex items-center gap-1.5">
                            <span
                              className={clsx(
                                'font-mono text-sm tabular-nums tracking-tight',
                                isYours ? 'font-medium text-ink' : 'text-ink-soft',
                              )}
                            >
                              {key}
                            </span>
                            {isYours && <Badge tone="verified">yours</Badge>}
                          </span>
                          <span className="mt-0.5 block text-micro text-ink-muted">
                            {decodeCategoryKey(key)}
                          </span>
                        </th>
                        {row.map((point) => (
                          <td
                            key={point.year}
                            className={clsx(
                              'py-2 pl-2 text-right font-mono text-sm tabular-nums tracking-tight',
                              isYours ? 'font-medium text-ink' : 'text-ink-soft',
                            )}
                            data-numeric
                          >
                            {point.value === null ? (
                              <span className="text-ink-muted">not offered</span>
                            ) : (
                              formatRank(point.value)
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Section>

          <Section
            title="What a year costs you here"
            note={
              item.isSnqApplied
                ? 'Your income record clears the SNQ ceiling, so the waived fee is the one you would actually pay.'
                : 'The SNQ waiver is not applied at this cutoff, so plan on full tuition for this option.'
            }
          >
            <dl>
              <DataRow label="Annual tuition, full" value={formatRupees(branch.annualTuitionFee)} mono />
              <DataRow label="Annual tuition under SNQ" value={formatRupees(branch.snqAnnualFee)} mono />
              <DataRow
                label="What you pay a year"
                value={formatRupees(item.tuitionFee)}
                mono
                source={item.isSnqApplied ? 'SNQ waiver applied' : 'Full tuition, no waiver'}
              />
              <DataRow
                label="Campus hostel"
                value={college.hasCampusHostel ? 'Available on campus' : 'None — private lodging only'}
              />
              {college.hasCampusHostel && (
                <DataRow
                  label="Hostel and mess a year"
                  value={formatRupees(college.hostelAnnualFee)}
                  mono
                />
              )}
              {college.hasCampusHostel && (
                <DataRow
                  label="First year, tuition and hostel"
                  value={formatRupees(item.tuitionFee + college.hostelAnnualFee)}
                  mono
                  source="Excludes the KEA counselling and admission charges"
                />
              )}
            </dl>
          </Section>

          <Section
            title={`Placements out of ${branch.branchCode} here`}
            note={`Reported by the college for its most recent graduating batch. ${branch.placements.topRecruiters.join(', ')} recruited on campus.`}
          >
            <dl>
              <DataRow label="Average CTC" value={`${branch.placements.averageCtcLpa} LPA`} mono />
              <DataRow label="Median CTC" value={`${branch.placements.medianCtcLpa} LPA`} mono />
              <DataRow label="Highest CTC" value={`${branch.placements.highestCtcLpa} LPA`} mono />
              <DataRow label="Students placed" value={`${branch.placements.placedPercentage}%`} mono />
            </dl>
          </Section>

          <Section title="Seats and the college record">
            <dl>
              <DataRow label="Total intake, this branch" value={formatRank(branch.intakeTotal)} mono />
              <DataRow
                label="Lateral-entry seats"
                value={formatRank(branch.lateralIntake)}
                mono
                source="Your route — diploma holders join in the second year"
              />
              <DataRow label="NAAC grade" value={college.naacGrade} />
              <DataRow
                label="NIRF rank"
                value={college.nirfRank === null ? 'Not ranked' : formatRank(college.nirfRank)}
                mono={college.nirfRank !== null}
              />
              <DataRow label="Established" value={formatRank(college.establishedYear)} mono />
              <DataRow label="Where it is" value={`${college.city}, ${college.district}`} />
              <DataRow label="College code" value={college.code} mono />
            </dl>
          </Section>
        </div>
      ) : null}
    </Dialog>
  );
};
