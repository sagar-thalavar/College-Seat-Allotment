'use client';

import React, { useState, useEffect } from 'react';
import { StudentProfile } from '@/types';
import { ArrowRight, Loader2, Check, CreditCard, GraduationCap, FileCheck2, Award, ChevronRight, X } from 'lucide-react';

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

  // Dynamic Detail Modal state for each of the 4 sections
  const [activeDetailSection, setActiveDetailSection] = useState<number | null>(null);

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
    }, 300);
  };

  const handleFetch2 = () => {
    setStep2Loading(true);
    setTimeout(() => {
      setStep2Loading(false);
      setStep2Done(true);
    }, 300);
  };

  const handleFetch3 = () => {
    setStep3Loading(true);
    setTimeout(() => {
      setStep3Loading(false);
      setStep3Done(true);
    }, 300);
  };

  const handleFetch4 = () => {
    setStep4Loading(true);
    setTimeout(() => {
      setStep4Loading(false);
      setStep4Done(true);
    }, 300);
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
      <div className="flex items-center justify-end">
        <button
          onClick={handleClickMe}
          className="template-btn-black text-xs font-black shadow-lg"
        >
          Click Me
        </button>
      </div>

      {/* 4 White Floating Cards */}
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
              <div className="mt-3 bg-zinc-50 rounded-2xl p-3 text-xs text-black border border-zinc-200 flex items-center justify-between">
                <div>
                  <div className="font-black text-black text-sm">{student.name}</div>
                  <div className="text-zinc-600">{student.dob} | {student.gender}</div>
                  <div className="text-zinc-600">{student.address.district}</div>
                </div>

                {/* Arrow Button to open Dynamic Detail Card */}
                <button
                  onClick={() => setActiveDetailSection(1)}
                  className="w-8 h-8 rounded-full bg-black hover:bg-zinc-800 text-white flex items-center justify-center transition-all shadow-xs shrink-0 ml-2"
                  title="View More Details"
                >
                  <ChevronRight className="w-4 h-4 text-[#FFC700]" />
                </button>
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
              <div className="mt-3 bg-zinc-50 rounded-2xl p-3 text-xs text-black border border-zinc-200 flex items-center justify-between">
                <div>
                  <div className="font-black text-black">{student.academic.diplomaBranch}</div>
                  <div className="text-zinc-600">Aggregate: <strong className="text-black">{student.academic.aggregatePercentage}%</strong></div>
                </div>

                {/* Arrow Button to open Dynamic Detail Card */}
                <button
                  onClick={() => setActiveDetailSection(2)}
                  className="w-8 h-8 rounded-full bg-black hover:bg-zinc-800 text-white flex items-center justify-center transition-all shadow-xs shrink-0 ml-2"
                  title="View More Details"
                >
                  <ChevronRight className="w-4 h-4 text-[#FFC700]" />
                </button>
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
              <div className="mt-3 bg-zinc-50 rounded-2xl p-3 text-xs text-black border border-zinc-200 flex items-center justify-between">
                <div>
                  <div className="font-black text-black">Category: {student.reservations.casteCategory}</div>
                  <div className="text-zinc-600">Income: ₹{student.reservations.annualIncome.toLocaleString()}/yr</div>
                </div>

                {/* Arrow Button to open Dynamic Detail Card */}
                <button
                  onClick={() => setActiveDetailSection(3)}
                  className="w-8 h-8 rounded-full bg-black hover:bg-zinc-800 text-white flex items-center justify-center transition-all shadow-xs shrink-0 ml-2"
                  title="View More Details"
                >
                  <ChevronRight className="w-4 h-4 text-[#FFC700]" />
                </button>
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
              <div className="mt-3 bg-zinc-50 rounded-2xl p-3 text-xs text-black border border-zinc-200 flex items-center justify-between">
                <div>
                  <div className="font-black text-black">Rank #{student.exam.dcetRank.toLocaleString()}</div>
                  <div className="text-zinc-600">Roll: {student.exam.dcetRollNo}</div>
                </div>

                {/* Arrow Button to open Dynamic Detail Card */}
                <button
                  onClick={() => setActiveDetailSection(4)}
                  className="w-8 h-8 rounded-full bg-black hover:bg-zinc-800 text-white flex items-center justify-center transition-all shadow-xs shrink-0 ml-2"
                  title="View More Details"
                >
                  <ChevronRight className="w-4 h-4 text-[#FFC700]" />
                </button>
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

      {/* Dynamic Detail Modal for Section 1, 2, 3, or 4 */}
      {activeDetailSection !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="template-card max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="text-lg font-black text-black">
                {activeDetailSection === 1 && 'Aadhaar & Personal Details'}
                {activeDetailSection === 2 && 'Academic & Polytechnic Records'}
                {activeDetailSection === 3 && 'Reservations & RD Certificates'}
                {activeDetailSection === 4 && 'Entrance Exam & Verification'}
              </h3>
              <button
                onClick={() => setActiveDetailSection(null)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-black flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-2.5 text-xs text-zinc-800 font-medium">
              
              {/* Detail Section 1: Aadhaar */}
              {activeDetailSection === 1 && (
                <div className="space-y-2 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                  <div className="flex justify-between py-1 border-b border-zinc-200/60">
                    <span className="text-zinc-500">Legal Full Name:</span>
                    <span className="font-black text-black">{student.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-200/60">
                    <span className="text-zinc-500">Date of Birth & Gender:</span>
                    <span className="font-bold text-black">{student.dob} | {student.gender}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-200/60">
                    <span className="text-zinc-500">Father's Name:</span>
                    <span className="font-bold text-black">{student.fatherName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-200/60">
                    <span className="text-zinc-500">Mother's Name:</span>
                    <span className="font-bold text-black">{student.motherName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-200/60">
                    <span className="text-zinc-500">Phone & Email:</span>
                    <span className="font-mono text-black">{student.phone} | {student.email}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-500">Permanent Address:</span>
                    <span className="font-bold text-black text-right">{student.address.line}, {student.address.taluk}, {student.address.district}, {student.address.pincode}</span>
                  </div>
                </div>
              )}

              {/* Detail Section 2: Academic */}
              {activeDetailSection === 2 && (
                <div className="space-y-2 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                  <div className="flex justify-between py-1 border-b border-zinc-200/60">
                    <span className="text-zinc-500">SSLC Registration No:</span>
                    <span className="font-mono font-black text-black">{student.academic.sslcRollNo}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-200/60">
                    <span className="text-zinc-500">10th Board & Percentage:</span>
                    <span className="font-bold text-black">{student.academic.sslcPercentage}% ({student.academic.sslcBoard})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-200/60">
                    <span className="text-zinc-500">Diploma USN:</span>
                    <span className="font-mono font-black text-black">{student.academic.diplomaUsn}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-200/60">
                    <span className="text-zinc-500">Polytechnic College:</span>
                    <span className="font-bold text-black">{student.academic.diplomaCollege}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-200/60">
                    <span className="text-zinc-500">Diploma Discipline:</span>
                    <span className="font-black text-black">{student.academic.diplomaBranch}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-500">6-Semester Aggregate:</span>
                    <span className="font-black text-black text-sm">{student.academic.aggregatePercentage}%</span>
                  </div>
                </div>
              )}

              {/* Detail Section 3: Reservations */}
              {activeDetailSection === 3 && (
                <div className="space-y-2 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                  <div className="flex justify-between py-1 border-b border-zinc-200/60">
                    <span className="text-zinc-500">Caste Category:</span>
                    <span className="font-black text-black">{student.reservations.casteCategory} ({student.reservations.subCaste})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-200/60">
                    <span className="text-zinc-500">Caste RD Certificate No:</span>
                    <span className="font-mono font-bold text-black">{student.reservations.casteRdNumber}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-200/60">
                    <span className="text-zinc-500">Income RD Certificate No:</span>
                    <span className="font-mono font-bold text-black">{student.reservations.incomeRdNumber}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-200/60">
                    <span className="text-zinc-500">Annual Family Income:</span>
                    <span className="font-bold text-black">₹{student.reservations.annualIncome.toLocaleString()} / year</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-500">SNQ Subsidized Fee Status:</span>
                    <span className="bg-black text-[#FFC700] px-2 py-0.5 rounded-full font-black text-[10px]">
                      {student.reservations.isSnqEligible ? 'APPROVED' : 'NOT ELIGIBLE'}
                    </span>
                  </div>
                </div>
              )}

              {/* Detail Section 4: Rank */}
              {activeDetailSection === 4 && (
                <div className="space-y-2 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                  <div className="flex justify-between py-1 border-b border-zinc-200/60">
                    <span className="text-zinc-500">DCET Roll Number:</span>
                    <span className="font-mono font-black text-black">{student.exam.dcetRollNo}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-200/60">
                    <span className="text-zinc-500">State Lateral Entry Rank:</span>
                    <span className="font-mono font-black text-base text-black">#{student.exam.dcetRank.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-200/60">
                    <span className="text-zinc-500">Exam Center:</span>
                    <span className="font-bold text-black">{student.exam.examCenter}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-200/60">
                    <span className="text-zinc-500">Candidate Secret Key:</span>
                    <span className="font-mono font-black text-black">{student.verification.secretKey}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-500">Verification Helpline:</span>
                    <span className="font-bold text-black">{student.verification.helplineCenter}</span>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Close Button */}
            <div className="pt-2">
              <button
                onClick={() => setActiveDetailSection(null)}
                className="template-btn-black w-full text-xs font-black"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
