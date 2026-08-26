'use client';

import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'grave';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingLabel?: string;
}

/**
 * Ink does the work; oxide marks consequence.
 * `grave` is reserved for irreversible actions — locking an option list,
 * surrendering a seat. Using it for an ordinary confirm devalues it.
 */
const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'bg-ink text-ground border border-ink hover:bg-ink-hover hover:border-ink-hover active:translate-y-px',
  secondary:
    'bg-ground text-ink border border-field hover:bg-panel hover:border-ink active:translate-y-px',
  ghost:
    'bg-transparent text-ink-soft border border-transparent hover:bg-sunken hover:text-ink',
  grave:
    'bg-oxide text-ground border border-oxide hover:bg-oxide-deep hover:border-oxide-deep active:translate-y-px',
};

const SIZE: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-label gap-1.5',
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-base gap-2',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  loadingLabel,
  disabled,
  className,
  children,
  ...rest
}) => {
  const isInert = disabled || isLoading;

  return (
    <button
      {...rest}
      disabled={isInert}
      aria-busy={isLoading || undefined}
      className={clsx(
        'inline-flex items-center justify-center rounded-sm font-medium whitespace-nowrap',
        'transition-[background-color,border-color,color,transform] duration-[var(--dur-fast)] ease-[var(--ease-out-quart)]',
        'disabled:cursor-not-allowed disabled:bg-sunken disabled:text-ink-off disabled:border-hairline disabled:hover:translate-y-0',
        SIZE[size],
        VARIANT[variant],
        className,
      )}
    >
      {isLoading && <Loader2 aria-hidden className="size-3.5 animate-spin" />}
      {isLoading && loadingLabel ? loadingLabel : children}
    </button>
  );
};
