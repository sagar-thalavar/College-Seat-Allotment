'use client';

import React from 'react';
import { clsx } from 'clsx';

type BadgeTone = 'neutral' | 'verified' | 'grave' | 'outline';

interface BadgeProps {
  tone?: BadgeTone;
  mono?: boolean;
  className?: string;
  children: React.ReactNode;
}

const TONE: Record<BadgeTone, string> = {
  neutral: 'bg-sunken text-ink-soft border-hairline',
  verified: 'bg-pine-wash text-pine border-pine-edge',
  grave: 'bg-oxide-wash text-oxide-deep border-oxide-edge',
  outline: 'bg-transparent text-ink-muted border-rule',
};

export const Badge: React.FC<BadgeProps> = ({
  tone = 'neutral',
  mono = false,
  className,
  children,
}) => (
  <span
    className={clsx(
      'inline-flex items-center gap-1 rounded-xs border px-1.5 py-0.5 text-micro font-medium leading-4',
      mono && 'font-mono tabular-nums tracking-tight',
      TONE[tone],
      className,
    )}
  >
    {children}
  </span>
);
