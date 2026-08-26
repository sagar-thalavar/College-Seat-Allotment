'use client';

import React, { useMemo } from 'react';
import { StudentProfile, College, RecommendationResult, OptionChoice } from '@/types';
import { calculateCollegeRecommendations } from '@/lib/recommendation';
import { ArrowRight, Check, Plus } from 'lucide-react';
import { CollegeDetailModal } from './CollegeDetailModal';

interface CollegeRecommendationListProps {
  student: StudentProfile;
  colleges: College[];
  optionChoices: OptionChoice[];
  onAddChoice: (rec: RecommendationResult) => void;
  onAddAllChoices: (recs: RecommendationResult[]) => void;
  onProceedToOptionEntry: () => void;
}

export const CollegeRecommendationList: React.FC<CollegeRecommendationListProps> = ({
  student,
  colleges,
  optionChoices,
  onAddChoice,
  onAddAllChoices,
  onProceedToOptionEntry
}) => {
  const [activeModalItem, setActiveModalItem] = React.useState<RecommendationResult | null>(null);

  const allRecommendations = useMemo(() => {
    return calculateCollegeRecommendations(student, colleges);
  }, [student, colleges]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200">
        <div>
          <h2 className="text-xl font-black text-zinc-950 tracking-tight">
            Step 2: Top 10 Matched Colleges
          </h2>
          <p className="text-xs text-zinc-600">
            Rank #{student.exam.dcetRank.toLocaleString()} | Quota: {student.reservations.casteCategory}{student.reservations.isKalyanaKarnataka ? ' (371J)' : ''}{student.reservations.isSnqEligible ? ' (SNQ)' : ''}
          </p>
        </div>

        <button
          onClick={() => onAddAllChoices(allRecommendations)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 text-yellow-300" />
          <span>Add All 10 to Priority List</span>
        </button>
      </div>

      {/* Grid of 10 Cards (Yellow & White Theme) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {allRecommendations.map((rec, idx) => {
          const isAdded = optionChoices.some(
            c => c.collegeCode === rec.college.code && c.branchCode === rec.branch.branchCode
          );
          const choiceIndex = optionChoices.findIndex(
            c => c.collegeCode === rec.college.code && c.branchCode === rec.branch.branchCode
          );
          const isYellow = idx % 2 === 0;

          return (
            <div
              key={`${rec.college.code}-${rec.branch.branchCode}`}
              className={`${isYellow ? 'card-yellow' : 'card-white'} rounded-3xl p-6 flex flex-col justify-between min-h-[300px] shadow-sm`}
            >
              <div>
                {/* Header Tag & Probability Pill */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={isYellow ? 'badge-tag' : 'badge-tag-yellow'}>
                    {rec.college.code} | {rec.college.district}
                  </span>

                  <span className="text-[11px] font-black px-3 py-1 rounded-full bg-zinc-950 text-yellow-300">
                    {rec.probabilityTier}: {rec.probabilityScore}% Chance
                  </span>
                </div>

                {/* College & Branch */}
                <h3 className="text-xl font-black text-zinc-950 leading-tight">
                  {rec.college.name}
                </h3>
                <p className="text-xs font-bold text-zinc-900 mt-1">
                  {rec.branch.branchName} ({rec.branch.branchCode})
                </p>

                {/* Data Inset */}
                <div className={`mt-4 rounded-2xl p-3 text-xs space-y-1.5 border text-zinc-950 font-medium ${
                  isYellow ? 'bg-white border-yellow-500/40' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-600">Cutoff Benchmark:</span>
                    <span className="font-mono font-bold text-zinc-950 tabular-nums">
                      Rank {rec.effectiveCutoff.toLocaleString()} ({rec.applicableCategory.split(' ')[0]})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-600">Avg Placement CTC:</span>
                    <span className="font-bold text-zinc-950">{rec.branch.placements.averageCtcLpa} LPA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-600">Annual Tuition Fee:</span>
                    <span className="font-bold text-zinc-950 tabular-nums">
                      ₹{rec.tuitionFee.toLocaleString()}/yr {rec.isSnqApplied ? '(SNQ)' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-1 flex items-center gap-2">
                <button
                  onClick={() => onAddChoice(rec)}
                  disabled={isAdded}
                  className={`flex-1 py-3 px-4 text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                    isAdded 
                      ? 'bg-zinc-950 text-white rounded-full opacity-90 cursor-default' 
                      : isYellow
                      ? 'pill-btn-dark shadow-md'
                      : 'pill-btn-yellow shadow-md border border-yellow-400'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <span>Added (Priority #{choiceIndex + 1})</span>
                      <Check className="w-4 h-4 text-yellow-300" />
                    </>
                  ) : (
                    <>
                      <span>Add to Priority List</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  onClick={() => setActiveModalItem(rec)}
                  className="bg-white hover:bg-zinc-100 text-zinc-950 px-3.5 py-3 rounded-full text-xs font-bold border border-zinc-300"
                  title="Details"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Bottom Sticky Action */}
      {optionChoices.length > 0 && (
        <div className="bg-zinc-950 text-white p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-zinc-800 sticky bottom-4 z-40">
          <div>
            <span className="font-black text-base block">{optionChoices.length} Colleges in Priority List</span>
            <span className="text-xs text-zinc-400">Reorder sequence and run seat simulation.</span>
          </div>

          <button
            onClick={onProceedToOptionEntry}
            className="pill-btn-yellow px-8 py-3.5 text-xs font-black flex items-center gap-2 shadow-lg shrink-0"
          >
            <span>Proceed to Priority Ordering</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* College Detail Modal */}
      <CollegeDetailModal
        item={activeModalItem}
        onClose={() => setActiveModalItem(null)}
        onAddToOption={onAddChoice}
        isAlreadyAdded={
          activeModalItem
            ? optionChoices.some(
                c => c.collegeCode === activeModalItem.college.code && c.branchCode === activeModalItem.branch.branchCode
              )
            : false
        }
      />

    </div>
  );
};
