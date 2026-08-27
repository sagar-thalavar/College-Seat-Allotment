'use client';

import React from 'react';

interface NavbarProps {
  currentStage: number;
  onSelectStage: (stage: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentStage, onSelectStage }) => {
  return (
    <header className="py-6 px-4">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Giant Bold Black Typography */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-black leading-none">
            College Seat Allotment
          </h1>
          <div className="mt-2.5">
            <span className="template-badge-black">
              Candidate: Sagar R Thalavar
            </span>
          </div>
        </div>

        {/* 2-Step Navigation Capsule */}
        <div className="bg-black p-1.5 rounded-2xl flex items-center space-x-1 shrink-0">
          <button
            onClick={() => onSelectStage(1)}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
              currentStage === 1
                ? 'bg-[#FFC700] text-black shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
          >
            1. Identity
          </button>
          <button
            onClick={() => onSelectStage(2)}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
              currentStage === 2
                ? 'bg-[#FFC700] text-black shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
          >
            2. Priority List
          </button>
        </div>

      </div>
    </header>
  );
};
