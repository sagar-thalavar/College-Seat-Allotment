'use client';

import React, { useState, useEffect } from 'react';
import studentsData from '@/data/students.json';
import collegesData from '@/data/colleges.json';
import { StudentProfile, College, OptionChoice } from '@/types';
import { calculateCollegeRecommendations } from '@/lib/recommendation';
import { Navbar } from '@/components/Navbar';
import { IdentifierInputSection } from '@/components/IdentifierInputSection';
import { OptionEntryStudio } from '@/components/OptionEntryStudio';

export default function Home() {
  const students = studentsData as StudentProfile[];
  const colleges = collegesData as College[];

  const [currentStep, setCurrentStep] = useState<number>(1);
  const selectedStudent = students[0]; // Single user: Sagar R Thalavar
  const [optionChoices, setOptionChoices] = useState<OptionChoice[]>([]);

  useEffect(() => {
    const recs = calculateCollegeRecommendations(selectedStudent, colleges);
    const initialChoices: OptionChoice[] = recs.slice(0, 10).map((r, idx) => ({
      priority: idx + 1,
      collegeCode: r.college.code,
      collegeName: r.college.name,
      collegeDistrict: r.college.district,
      branchCode: r.branch.branchCode,
      branchName: r.branch.branchName,
      tuitionFee: r.tuitionFee,
      isSnqApplied: r.isSnqApplied,
      probabilityTier: r.probabilityTier,
      probabilityScore: r.probabilityScore
    }));
    setOptionChoices(initialChoices);
  }, [selectedStudent, colleges]);

  const handleRemoveChoice = (index: number) => {
    const updated = optionChoices.filter((_, idx) => idx !== index);
    const reindexed = updated.map((item, idx) => ({ ...item, priority: idx + 1 }));
    setOptionChoices(reindexed);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFC700] text-black">
      
      {/* Top Header */}
      <Navbar currentStep={currentStep} onStepClick={setCurrentStep} />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-4 py-6 flex-1">
        
        {/* Step 1: Student Verification */}
        {currentStep === 1 && (
          <IdentifierInputSection
            student={selectedStudent}
            onProceed={() => setCurrentStep(2)}
          />
        )}

        {/* Step 2: Option Entry Priority List */}
        {currentStep === 2 && (
          <OptionEntryStudio
            optionChoices={optionChoices}
            onReorderChoices={setOptionChoices}
            onRemoveChoice={handleRemoveChoice}
          />
        )}

      </main>

    </div>
  );
}
