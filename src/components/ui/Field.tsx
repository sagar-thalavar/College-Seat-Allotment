'use client';

import React, { useId } from 'react';
import { clsx } from 'clsx';

interface FieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  /** Sits under the input in the calm state. Replaced by `error` when set. */
  hint?: string;
  error?: string;
  /** Identifiers, ranks and RD numbers are records — set them in mono. */
  mono?: boolean;
  wrapClassName?: string;
}

export const Field: React.FC<FieldProps> = ({
  label,
  hint,
  error,
  mono = true,
  wrapClassName,
  className,
  disabled,
  ...rest
}) => {
  const id = useId();
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;

  return (
    <div className={clsx('min-w-0', wrapClassName)}>
      <label
        htmlFor={id}
        className={clsx(
          'block text-label font-medium',
          disabled ? 'text-ink-off' : 'text-ink-soft',
        )}
      >
        {label}
      </label>
      <input
        {...rest}
        id={id}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={clsx(
          'mt-1 h-11 w-full rounded-sm border bg-ground px-2.5 text-sm text-ink',  // 44px — the touch-target floor
          'transition-[border-color,background-color] duration-[var(--dur-fast)] ease-[var(--ease-out-quart)]',
          'placeholder:text-ink-muted',
          'disabled:bg-sunken disabled:text-ink-off disabled:border-hairline disabled:cursor-not-allowed',
          mono && 'font-mono tabular-nums tracking-tight',
          error ? 'border-oxide' : 'border-field hover:border-ink-muted focus:border-ink',
          className,
        )}
      />
      {error ? (
        <p id={`${id}-err`} className="mt-1 text-label text-oxide-deep">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-label text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
};
