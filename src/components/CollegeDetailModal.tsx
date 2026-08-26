'use client';

import React from 'react';
import { RecommendationResult } from '@/types';
import { X, MapPin, IndianRupee, Home, ExternalLink } from 'lucide-react';

interface CollegeDetailModalProps {
  item: RecommendationResult | null;
  onClose: () => void;
  onAddToOption: (item: RecommendationResult) => void;
  isAlreadyAdded: boolean;
}

export const CollegeDetailModal: React.FC<CollegeDetailModalProps> = ({
  item,
  onClose,
  onAddToOption,
  isAlreadyAdded
}) => {
  if (!item) return null;

  const { college, branch, probabilityTier, probabilityScore, tuitionFee, isSnqApplied, effectiveCutoff, applicableCategory } = item;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border-2 border-zinc-900 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="bg-zinc-950 text-white p-6 rounded-t-3xl flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-yellow-300 text-black font-black text-xs px-2.5 py-0.5 rounded-full">
                Code: {college.code}
              </span>
              <span className="text-xs text-zinc-300 font-bold">{college.type}</span>
              <span className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-zinc-700">
                NAAC {college.naacGrade}
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-2 leading-tight">{college.name}</h2>
            <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5" />
              {college.city}, {college.district} | Estd. {college.establishedYear}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Target Branch Bar */}
          <div className="bg-yellow-50 p-4 rounded-2xl border-2 border-yellow-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] text-zinc-600 font-bold block">Selected Branch</span>
              <span className="font-black text-base text-zinc-950">{branch.branchName} ({branch.branchCode})</span>
              <span className="text-xs text-zinc-700 block mt-0.5">
                Lateral Intake: <strong className="text-zinc-950">{branch.lateralIntake} Seats</strong>
              </span>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] text-zinc-600 font-bold block">Admission Feasibility</span>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-zinc-950 text-yellow-300">
                {probabilityTier}: {probabilityScore}% Chance
              </span>
              <span className="text-[11px] text-zinc-600 block mt-0.5">
                Target Cutoff: <strong>{effectiveCutoff.toLocaleString()}</strong> ({applicableCategory.split(' ')[0]})
              </span>
            </div>
          </div>

          {/* Historical Cutoff Matrix */}
          <div>
            <h3 className="text-xs font-black text-zinc-950 uppercase pb-1 mb-2">
              Historical Cutoff Benchmarks (2023 - 2025)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-zinc-200 rounded-xl overflow-hidden">
                <thead className="bg-zinc-100 text-zinc-950 font-black border-b border-zinc-200">
                  <tr>
                    <th className="p-2.5">Academic Year</th>
                    <th className="p-2.5">General Merit (GM)</th>
                    <th className="p-2.5">3A / 2A Quotas</th>
                    <th className="p-2.5">Article 371J</th>
                    <th className="p-2.5">SNQ Quota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-zinc-900 font-medium">
                  <tr>
                    <td className="p-2.5 font-bold">2025 (Projected)</td>
                    <td className="p-2.5 font-mono">{branch.cutoffs.year2025['GM']?.toLocaleString() || '-'}</td>
                    <td className="p-2.5 font-mono">{branch.cutoffs.year2025['3AG']?.toLocaleString() || branch.cutoffs.year2025['2AG']?.toLocaleString() || '-'}</td>
                    <td className="p-2.5 font-mono">{branch.cutoffs.year2025['3AHK']?.toLocaleString() || branch.cutoffs.year2025['SCHK']?.toLocaleString() || '-'}</td>
                    <td className="p-2.5 font-mono font-bold text-yellow-950 bg-yellow-100">{branch.cutoffs.year2025['SNQ']?.toLocaleString() || '-'}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">2024 (Official)</td>
                    <td className="p-2.5 font-mono">{branch.cutoffs.year2024['GM']?.toLocaleString() || '-'}</td>
                    <td className="p-2.5 font-mono">{branch.cutoffs.year2024['3AG']?.toLocaleString() || branch.cutoffs.year2024['2AG']?.toLocaleString() || '-'}</td>
                    <td className="p-2.5 font-mono">{branch.cutoffs.year2024['3AHK']?.toLocaleString() || branch.cutoffs.year2024['SCHK']?.toLocaleString() || '-'}</td>
                    <td className="p-2.5 font-mono font-bold text-yellow-950 bg-yellow-100">{branch.cutoffs.year2024['SNQ']?.toLocaleString() || '-'}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">2023 (Official)</td>
                    <td className="p-2.5 font-mono">{branch.cutoffs.year2023['GM']?.toLocaleString() || '-'}</td>
                    <td className="p-2.5 font-mono">{branch.cutoffs.year2023['3AG']?.toLocaleString() || branch.cutoffs.year2023['2AG']?.toLocaleString() || '-'}</td>
                    <td className="p-2.5 font-mono">{branch.cutoffs.year2023['3AHK']?.toLocaleString() || branch.cutoffs.year2023['SCHK']?.toLocaleString() || '-'}</td>
                    <td className="p-2.5 font-mono font-bold text-yellow-950 bg-yellow-100">{branch.cutoffs.year2023['SNQ']?.toLocaleString() || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Placement Statistics */}
          <div>
            <h3 className="text-xs font-black text-zinc-950 uppercase pb-1 mb-2">
              Placement Statistics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
                <span className="text-[10px] text-zinc-500 font-bold block">Average CTC</span>
                <span className="font-black text-zinc-950 text-sm">{branch.placements.averageCtcLpa} LPA</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
                <span className="text-[10px] text-zinc-500 font-bold block">Median CTC</span>
                <span className="font-black text-zinc-950 text-sm">{branch.placements.medianCtcLpa} LPA</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
                <span className="text-[10px] text-zinc-500 font-bold block">Highest Package</span>
                <span className="font-black text-zinc-950 text-sm">{branch.placements.highestCtcLpa} LPA</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
                <span className="text-[10px] text-zinc-500 font-bold block">Placed %</span>
                <span className="font-black text-zinc-950 text-sm">{branch.placements.placedPercentage}%</span>
              </div>
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
              <span className="font-black text-zinc-950 flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5" />
                Annual Fee Structure
              </span>
              <div className="flex justify-between text-zinc-700">
                <span>Standard Tuition Fee:</span>
                <span className="font-bold">₹{branch.annualTuitionFee.toLocaleString()}/yr</span>
              </div>
              {isSnqApplied && (
                <div className="flex justify-between text-yellow-950 font-black bg-yellow-200 p-1.5 rounded-lg mt-1">
                  <span>SNQ Subsidized Fee:</span>
                  <span>₹{branch.snqAnnualFee.toLocaleString()}/yr</span>
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
              <span className="font-black text-zinc-950 flex items-center gap-1">
                <Home className="w-3.5 h-3.5" />
                Hostel Facilities
              </span>
              <div className="flex justify-between text-zinc-700">
                <span>On-Campus Hostel:</span>
                <span className="font-bold">{college.hasCampusHostel ? 'Available' : 'Private PG Nearby'}</span>
              </div>
              {college.hasCampusHostel && (
                <div className="flex justify-between text-zinc-700">
                  <span>Hostel & Mess Fee:</span>
                  <span className="font-bold">₹{college.hostelAnnualFee.toLocaleString()}/yr</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-zinc-100 p-4 rounded-b-3xl flex items-center justify-between border-t border-zinc-200">
          <a
            href={college.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-700 hover:text-zinc-950 flex items-center gap-1 font-bold"
          >
            <span>College Website</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-zinc-300 text-zinc-700 hover:bg-zinc-200 text-xs font-bold"
            >
              Close
            </button>
            <button
              onClick={() => {
                onAddToOption(item);
                onClose();
              }}
              disabled={isAlreadyAdded}
              className={`px-5 py-2 rounded-full text-xs font-black transition-colors ${
                isAlreadyAdded
                  ? 'bg-zinc-300 text-zinc-600 cursor-not-allowed'
                  : 'pill-btn-yellow shadow-xs text-black'
              }`}
            >
              {isAlreadyAdded ? 'Already Added' : 'Add to Priority List'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
