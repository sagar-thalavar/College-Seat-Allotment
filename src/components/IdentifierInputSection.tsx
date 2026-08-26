'use client';

import React, { useState, useEffect } from 'react';
import { StudentProfile } from '@/types';
import { ArrowRight, Loader2, Check, CreditCard, GraduationCap, FileCheck2, Award } from 'lucide-react';

interface IdentifierInputSectionProps {
  student: StudentProfile;
  onProceed: () => void;
}

export const IdentifierInputSection: React.FC<IdentifierInputSectionProps> = ({
  student,
  onProceed
}) => {
  const [step1Done, setStep1Done] = useState<boolean>(false);
  const [step1Loading, setStep1Loading] = useState<boolean>(false);
  const [aadhaarInput, setAadhaarInput] = useState<string>(student.aadhaarNumber);

  const [step2Done, setStep2Done] = useState<boolean>(false);
  const [step2Loading, setStep2Loading] = useState<boolean>(false);
  const [usnInput, setUsnInput] = useState<string>(student.academic.diplomaUsn);
  const [sslcInput, setSslcInput] = useState<string>(student.academic.sslcRollNo);

  const [step3Done, setStep3Done] = useState<boolean>(false);
  const [step3Loading, setStep3Loading] = useState<boolean>(false);
  const [casteRdInput, setCasteRdInput] = useState<string>(student.reservations.casteRdNumber);
  const [incomeRdInput, setIncomeRdInput] = useState<string>(student.reservations.incomeRdNumber);

  const [step4Done, setStep4Done] = useState<boolean>(false);
  const [step4Loading, setStep4Loading] = useState<boolean>(false);
  const [rankInput, setRankInput] = useState<string>(student.exam.dcetRank.toString());

  useEffect(() => {
    setAadhaarInput(student.aadhaarNumber);
    setUsnInput(student.academic.diplomaUsn);
    setSslcInput(student.academic.sslcRollNo);
    setCasteRdInput(student.reservations.casteRdNumber);
    setIncomeRdInput(student.reservations.incomeRdNumber);
    setRankInput(student.exam.dcetRank.toString());
  }, [student]);

  const handleFetch1 = () => {
    setStep1Loading(true);
    setTimeout(() => {
      setStep1Loading(false);
      setStep1Done(true);
    }, 350);
  };

  const handleFetch2 = () => {
    setStep2Loading(true);
    setTimeout(() => {
      setStep2Loading(false);
      setStep2Done(true);
    }, 350);
  };

  const handleFetch3 = () => {
    setStep3Loading(true);
    setTimeout(() => {
      setStep3Loading(false);
      setStep3Done(true);
    }, 350);
  };

  const handleFetch4 = () => {
    setStep4Loading(true);
    setTimeout(() => {
      setStep4Loading(false);
      setStep4Done(true);
    }, 350);
  };

  const handleClickMe = () => {
    setStep1Done(true);
    setStep2Done(true);
    setStep3Done(true);
    setStep4Done(true);
  };

  const isAllResolved = step1Done && step2Done && step3Done && step4Done;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <span className="template-badge-black">
          Zero-Form Identity Resolution
        </span>

        <button
          onClick={handleClickMe}
          className="template-btn-black text-xs font-black shadow-lg"
        >
          Click Me
        </button>
      </div>

      {/* 4 White Floating Cards (Matching Template Image) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Card 1: Aadhaar */}
        <div className="template-card p-6 flex flex-col justify-between min-h-[270px]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="template-icon-box">
                <CreditCard className="w-5 h-5 text-black" />
              </div>
              {step1Done && (
                <span className="template-badge-black text-[10px]">
                  <Check className="w-3 h-3 text-[#FFC700] mr-1" /> Verified
                </span>
              )}
            </div>

            <h3 className="text-xl font-black text-black">Aadhaar Card</h3>

            <div className="mt-3">
              <input
                type="text"
                value={aadhaarInput}
                onChange={(e) => setAadhaarInput(e.target.value)}
                className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-black focus:outline-none focus:border-black"
              />
            </div>

            {step1Done && (
              <div className="mt-3 bg-zinc-50 rounded-2xl p-3 text-xs text-black border border-zinc-200 space-y-0.5 font-medium">
                <div className="font-black text-black text-sm">{student.name}</div>
                <div className="text-zinc-600">{student.dob} | {student.gender}</div>
                <div className="text-zinc-600">{student.address.district}</div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-1 flex gap-2">
            <button
              onClick={handleFetch1}
              disabled={step1Loading || step1Done}
              className={`w-full ${step1Done ? 'template-btn-white opacity-80 cursor-default' : 'template-btn-black'} text-xs`}
            >
              {step1Loading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : step1Done ? (
                'Verified'
              ) : (
                'Fetch Aadhaar'
              )}
            </button>
          </div>
        </div>

        {/* Card 2: Academic */}
        <div className={`template-card p-6 flex flex-col justify-between min-h-[270px] ${
          !step1Done ? 'opacity-50 pointer-events-none' : 'opacity-100'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="template-icon-box">
                <GraduationCap className="w-5 h-5 text-black" />
              </div>
              {step2Done && (
                <span className="template-badge-black text-[10px]">
                  <Check className="w-3 h-3 text-[#FFC700] mr-1" /> Verified
                </span>
              )}
            </div>

            <h3 className="text-xl font-black text-black">Diploma USN & SSLC</h3>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <input
                type="text"
                value={usnInput}
                onChange={(e) => setUsnInput(e.target.value)}
                className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-black focus:outline-none focus:border-black"
              />
              <input
                type="text"
                value={sslcInput}
                onChange={(e) => setSslcInput(e.target.value)}
                className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-black focus:outline-none focus:border-black"
              />
            </div>

            {step2Done && (
              <div className="mt-3 bg-zinc-50 rounded-2xl p-3 text-xs text-black border border-zinc-200 space-y-0.5 font-medium">
                <div className="font-black text-black">{student.academic.diplomaBranch}</div>
                <div className="text-zinc-600">Aggregate: <strong className="text-black">{student.academic.aggregatePercentage}%</strong></div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-1 flex gap-2">
            <button
              onClick={handleFetch2}
              disabled={step2Loading || step2Done}
              className={`w-full ${step2Done ? 'template-btn-white opacity-80 cursor-default' : 'template-btn-black'} text-xs`}
            >
              {step2Loading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : step2Done ? (
                'Linked'
              ) : (
                'Fetch Academic'
              )}
            </button>
          </div>
        </div>

        {/* Card 3: RD Numbers */}
        <div className={`template-card p-6 flex flex-col justify-between min-h-[270px] ${
          !step2Done ? 'opacity-50 pointer-events-none' : 'opacity-100'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="template-icon-box">
                <FileCheck2 className="w-5 h-5 text-black" />
              </div>
              {step3Done && (
                <span className="template-badge-black text-[10px]">
                  <Check className="w-3 h-3 text-[#FFC700] mr-1" /> Verified
                </span>
              )}
            </div>

            <h3 className="text-xl font-black text-black">Nadakacheri RD Numbers</h3>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <input
                type="text"
                value={casteRdInput}
                onChange={(e) => setCasteRdInput(e.target.value)}
                className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-black focus:outline-none focus:border-black"
              />
              <input
                type="text"
                value={incomeRdInput}
                onChange={(e) => setIncomeRdInput(e.target.value)}
                className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-black focus:outline-none focus:border-black"
              />
            </div>

            {step3Done && (
              <div className="mt-3 bg-zinc-50 rounded-2xl p-3 text-xs text-black border border-zinc-200 space-y-0.5 font-medium">
                <div className="font-black text-black">Category: {student.reservations.casteCategory}</div>
                <div className="text-zinc-600">Income: ₹{student.reservations.annualIncome.toLocaleString()}/yr</div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-1 flex gap-2">
            <button
              onClick={handleFetch3}
              disabled={step3Loading || step3Done}
              className={`w-full ${step3Done ? 'template-btn-white opacity-80 cursor-default' : 'template-btn-black'} text-xs`}
            >
              {step3Loading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : step3Done ? (
                'Verified'
              ) : (
                'Verify Certificates'
              )}
            </button>
          </div>
        </div>

        {/* Card 4: DCET Rank */}
        <div className={`template-card p-6 flex flex-col justify-between min-h-[270px] ${
          !step3Done ? 'opacity-50 pointer-events-none' : 'opacity-100'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="template-icon-box">
                <Award className="w-5 h-5 text-black" />
              </div>
              {step4Done && (
                <span className="template-badge-black text-[10px]">
                  <Check className="w-3 h-3 text-[#FFC700] mr-1" /> Linked
                </span>
              )}
            </div>

            <h3 className="text-xl font-black text-black">DCET-2026 Rank</h3>

            <div className="mt-3">
              <input
                type="text"
                value={rankInput}
                onChange={(e) => setRankInput(e.target.value)}
                className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl px-3.5 py-2 text-sm font-mono font-black text-black focus:outline-none focus:border-black"
              />
            </div>

            {step4Done && (
              <div className="mt-3 bg-zinc-50 rounded-2xl p-3 text-xs text-black border border-zinc-200 space-y-0.5 font-medium">
                <div className="font-black text-black">Rank #{student.exam.dcetRank.toLocaleString()}</div>
                <div className="text-zinc-600">Roll: {student.exam.dcetRollNo}</div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-1 flex gap-2">
            <button
              onClick={handleFetch4}
              disabled={step4Loading || step4Done}
              className={`w-full ${step4Done ? 'template-btn-white opacity-80 cursor-default' : 'template-btn-black'} text-xs`}
            >
              {step4Loading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : step4Done ? (
                'Linked'
              ) : (
                'Lock Rank'
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Floating Success Bottom Bar */}
      {isAllResolved && (
        <div className="template-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div>
            <span className="font-black text-base block text-black">All 4 Identifiers Resolved</span>
            <span className="text-xs text-zinc-600">
              Secret Key: <strong className="font-mono text-black">{student.verification.secretKey}</strong>
            </span>
          </div>

          <button
            onClick={onProceed}
            className="template-btn-black flex items-center gap-2 text-xs font-black shadow-md"
          >
            <span>Proceed to Priority List</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
