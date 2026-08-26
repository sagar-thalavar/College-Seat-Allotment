'use client';

import React from 'react';
import { OptionChoice } from '@/types';
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react';

interface OptionEntryStudioProps {
  optionChoices: OptionChoice[];
  onReorderChoices: (choices: OptionChoice[]) => void;
  onRemoveChoice: (index: number) => void;
}

export const OptionEntryStudio: React.FC<OptionEntryStudioProps> = ({
  optionChoices,
  onReorderChoices,
  onRemoveChoice
}) => {
  const moveItem = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= optionChoices.length) return;
    const updated = [...optionChoices];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    const reindexed = updated.map((item, idx) => ({ ...item, priority: idx + 1 }));
    onReorderChoices(reindexed);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-3">
      
      {/* Priority List of Floating White Cards (Matching Template Design) */}
      <div className="space-y-3">
        {optionChoices.map((choice, idx) => {
          return (
            <div
              key={`${choice.collegeCode}-${choice.branchCode}`}
              className="template-card p-4 sm:p-5 flex items-center justify-between gap-3 shadow-md"
            >
              {/* Priority Number & College Name Only */}
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-black text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm tabular-nums">
                  #{choice.priority}
                </div>

                <div className="font-black text-base text-black truncate">
                  {choice.collegeName}
                </div>
              </div>

              {/* Up, Down, Delete Dual Action Controls */}
              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  onClick={() => moveItem(idx, idx - 1)}
                  disabled={idx === 0}
                  aria-label="Move Up"
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black disabled:opacity-30 transition-all border border-zinc-200"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>

                <button
                  onClick={() => moveItem(idx, idx + 1)}
                  disabled={idx === optionChoices.length - 1}
                  aria-label="Move Down"
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black disabled:opacity-30 transition-all border border-zinc-200"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onRemoveChoice(idx)}
                  aria-label="Remove"
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-black hover:bg-zinc-800 text-white transition-all shadow-xs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
