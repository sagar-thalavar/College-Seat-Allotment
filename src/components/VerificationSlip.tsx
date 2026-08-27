'use client';

import React, { useState } from 'react';
import { ArrowRight, Check, Copy, Printer } from 'lucide-react';
import { StudentProfile } from '@/types';
import { Button, Seal } from '@/components/ui';

interface VerificationSlipProps {
  student: StudentProfile;
  onProceedToOptions: () => void;
}

export const VerificationSlip: React.FC<VerificationSlipProps> = ({
  student,
  onProceedToOptions,
}) => {
  const { exam, verification } = student;
  const [copied, setCopied] = useState(false);

  const copySecretKey = () => {
    navigator.clipboard.writeText(verification.secretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.015em] text-ink">
            Verification slip
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Official candidate confirmation and secret key.
          </p>
        </div>

        <div className="no-print flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => window.print()}
            aria-label="Print verification slip"
          >
            <Printer aria-hidden className="size-3.5" />
            Print slip
          </Button>
        </div>
      </header>

      {/* Clean Simplified Verification Card */}
      <article className="overflow-hidden rounded-sm border border-rule bg-panel shadow-xs">
        
        {/* Masthead */}
        <div className="border-b border-rule px-4 py-4 sm:px-6 sm:py-5 flex items-start justify-between gap-4">
          <div>
            <span className="text-micro font-medium uppercase tracking-[0.08em] text-ink-muted">
              KEA Verification Confirmation
            </span>
            <h3 className="mt-1 text-xl font-semibold text-ink">
              {student.name}
            </h3>
            <p className="mt-0.5 font-mono text-label text-ink-soft">
              Roll No: {exam.dcetRollNo} · Rank #{exam.dcetRank.toLocaleString()}
            </p>
          </div>

          <Seal mark="VERIFIED" date={verification.verificationDate} caption="DCET 2026" className="shrink-0" />
        </div>

        {/* Secret Key Instrument */}
        <div className="border-b border-hairline bg-ground px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-micro font-medium uppercase tracking-[0.06em] text-ink-muted">
                Candidate Secret Key
              </span>
              <p className="font-mono text-xl font-semibold tracking-wide text-ink select-all">
                {verification.secretKey}
              </p>
            </div>

            <Button
              size="sm"
              variant="secondary"
              onClick={copySecretKey}
              className="w-full sm:w-auto"
            >
              {copied ? (
                <>
                  <Check aria-hidden className="size-3.5 text-oxide" />
                  Copied
                </>
              ) : (
                <>
                  <Copy aria-hidden className="size-3.5" />
                  Copy key
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Attestation details */}
        <div className="px-4 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-label text-ink-soft">
          <span>Verified at {verification.helplineCenter}</span>
          <span className="font-mono text-micro text-ink-muted">
            Slip ref: DCET26/{exam.dcetRollNo}/{verification.verificationDate.replace(/-/g, '')}
          </span>
        </div>
      </article>

      {/* Action to proceed to options */}
      <div className="no-print flex justify-end pt-2">
        <Button
          variant="primary"
          size="lg"
          onClick={onProceedToOptions}
        >
          Proceed to option priorities
          <ArrowRight aria-hidden className="size-4" />
        </Button>
      </div>
    </div>
  );
};
