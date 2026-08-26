'use client';

import React, { useState } from 'react';
import { StudentProfile, OptionChoice, AllotmentResult } from '@/types';
import { 
  Trophy, 
  RotateCcw, 
  Printer, 
  Sparkles, 
  Check, 
  ArrowRight 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RoundSimulatorProps {
  student: StudentProfile;
  optionChoices: OptionChoice[];
  onResetToOptions: () => void;
}

export const RoundSimulator: React.FC<RoundSimulatorProps> = ({
  student,
  optionChoices,
  onResetToOptions
}) => {
  const [selectedChoiceAction, setSelectedChoiceAction] = useState<number | null>(2);
  const [isChoiceConfirmed, setIsChoiceConfirmed] = useState<boolean>(false);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [upgradedAllotment, setUpgradedAllotment] = useState<OptionChoice | null>(null);

  const simulateAllotment = (choices: OptionChoice[]): AllotmentResult => {
    for (const choice of choices) {
      if (choice.probabilityTier === 'Safe' || choice.probabilityTier === 'Moderate') {
        return {
          round: 1,
          isAllotted: true,
          allottedChoice: choice,
          allottedCategory: student.reservations.isSnqEligible && choice.isSnqApplied 
            ? 'SNQ' 
            : student.reservations.isKalyanaKarnataka 
            ? `${student.reservations.casteCategory.replace('G', '')}HK` 
            : student.reservations.casteCategory,
          cutoffRankAtAllotment: student.exam.dcetRank + 120,
          candidateRank: student.exam.dcetRank,
          allotmentDate: '2026-08-20',
          challanNumber: `KEA-DCET26-CH-${student.id.toUpperCase()}-084`,
          feePayable: choice.tuitionFee
        };
      }
    }

    const fallback = choices[choices.length - 1];
    return {
      round: 1,
      isAllotted: !!fallback,
      allottedChoice: fallback,
      allottedCategory: student.reservations.casteCategory,
      cutoffRankAtAllotment: student.exam.dcetRank + 100,
      candidateRank: student.exam.dcetRank,
      allotmentDate: '2026-08-20',
      challanNumber: `KEA-DCET26-CH-${student.id.toUpperCase()}-084`,
      feePayable: fallback ? fallback.tuitionFee : 0
    };
  };

  const initialAllotment = simulateAllotment(optionChoices);
  const currentAllotmentChoice = upgradedAllotment || initialAllotment.allottedChoice;

  const handleConfirmChoice = () => {
    setIsChoiceConfirmed(true);
    if (selectedChoiceAction === 1) {
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    } else if (selectedChoiceAction === 2) {
      const currentPriority = currentAllotmentChoice?.priority || 2;
      const higherChoices = optionChoices.filter(c => c.priority < currentPriority);
      if (higherChoices.length > 0) {
        setUpgradedAllotment(higherChoices[0]);
        setRoundNumber(2);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200">
        <div>
          <h2 className="text-xl font-black text-zinc-950 tracking-tight">
            Step 4: Round {roundNumber} Seat Allotment
          </h2>
          <p className="text-xs text-zinc-600">
            Rank #{student.exam.dcetRank.toLocaleString()} | Matched against your priority sequence.
          </p>
        </div>

        <button
          onClick={onResetToOptions}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-yellow-300" />
          <span>Edit Priority Order</span>
        </button>
      </div>

      {/* Hero Allotted College Card (Yellow Card) */}
      {currentAllotmentChoice && (
        <div className="card-yellow rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <span className="badge-tag mb-2">
                Allotted Choice #{currentAllotmentChoice.priority} of {optionChoices.length}
              </span>
              <h3 className="text-2xl font-black text-zinc-950 leading-tight">
                {currentAllotmentChoice.collegeName}
              </h3>
              <p className="text-sm font-bold text-zinc-900 mt-0.5">
                {currentAllotmentChoice.branchName} ({currentAllotmentChoice.branchCode})
              </p>
              <p className="text-xs text-zinc-700">
                {currentAllotmentChoice.collegeDistrict} | College Code: {currentAllotmentChoice.collegeCode}
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-yellow-500/50 text-left sm:text-right shrink-0">
              <span className="text-[11px] text-zinc-600 font-bold block">Annual Fee Payable</span>
              <span className="text-lg font-black text-zinc-950 tabular-nums">
                ₹{currentAllotmentChoice.tuitionFee.toLocaleString()}/yr
              </span>
              {currentAllotmentChoice.isSnqApplied && (
                <span className="text-[10px] font-black bg-zinc-950 text-yellow-300 px-2 py-0.5 rounded-full block mt-0.5">
                  SNQ Waiver Applied
                </span>
              )}
            </div>
          </div>

          {roundNumber === 2 && (
            <div className="bg-white p-3 rounded-2xl text-xs font-black text-zinc-950 flex items-center gap-2 border border-yellow-400">
              <Sparkles className="w-4 h-4 text-yellow-500 shrink-0" />
              <span>Round 2 Upgrade Success: Upgraded to Preference #{currentAllotmentChoice.priority}.</span>
            </div>
          )}
        </div>
      )}

      {/* The 4 Choices Grid (Yellow & White Cards) */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-zinc-950">
          Select Your Statutory Decision (Choice 1, 2, 3, or 4):
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Choice 1: Yellow / White Card */}
          <div
            onClick={() => setSelectedChoiceAction(1)}
            className={`card-white rounded-3xl p-5 cursor-pointer transition-all ${
              selectedChoiceAction === 1 ? 'ring-4 ring-yellow-400 border-yellow-400 shadow-md bg-yellow-50' : 'hover:border-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="badge-tag-yellow">Choice 1</span>
              <span className="bg-zinc-950 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                Final Join
              </span>
            </div>
            <h4 className="text-base font-black text-zinc-950">Freeze & Accept Seat</h4>
            <p className="text-xs text-zinc-700 font-medium mt-1">
              Satisfied with seat. Pay fees, download admission order, and report to college.
            </p>
          </div>

          {/* Choice 2: White Card */}
          <div
            onClick={() => setSelectedChoiceAction(2)}
            className={`card-white rounded-3xl p-5 cursor-pointer transition-all ${
              selectedChoiceAction === 2 ? 'ring-4 ring-yellow-400 border-yellow-400 shadow-md bg-yellow-50' : 'hover:border-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="badge-tag-yellow">Choice 2 | Recommended</span>
              <span className="bg-zinc-950 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                Zero Risk
              </span>
            </div>
            <h4 className="text-base font-black text-zinc-950">Hold & Upgrade in Round 2</h4>
            <p className="text-xs text-zinc-700 font-medium mt-1">
              Hold current seat safely while competing for higher dream choices in Round 2.
            </p>
          </div>

          {/* Choice 3: White Card */}
          <div
            onClick={() => setSelectedChoiceAction(3)}
            className={`card-white rounded-3xl p-5 cursor-pointer transition-all ${
              selectedChoiceAction === 3 ? 'ring-4 ring-yellow-400 border-yellow-400 shadow-md bg-yellow-50' : 'hover:border-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="badge-tag">Choice 3</span>
              <span className="bg-zinc-950 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                High Risk
              </span>
            </div>
            <h4 className="text-base font-black text-zinc-950">Reject & Enter Round 2</h4>
            <p className="text-xs text-zinc-700 font-medium mt-1">
              Surrender this allotted seat and participate in Round 2 for other options.
            </p>
          </div>

          {/* Choice 4: White Card */}
          <div
            onClick={() => setSelectedChoiceAction(4)}
            className={`card-white rounded-3xl p-5 cursor-pointer transition-all ${
              selectedChoiceAction === 4 ? 'ring-4 ring-yellow-400 border-yellow-400 shadow-md bg-yellow-50' : 'hover:border-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="badge-tag">Choice 4</span>
              <span className="bg-zinc-950 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                Exit
              </span>
            </div>
            <h4 className="text-base font-black text-zinc-950">Exit Counseling</h4>
            <p className="text-xs text-zinc-700 font-medium mt-1">
              Quit the KEA admission process completely.
            </p>
          </div>

        </div>
      </div>

      {/* Confirmation Footer */}
      <div className="bg-zinc-950 text-white p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-zinc-800">
        <div>
          <span className="font-black text-base block">Selected: Choice {selectedChoiceAction}</span>
          <span className="text-xs text-zinc-400">Click execute to simulate outcome.</span>
        </div>

        <button
          onClick={handleConfirmChoice}
          disabled={!selectedChoiceAction}
          className="pill-btn-yellow px-8 py-3.5 text-xs font-black flex items-center gap-2 shadow-lg shrink-0"
        >
          <span>Execute Choice {selectedChoiceAction} Decision</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Admission Order Card */}
      {isChoiceConfirmed && selectedChoiceAction === 1 && currentAllotmentChoice && (
        <div className="card-yellow rounded-3xl p-6 shadow-md border-2 border-yellow-500 space-y-3">
          <div className="flex items-center justify-between">
            <span className="badge-tag">Official Admission Order</span>
            <button
              onClick={() => window.print()}
              className="bg-zinc-950 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Order</span>
            </button>
          </div>

          <h3 className="text-xl font-black text-zinc-950">
            Congratulations, {student.name}!
          </h3>
          <p className="text-xs font-bold text-zinc-900">
            Admission locked to {currentAllotmentChoice.collegeName} ({currentAllotmentChoice.branchName}).
          </p>
          <div className="text-xs text-zinc-800 font-medium">
            Reporting Deadline: <strong>August 31, 2026</strong> | Fee Paid: <strong>₹{currentAllotmentChoice.tuitionFee.toLocaleString()}</strong>
          </div>
        </div>
      )}

    </div>
  );
};
