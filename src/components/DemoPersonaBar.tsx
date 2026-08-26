'use client';

import React from 'react';
import { StudentProfile } from '@/types';
import { Sparkles } from 'lucide-react';

interface DemoPersonaBarProps {
  students: StudentProfile[];
  selectedStudent: StudentProfile;
  onSelectStudent: (student: StudentProfile) => void;
}

export const DemoPersonaBar: React.FC<DemoPersonaBarProps> = ({
  students,
  selectedStudent,
  onSelectStudent
}) => {
  return (
    <div className="bg-white border-b border-zinc-200 py-2.5 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-zinc-950">
          <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
          <span>Demo Candidate Presets:</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {students.map((std) => {
            const isSelected = std.id === selectedStudent.id;
            return (
              <button
                key={std.id}
                onClick={() => onSelectStudent(std)}
                className={`text-xs px-3.5 py-1 rounded-full font-bold transition-all ${
                  isSelected
                    ? 'bg-yellow-300 text-black border border-yellow-400 shadow-xs'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200'
                }`}
              >
                <span>{std.name.split(' ')[0]}</span>
                <span className="opacity-75 font-medium ml-1">
                  (Rank #{std.exam.dcetRank} | {std.reservations.casteCategory}{std.reservations.isKalyanaKarnataka ? ' 371J' : ''})
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
