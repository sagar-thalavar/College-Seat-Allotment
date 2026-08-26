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
      
      {/* Priority List (College Name Only + Up/Down/Delete) */}
      <div className="space-y-2.5">
        {optionChoices.map((choice, idx) => {
          const isYellow = idx % 2 === 0;

          return (
            <div
              key={`${choice.collegeCode}-${choice.branchCode}`}
              className={`${isYellow ? 'card-yellow' : 'card-white'} rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs`}
            >
              {/* Priority Number & College Name Only */}
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-zinc-950 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm tabular-nums">
                  #{choice.priority}
                </div>

                <div className="font-black text-sm text-zinc-950 truncate">
                  {choice.collegeName}
                </div>
              </div>

              {/* Up, Down, Delete Controls */}
              <div className="flex items-center space-x-1 shrink-0">
                <button
                  onClick={() => moveItem(idx, idx - 1)}
                  disabled={idx === 0}
                  aria-label="Move Up"
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-white hover:bg-zinc-100 text-zinc-950 disabled:opacity-30 transition-colors shadow-xs border border-zinc-300"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>

                <button
                  onClick={() => moveItem(idx, idx + 1)}
                  disabled={idx === optionChoices.length - 1}
                  aria-label="Move Down"
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-white hover:bg-zinc-100 text-zinc-950 disabled:opacity-30 transition-colors shadow-xs border border-zinc-300"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onRemoveChoice(idx)}
                  aria-label="Remove"
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-zinc-950 hover:bg-zinc-800 text-white transition-colors shadow-xs"
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
