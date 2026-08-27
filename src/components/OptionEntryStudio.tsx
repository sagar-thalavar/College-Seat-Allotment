'use client';

import React, { useState } from 'react';
import { OptionChoice } from '@/types';
import { Trash2, GripVertical } from 'lucide-react';

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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...optionChoices];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);

    const reindexed = updated.map((item, idx) => ({ ...item, priority: idx + 1 }));
    onReorderChoices(reindexed);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-3">
      
      {/* Drag Reorder Preference List with Zero Slop */}
      <div className="space-y-3">
        {optionChoices.map((choice, idx) => {
          const isBeingDragged = draggedIndex === idx;
          const isTargeted = dragOverIndex === idx;

          return (
            <div
              key={`${choice.collegeCode}-${choice.branchCode}`}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              className={`template-card p-4 sm:p-5 flex items-center justify-between gap-3 shadow-md cursor-grab active:cursor-grabbing transition-all select-none ${
                isBeingDragged ? 'opacity-40 scale-[0.98]' : 'opacity-100'
              } ${isTargeted ? 'ring-4 ring-black/40 bg-zinc-50' : ''}`}
            >
              
              {/* Drag Grip + Priority Number + College Name */}
              <div className="flex items-center space-x-3 min-w-0">
                <GripVertical className="w-5 h-5 text-zinc-400 shrink-0" />

                <div className="w-10 h-10 rounded-2xl bg-black text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm tabular-nums">
                  #{choice.priority}
                </div>

                <div className="font-black text-base text-black truncate">
                  {choice.collegeName}
                </div>
              </div>

              {/* Probability Percentage Pill + Trash Action (Zero Arrows) */}
              <div className="flex items-center space-x-2 shrink-0">
                {/* Probability Percentage Number */}
                <div className="bg-black text-white px-3.5 py-2 rounded-xl text-xs font-black tabular-nums shadow-xs flex items-center gap-1">
                  <span className="text-[#FFC700] text-sm">{choice.probabilityScore}%</span>
                </div>

                {/* Remove Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveChoice(idx);
                  }}
                  aria-label="Remove"
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 hover:bg-black hover:text-white text-zinc-800 transition-all border border-zinc-200"
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
