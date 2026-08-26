'use client';

import React from 'react';
import { clsx } from 'clsx';

interface DataRowProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  /** Second line under the value — provenance, the register it came from. */
  source?: string;
  className?: string;
}

/** Label left, value right, hairline between. The shape of a record. */
export const DataRow: React.FC<DataRowProps> = ({
  label,
  value,
  mono = false,
  source,
  className,
}) => (
  <div
    className={clsx(
      'flex items-baseline justify-between gap-4 border-b border-hairline py-2 last:border-b-0',
      className,
    )}
  >
    <dt className="shrink-0 text-label text-ink-muted">{label}</dt>
    <dd className="min-w-0 text-right">
      <span
        className={clsx(
          'text-sm text-ink',
          mono && 'font-mono tabular-nums tracking-tight',
        )}
        data-numeric={mono || undefined}
      >
        {value}
      </span>
      {source && (
        <span className="block text-micro text-ink-muted">{source}</span>
      )}
    </dd>
  </div>
);
