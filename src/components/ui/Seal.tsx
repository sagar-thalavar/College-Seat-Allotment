'use client';

import React from 'react';
import { clsx } from 'clsx';

interface SealProps {
  /** The word stamped across the middle — VERIFIED, ALLOTTED. */
  mark: string;
  /** The date the record was settled. */
  date: string;
  /** The line beneath the date — DCET 2026, ROUND 1. */
  caption: string;
  className?: string;
}

/**
 * The one deliberate moment of delight in the product, and the reason it is
 * earned: pressing a seal onto a verified record is what a government office
 * physically does. Confetti would be a product congratulating itself; this is
 * the document being finished.
 *
 * Runs once on mount. Transform only, so it never moves layout. The global
 * reduced-motion rule collapses it to its resting state without help here.
 *
 * Circular by nature — a stamp is round. This is the only sanctioned
 * `rounded-full` on the surface.
 */
export const Seal: React.FC<SealProps> = ({ mark, date, caption, className }) => (
  <div
    aria-hidden
    className={clsx(
      'grid size-20 shrink-0 -rotate-6 place-items-center rounded-full border-2 border-oxide text-oxide sm:size-24',
      className,
    )}
    style={{ animation: 'seal-press var(--dur-slow) var(--ease-out-quart) both' }}
  >
    <div className="grid size-[84%] place-items-center rounded-full border border-oxide-edge px-1 text-center">
      <span className="text-micro font-semibold tracking-[0.14em]">{mark}</span>
      <span className="font-mono text-micro tabular-nums" data-numeric>
        {date}
      </span>
      <span className="text-micro leading-3">{caption}</span>
    </div>
  </div>
);
