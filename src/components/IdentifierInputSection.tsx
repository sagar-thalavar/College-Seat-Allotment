'use client';

import React, { useState, useEffect } from 'react';
import { StudentProfile } from '@/types';
import { ArrowRight, Loader2, Check } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto space-y-5">
      
      {/* Top Single Button Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
        <h2 className="text-base font-black text-zinc-950">
          Candidate: {student.name}
        </h2>

        <button
          onClick={handleClickMe}
          className="pill-btn-yellow px-6 py-2 text-xs font-black shadow-xs border border-yellow-400"
        >
          Click Me
        </button>
      </div>

      {/* 4 Cards (Yellow & White) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Box 1: Aadhaar */}
        <div className="card-yellow rounded-3xl p-5 flex flex-col justify-between min-h-[260px] shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="badge-tag font-bold">1. Identity</span>
              {step1Done && (
                <span className="bg-zinc-950 text-white text-[11px] font-bold px-3 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-yellow-300" /> Verified
                </span>
              )}
            </div>

            <h3 className="text-base font-black text-zinc-950">Aadhaar Card</h3>

            <div className="mt-2">
              <input
                type="text"
                value={aadhaarInput}
                onChange={(e) => setAadhaarInput(e.target.value)}
                className="w-full bg-white border-2 border-yellow-500/60 rounded-xl px-3 py-2 text-xs font-mono font-bold text-zinc-950 focus:outline-none"
              />
            </div>

            {step1Done && (
              <div className="mt-2.5 bg-white rounded-xl p-2.5 text-xs text-zinc-950 border border-yellow-500/40 space-y-0.5 font-medium shadow-xs">
                <div className="font-black text-zinc-950">{student.name}</div>
                <div className="text-zinc-700">{student.dob} | {student.gender}</div>
                <div className="text-zinc-700">{student.address.district}</div>
              </div>
            )}
          </div>

          <div className="mt-3">
            <button
              onClick={handleFetch1}
              disabled={step1Loading || step1Done}
              className={`w-full py-2.5 px-4 text-xs flex items-center justify-center gap-1.5 font-bold ${
                step1Done
                  ? 'bg-zinc-950 text-white rounded-full cursor-default'
                  : 'bg-zinc-950 hover:bg-zinc-800 text-white rounded-full'
              }`}
            >
              {step1Loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : step1Done ? (
                <span>Verified</span>
              ) : (
                <span>Fetch Aadhaar</span>
              )}
            </button>
          </div>
        </div>

        {/* Box 2: USN & SSLC */}
        <div className={`card-white rounded-3xl p-5 flex flex-col justify-between min-h-[260px] shadow-sm ${
          !step1Done ? 'opacity-40 pointer-events-none' : 'opacity-100'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="badge-tag-yellow font-bold">2. Academic</span>
              {step2Done && (
                <span className="bg-zinc-950 text-white text-[11px] font-bold px-3 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-yellow-300" /> Verified
                </span>
              )}
            </div>

            <h3 className="text-base font-black text-zinc-950">Diploma USN & SSLC</h3>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <input
                type="text"
                value={usnInput}
                onChange={(e) => setUsnInput(e.target.value)}
                className="w-full bg-zinc-50 border-2 border-zinc-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-zinc-950 focus:outline-none"
              />
              <input
                type="text"
                value={sslcInput}
                onChange={(e) => setSslcInput(e.target.value)}
                className="w-full bg-zinc-50 border-2 border-zinc-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-zinc-950 focus:outline-none"
              />
            </div>

            {step2Done && (
              <div className="mt-2.5 bg-zinc-50 rounded-xl p-2.5 text-xs text-zinc-950 border border-zinc-200 space-y-0.5 font-medium">
                <div className="font-black text-zinc-950">{student.academic.diplomaBranch}</div>
                <div className="text-zinc-700">Aggregate: <strong className="text-zinc-950">{student.academic.aggregatePercentage}%</strong></div>
              </div>
            )}
          </div>

          <div className="mt-3">
            <button
              onClick={handleFetch2}
              disabled={step2Loading || step2Done}
              className={`w-full py-2.5 px-4 text-xs flex items-center justify-center gap-1.5 font-bold ${
                step2Done
                  ? 'bg-zinc-950 text-white rounded-full cursor-default'
                  : 'bg-zinc-950 hover:bg-zinc-800 text-white rounded-full'
              }`}
            >
              {step2Loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : step2Done ? (
                <span>Linked</span>
              ) : (
                <span>Fetch Academic</span>
              )}
            </button>
          </div>
        </div>

        {/* Box 3: RD Numbers */}
        <div className={`card-white rounded-3xl p-5 flex flex-col justify-between min-h-[260px] shadow-sm ${
          !step2Done ? 'opacity-40 pointer-events-none' : 'opacity-100'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="badge-tag-yellow font-bold">3. Reservations</span>
              {step3Done && (
                <span className="bg-zinc-950 text-white text-[11px] font-bold px-3 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-yellow-300" /> Verified
                </span>
              )}
            </div>

            <h3 className="text-base font-black text-zinc-950">Nadakacheri RD Numbers</h3>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <input
                type="text"
                value={casteRdInput}
                onChange={(e) => setCasteRdInput(e.target.value)}
                className="w-full bg-zinc-50 border-2 border-zinc-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-zinc-950 focus:outline-none"
              />
              <input
                type="text"
                value={incomeRdInput}
                onChange={(e) => setIncomeRdInput(e.target.value)}
                className="w-full bg-zinc-50 border-2 border-zinc-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-zinc-950 focus:outline-none"
              />
            </div>

            {step3Done && (
              <div className="mt-2.5 bg-zinc-50 rounded-xl p-2.5 text-xs text-zinc-950 border border-zinc-200 space-y-0.5 font-medium">
                <div className="font-black text-zinc-950">Category: {student.reservations.casteCategory}</div>
                <div className="text-zinc-700">Income: ₹{student.reservations.annualIncome.toLocaleString()}/yr</div>
              </div>
            )}
          </div>

          <div className="mt-3">
            <button
              onClick={handleFetch3}
              disabled={step3Loading || step3Done}
              className={`w-full py-2.5 px-4 text-xs flex items-center justify-center gap-1.5 font-bold ${
                step3Done
                  ? 'bg-zinc-950 text-white rounded-full cursor-default'
                  : 'bg-zinc-950 hover:bg-zinc-800 text-white rounded-full'
              }`}
            >
              {step3Loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : step3Done ? (
                <span>Verified</span>
              ) : (
                <span>Verify Certificates</span>
              )}
            </button>
          </div>
        </div>

        {/* Box 4: DCET Rank */}
        <div className={`card-yellow rounded-3xl p-5 flex flex-col justify-between min-h-[260px] shadow-sm ${
          !step3Done ? 'opacity-40 pointer-events-none' : 'opacity-100'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="badge-tag font-bold">4. Merit Rank</span>
              {step4Done && (
                <span className="bg-zinc-950 text-white text-[11px] font-bold px-3 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-yellow-300" /> Linked
                </span>
              )}
            </div>

            <h3 className="text-base font-black text-zinc-950">DCET Rank</h3>

            <div className="mt-2">
              <input
                type="text"
                value={rankInput}
                onChange={(e) => setRankInput(e.target.value)}
                className="w-full bg-white border-2 border-yellow-500/60 rounded-xl px-3 py-2 text-sm font-mono font-black text-zinc-950 focus:outline-none"
              />
            </div>

            {step4Done && (
              <div className="mt-2.5 bg-white rounded-xl p-2.5 text-xs text-zinc-950 border border-yellow-500/40 space-y-0.5 font-medium shadow-xs">
                <div className="font-black text-sm text-zinc-950">Rank #{student.exam.dcetRank.toLocaleString()}</div>
                <div className="text-zinc-700">Roll: {student.exam.dcetRollNo}</div>
              </div>
            )}
          </div>

          <div className="mt-3">
            <button
              onClick={handleFetch4}
              disabled={step4Loading || step4Done}
              className={`w-full py-2.5 px-4 text-xs flex items-center justify-center gap-1.5 font-bold ${
                step4Done
                  ? 'bg-zinc-950 text-white rounded-full cursor-default'
                  : 'bg-zinc-950 hover:bg-zinc-800 text-white rounded-full'
              }`}
            >
              {step4Loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : step4Done ? (
                <span>Linked</span>
              ) : (
                <span>Lock Rank</span>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Direct Proceed Button */}
      {isAllResolved && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={onProceed}
            className="pill-btn-yellow px-8 py-3 text-xs font-black flex items-center gap-2 shadow-md border border-yellow-400"
          >
            <span>Proceed to Priority List</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
