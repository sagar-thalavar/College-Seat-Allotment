'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** One line under the title. */
  subtitle?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Native <dialog>: the platform already gives focus trapping, inertness
 * and Escape. Reimplementing them by hand is how modals lose keyboards.
 */
export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  title,
  subtitle,
  footer,
  children,
}) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
  }, [open]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };
    node.addEventListener('cancel', handleCancel);
    return () => node.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="dialog-title"
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className="m-auto w-[min(42rem,calc(100vw-2rem))] rounded-sm border border-rule bg-ground p-0 text-ink shadow-[0_16px_48px_-12px_oklch(0.19_0.012_25/0.28)] backdrop:bg-ink/45 backdrop:backdrop-blur-[2px]"
    >
      <div className="flex max-h-[85dvh] flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-hairline px-5 py-4">
          <div className="min-w-0">
            <h2
              id="dialog-title"
              className="text-lg font-semibold tracking-[-0.01em] text-ink"
            >
              {title}
            </h2>
            {subtitle && (
              <div className="mt-0.5 text-label text-ink-muted">{subtitle}</div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 shrink-0 place-items-center rounded-sm border border-transparent text-ink-muted transition-colors duration-[var(--dur-fast)] hover:border-hairline hover:bg-sunken hover:text-ink"
          >
            <X aria-hidden className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-hairline bg-panel px-5 py-3">
            {footer}
          </footer>
        )}
      </div>
    </dialog>
  );
};
