'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { StudentProfile } from '@/types';
import { StageNav, type Stage } from './StageNav';

/**
 * The single column every part of the shell aligns to — masthead, stage rail,
 * content and footer. 72rem (1152px).
 *
 * Why not the old `max-w-4xl` (896px): that width was picked for a page of
 * cards. This product's widest screen is a cutoff table carrying a college, a
 * branch, three years of category cutoffs, an intake, a fee and a probability
 * bar on one row — roughly ten columns of tabular figures. At 896px those
 * columns wrap or truncate, and a wrapped rank is a misread rank. 1152px seats
 * them at 13px with real gutters, and still stops well short of the full width
 * of a 1440px screen, so prose inside a panel never runs past its measure.
 */
export const SHELL_COLUMN = 'mx-auto w-full max-w-6xl px-4 sm:px-6';

interface NavbarProps {
  student: StudentProfile;
  currentStage: Stage;
  highestStageReached: Stage;
  onSelectStage: (stage: Stage) => void;
}

/**
 * A quiet institutional masthead: a typographic wordmark, the candidate's
 * identity as secondary information, and the stage rail. No emblem — this is a
 * demonstration build and must never dress as the state's own portal.
 */
export const Navbar: React.FC<NavbarProps> = ({
  student,
  currentStage,
  highestStageReached,
  onSelectStage,
}) => {
  // Nothing is known about the candidate until the record has been pulled,
  // which is what stage 1 does. Showing a name above an empty form would be a lie.
  const hasPulledRecord = currentStage > 1;

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] border-b border-hairline bg-panel">
      <div className={SHELL_COLUMN}>
        <div className="flex items-start justify-between gap-4 pt-2.5 pb-1 sm:pt-4 sm:pb-2.5">
          <div className="min-w-0">
            <p className="text-base font-semibold tracking-[-0.01em] text-ink sm:text-lg">
              KEA
            </p>
            {/* The one deliberate use of `rule-draw`: the identity rule, drawn once. */}
            <span
              aria-hidden
              className="mt-1 block h-0.5 w-8 origin-left bg-oxide animate-[rule-draw_var(--dur-slow)_var(--ease-out-quart)]"
            />
            <p className="mt-1.5 hidden text-label text-ink-muted sm:block">
              College Seat Allotment
            </p>
          </div>

          {hasPulledRecord && (
            <dl className="min-w-0 shrink text-right">
              <dt className="sr-only">Candidate</dt>
              <dd className="truncate text-label leading-4 font-medium text-ink">
                {student.name}
              </dd>
              <dt className="sr-only">DCET rank and category</dt>
              <dd className="flex items-center justify-end gap-1 font-mono text-micro leading-4 tabular-nums text-ink-muted">
                {student.verification.isVerified && (
                  <>
                    <Check aria-hidden className="size-3 shrink-0 text-pine" />
                    <span className="sr-only">Verified.</span>
                  </>
                )}
                <span>
                  Rank {student.exam.dcetRank.toLocaleString('en-IN')}
                </span>
              </dd>
            </dl>
          )}
        </div>

        <StageNav
          currentStage={currentStage}
          highestStageReached={highestStageReached}
          onSelectStage={onSelectStage}
        />
      </div>
    </header>
  );
};
