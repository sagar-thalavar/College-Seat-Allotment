'use client';

import React from 'react';
import { clsx } from 'clsx';
import { ProbabilityTier } from '@/types';

interface ProbabilityBarProps {
  score: number;
  tier: ProbabilityTier;
  /** `full` shows the tier word and threshold ticks. `inline` is the dense row form. */
  density?: 'full' | 'inline';
  className?: string;
}

/**
 * Probability is a magnitude, so it is drawn as one — a filled proportion,
 * never a traffic light. A red "Ambitious" badge would tell an anxious
 * student their dream college is an error. It isn't; it's a stretch.
 *
 * The ticks sit on the real tier boundaries (52 / 86), so the scale
 * explains itself and no legend is needed.
 */
const TICKS = [52, 86];

export const ProbabilityBar: React.FC<ProbabilityBarProps> = ({
  score,
  tier,
  density = 'full',
  className,
}) => {
  const clamped = Math.max(0, Math.min(100, score));

  return (
    <div className={clsx('flex items-center gap-2.5', className)}>
      <span
        className="font-mono text-sm font-medium tabular-nums text-ink"
        data-numeric
      >
        {clamped}
        <span className="text-ink-muted">%</span>
      </span>

      <div
        role="meter"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Chance of allotment: ${clamped} percent, rated ${tier}`}
        className={clsx(
          'relative h-1.5 overflow-hidden rounded-xs bg-sunken',
          density === 'full' ? 'w-28' : 'w-16',
        )}
      >
        <div
          className="h-full rounded-xs bg-ink transition-[width] duration-[var(--dur-slow)] ease-[var(--ease-out-quart)]"
          style={{ width: `${clamped}%` }}
        />
        {density === 'full' &&
          TICKS.map((t) => (
            <span
              key={t}
              aria-hidden
              className="absolute top-0 h-full w-px bg-ground/70"
              style={{ left: `${t}%` }}
            />
          ))}
      </div>

      {density === 'full' && (
        <span className="text-label text-ink-muted">{tier}</span>
      )}
    </div>
  );
};
