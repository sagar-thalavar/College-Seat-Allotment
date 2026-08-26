'use client';

import React from 'react';
import { StudentProfile } from '@/types';
import { ShieldCheck, Lock, CheckCircle2, ArrowRight, Printer } from 'lucide-react';

interface VerificationSlipProps {
  student: StudentProfile;
  onProceedToColleges: () => void;
}

export const VerificationSlip: React.FC<VerificationSlipProps> = ({
  student,
  onProceedToColleges
}) => {
  const snqClass = student.reservations.isSnqEligible 
    ? 'bg-emerald-100 text-emerald-950 border-emerald-200' 
    : 'bg-slate-200 text-slate-900 border-slate-300';

  return (
    <div className="space-y-6">
      {/* Top Advisory Banner */}
      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-emerald-800 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-xs font-bold text-emerald-950">Official KEA Verification Completed</h3>
            <p className="text-xs text-emerald-900 mt-0.5">
              Your digital verification slip and unique 16-character Secret Key have been issued. Keep this confidential.
            </p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-emerald-950 border border-emerald-300 hover:bg-emerald-100 text-xs font-semibold shadow-xs shrink-0 focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Slip</span>
        </button>
      </div>

      {/* The Printable Official Verification Document */}
      <div className="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-xs space-y-6 print:border-none print:p-0">
        
        {/* Document Header */}
        <div className="text-center border-b-2 border-slate-200 pb-4 space-y-1">
          <div className="inline-block bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-widest uppercase mb-1">
            Government of Karnataka
          </div>
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
            Karnataka Examinations Authority (KEA)
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Diploma Common Entrance Test (DCET-2026) • Document Verification & Eligibility Slip
          </p>
          <p className="text-[11px] text-slate-500">
            Helpline: {student.verification.helplineCenter} • Date of Verification: {student.verification.verificationDate}
          </p>
        </div>

        {/* Secret Key & Authentication Token Box */}
        <div className="bg-slate-900 text-white p-4 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800">
          <div>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>Candidate Secret Key (For Option Entry Login)</span>
            </div>
            <div className="mt-1 font-mono text-lg sm:text-xl font-bold tracking-widest text-white bg-slate-800/80 px-3 py-1 rounded inline-block border border-slate-700">
              {student.verification.secretKey}
            </div>
          </div>

          <div className="text-left sm:text-right text-xs">
            <span className="text-slate-400">DCET State Rank:</span>
            <div className="font-mono text-xl font-bold text-emerald-400 tabular-nums">
              {student.exam.dcetRank.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400">Roll No: {student.exam.dcetRollNo}</span>
          </div>
        </div>

        {/* Section 1: Candidate Personal Details */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 mb-2">
            1. Candidate & Academic Details
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Candidate Name</span>
              <span className="font-bold text-slate-900">{student.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Father's Name</span>
              <span className="font-semibold text-slate-800">{student.fatherName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Date of Birth</span>
              <span className="font-medium text-slate-800">{student.dob}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Gender</span>
              <span className="font-medium text-slate-800">{student.gender}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">SSLC Marks / Board</span>
              <span className="font-semibold text-slate-800 tabular-nums">{student.academic.sslcPercentage}% (KSEEB)</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Diploma USN</span>
              <span className="font-mono font-semibold text-slate-800">{student.academic.diplomaUsn}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Diploma Branch</span>
              <span className="font-bold text-slate-900">{student.academic.diplomaBranch}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Diploma Aggregate %</span>
              <span className="font-bold text-emerald-800 tabular-nums">{student.academic.aggregatePercentage}%</span>
            </div>
          </div>
        </div>

        {/* Section 2: Verified Quota & Reservation Matrix */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 mb-2">
            2. Verified Statutory Reservations Matrix
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Caste Category & RD No</span>
              <span className="font-bold text-slate-900">{student.reservations.casteCategory} ({student.reservations.subCaste})</span>
              <span className="block font-mono text-[11px] text-slate-500 mt-0.5">{student.reservations.casteRdNumber}</span>
            </div>

            <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Annual Income & SNQ Status</span>
              <span className="font-semibold text-slate-900 tabular-nums">₹{student.reservations.annualIncome.toLocaleString()} / year</span>
              <span className={`inline-block mt-1 font-bold text-[11px] px-1.5 py-0.5 rounded border ${snqClass}`}>
                SNQ Fee Waiver: {student.reservations.isSnqEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
              </span>
            </div>

            <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Article 371J (Kalyana-Kar)</span>
              <span className="font-semibold text-slate-900">
                {student.reservations.isKalyanaKarnataka ? `APPROVED (${student.reservations.kalyanaKarnatakaDistrict})` : 'NO'}
              </span>
              {student.reservations.kalyanaKarnatakaRdNumber && (
                <span className="block font-mono text-[11px] text-slate-500 mt-0.5">
                  {student.reservations.kalyanaKarnatakaRdNumber}
                </span>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="text-slate-600 font-medium">Additional Verified Codes:</span>
            {student.verification.verifiedCodes.map((code) => (
              <span key={code} className="bg-slate-900 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded text-[11px]">
                {code}
              </span>
            ))}
            {student.reservations.isRuralQuota && (
              <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded text-[11px] font-medium">
                Rural 1st-10th Quota Verified
              </span>
            )}
            {student.reservations.isKannadaMediumQuota && (
              <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded text-[11px] font-medium">
                Kannada Medium Quota Verified
              </span>
            )}
          </div>
        </div>

        {/* Verification Authority Stamp */}
        <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-500 gap-2">
          <div>
            <p className="font-semibold text-slate-700">Digital Signature: KEA Electronic Verification Registry</p>
            <p className="text-[11px]">Document Hash: SHA256-KEA-{student.id.toUpperCase()}-2026-OK</p>
          </div>
          <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Eligible for Engineering Lateral Entry 2026</span>
          </div>
        </div>

      </div>

      {/* Step Transition Action */}
      <div className="bg-slate-900 text-white p-5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <h3 className="font-bold text-sm text-white">Next Step: Explore Recommended Colleges & Cutoffs</h3>
          <p className="text-xs text-slate-300 mt-0.5">
            The platform will automatically analyze past 3-year cutoffs for your rank ({student.exam.dcetRank.toLocaleString()}) across all verified reservation gates.
          </p>
        </div>

        <button
          onClick={onProceedToColleges}
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-md text-xs transition-colors shadow-xs shrink-0 focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <span>View 10 Curated Colleges & Probabilities</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
