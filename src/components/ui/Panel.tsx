'use client';

import React from 'react';
import { clsx } from 'clsx';

interface PanelProps {
  /** Rendered as the panel's heading. Omit for an unlabelled group. */
  title?: React.ReactNode;
  /** Sits opposite the title on the header rule — status, count, one action. */
  aside?: React.ReactNode;
  /** One line under the title. Explains the panel; never decorates it. */
  note?: React.ReactNode;
  headingLevel?: 'h2' | 'h3';
  padded?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * A ruled section, not a card. No shadow, no floating, no nesting.
 * Structure on this surface comes from hairlines and density.
 */
export const Panel: React.FC<PanelProps> = ({
  title,
  aside,
  note,
  headingLevel = 'h2',
  padded = true,
  className,
  children,
}) => {
  const Heading = headingLevel;

  return (
    <section
      className={clsx('border border-hairline bg-ground rounded-sm', className)}
    >
      {(title || aside) && (
        <header className="flex items-start justify-between gap-4 border-b border-hairline px-4 py-3 sm:px-5">
          <div className="min-w-0">
            {title && (
              <Heading className="text-sm font-semibold tracking-[-0.006em] text-ink">
                {title}
              </Heading>
            )}
            {note && (
              <p className="mt-0.5 text-label text-ink-muted measure">{note}</p>
            )}
          </div>
          {aside && <div className="shrink-0">{aside}</div>}
        </header>
      )}
      <div className={clsx(padded && 'px-4 py-4 sm:px-5')}>{children}</div>
    </section>
  );
};
