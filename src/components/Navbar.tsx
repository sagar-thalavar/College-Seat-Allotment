'use client';

import React from 'react';

interface NavbarProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentStep, onStepClick }) => {
  return (
    <header className="bg-zinc-950 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Simple Clean Title */}
        <h1 className="text-lg font-black tracking-tight text-white">
          College Seat Allotment
        </h1>

        {/* 2-Step Navigation */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onStepClick(1)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              currentStep === 1
                ? 'pill-btn-yellow text-black'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            1. Identity
          </button>
          <button
            onClick={() => onStepClick(2)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              currentStep === 2
                ? 'pill-btn-yellow text-black'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            2. Priority List
          </button>
        </div>

      </div>
    </header>
  );
};
