'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { StudentProfile } from '@/types';
import { StageNav, type Stage } from './StageNav';

export const SHELL_COLUMN = 'mx-auto w-full max-w-6xl px-4 sm:px-6';

interface NavbarProps {
  student: StudentProfile;
  currentStage: Stage;
  highestStageReached: Stage;
  onSelectStage: (stage: Stage) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  student,
  currentStage,
  highestStageReached,
  onSelectStage,
}) => {
  const hasPulledRecord = currentStage > 1;

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] border-b border-hairline bg-panel">
      <div className={SHELL_COLUMN}>
        <div className="flex items-start justify-between gap-4 pt-2.5 pb-1 sm:pt-4 sm:pb-2.5">
          <div className="min-w-0">
            <p className="text-base font-semibold tracking-[-0.01em] text-ink sm:text-lg">
              College Seat Allotment
            </p>
            <span
              aria-hidden
              className="mt-1 block h-0.5 w-8 origin-left bg-oxide animate-[rule-draw_var(--dur-slow)_var(--ease-out-quart)]"
            />
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
                  <Check aria-hidden className="size-3 text-pine shrink-0" />
                )}
                <span>Rank {student.exam.dcetRank.toLocaleString('en-IN')}</span>
                <span>·</span>
                <span>{student.reservations.casteCategory}</span>
              </dd>
            </dl>
          )}
        </div>

        <div className="border-t border-hairline py-1">
          <StageNav
            currentStage={currentStage}
            highestStageReached={highestStageReached}
            onSelectStage={onSelectStage}
          />
        </div>
      </div>
    </header>
  );
};
