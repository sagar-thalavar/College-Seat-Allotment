'use client';

import React from 'react';
import { clsx } from 'clsx';
import { Check, ChevronLeft } from 'lucide-react';

/**
 * The three stages of the allotment: Record, Slip, Preferences.
 */
export const STAGE_LABELS = [
  'Record',
  'Slip',
  'Preferences',
] as const;

export const TOTAL_STAGES = STAGE_LABELS.length;

export type Stage = 1 | 2 | 3;

interface StageNavProps {
  currentStage: Stage;
  /** The furthest stage the candidate has actually earned. Nothing past it is reachable. */
  highestStageReached: Stage;
  onSelectStage: (stage: Stage) => void;
}

const ITEM =
  'inline-flex min-h-11 items-center gap-1.5 rounded-sm px-2 text-label ' +
  'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-quart)] sm:min-h-9';

export const StageNav: React.FC<StageNavProps> = ({
  currentStage,
  highestStageReached,
  onSelectStage,
}) => {
  const mobileBackStage = currentStage > 1 ? currentStage - 1 : 0;

  return (
    <nav aria-label="Admission stages" className="flex items-center gap-3">
      <ol className="flex min-w-0 flex-1 items-center">
        {STAGE_LABELS.map((label, index) => {
          const stage = (index + 1) as Stage;
          const isCurrent = stage === currentStage;
          const isReached = stage <= highestStageReached;
          const isVisibleOnMobile =
            isCurrent || (stage === mobileBackStage && isReached);

          return (
            <li
              key={label}
              className={clsx(
                'items-center',
                isVisibleOnMobile ? 'flex' : 'hidden sm:flex',
              )}
            >
              {index > 0 && (
                <span
                  aria-hidden
                  className="hidden select-none px-0.5 text-rule sm:inline"
                >
                  ·
                </span>
              )}

              {isCurrent ? (
                <span
                  aria-current="step"
                  className={clsx(ITEM, 'relative font-semibold text-ink')}
                >
                  {label}
                  <span className="sr-only">
                    , stage {stage} of {TOTAL_STAGES}
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-2 bottom-1.5 h-0.5 rounded-xs bg-oxide sm:bottom-1"
                  />
                </span>
              ) : isReached ? (
                <button
                  type="button"
                  onClick={() => onSelectStage(stage)}
                  aria-label={`Go to ${label}, stage ${stage} of ${TOTAL_STAGES}, completed`}
                  className={clsx(
                    ITEM,
                    'text-ink-soft hover:bg-sunken hover:text-ink active:translate-y-px',
                  )}
                >
                  <ChevronLeft aria-hidden className="size-4 sm:hidden" />
                  <Check aria-hidden className="hidden size-3 text-pine sm:block" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  aria-label={`${label}, stage ${stage} of ${TOTAL_STAGES}, not reached yet`}
                  className={clsx(ITEM, 'cursor-not-allowed text-ink-off')}
                >
                  {label}
                </button>
              )}
            </li>
          );
        })}
      </ol>

      <p
        aria-hidden
        className="shrink-0 font-mono text-micro tabular-nums text-ink-muted sm:hidden"
      >
        {currentStage} of {TOTAL_STAGES}
      </p>
    </nav>
  );
};
