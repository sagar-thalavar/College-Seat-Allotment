'use client';

import React, { useEffect, useRef, useState } from 'react';
import studentsData from '@/data/students.json';
import collegesData from '@/data/colleges.json';
import {
  College,
  OptionChoice,
  RecommendationResult,
  StudentProfile,
} from '@/types';
import { Navbar, SHELL_COLUMN } from '@/components/Navbar';
import { type Stage } from '@/components/StageNav';
import { IdentifierInputSection } from '@/components/IdentifierInputSection';
import { OptionEntryStudio } from '@/components/OptionEntryStudio';
import { calculateCollegeRecommendations } from '@/lib/recommendation';

const MAX_OPTIONS = 10;

const colleges = collegesData as College[];
const candidates = studentsData as StudentProfile[];
const student = candidates[0];

if (!student) {
  throw new Error(
    'src/data/students.json holds no candidate. The shell needs exactly one record to run against.',
  );
}

function toOptionChoice(
  recommendation: RecommendationResult,
  priority: number,
): OptionChoice {
  return {
    priority,
    collegeCode: recommendation.college.code,
    collegeName: recommendation.college.name,
    collegeDistrict: recommendation.college.district,
    branchCode: recommendation.branch.branchCode,
    branchName: recommendation.branch.branchName,
    tuitionFee: recommendation.tuitionFee,
    isSnqApplied: recommendation.isSnqApplied,
    probabilityTier: recommendation.probabilityTier,
    probabilityScore: recommendation.probabilityScore,
  };
}

function withPriorities(choices: OptionChoice[]): OptionChoice[] {
  return choices.map((choice, index) => ({ ...choice, priority: index + 1 }));
}

export default function Home() {
  const [currentStage, setCurrentStage] = useState<Stage>(1);
  const [highestStageReached, setHighestStageReached] = useState<Stage>(1);
  const [optionChoices, setOptionChoices] = useState<OptionChoice[]>([]);

  const hasMounted = useRef(false);

  useEffect(() => {
    const recs = calculateCollegeRecommendations(student, colleges);
    const sortedDreamToSafe = [...recs].sort((a, b) => a.effectiveCutoff - b.effectiveCutoff);
    const initialChoices: OptionChoice[] = sortedDreamToSafe
      .slice(0, MAX_OPTIONS)
      .map((r, idx) => toOptionChoice(r, idx + 1));
    setOptionChoices(initialChoices);
  }, []);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    window.scrollTo({ top: 0 });
  }, [currentStage]);

  const goToStage = (next: Stage) => {
    setCurrentStage(next);
    setHighestStageReached((highest) => (next > highest ? next : highest));
  };

  const removeChoice = (index: number) => {
    setOptionChoices((choices) => {
      if (index < 0 || index >= choices.length) return choices;
      return withPriorities(choices.filter((_, position) => position !== index));
    });
  };

  const reorderChoices = (choices: OptionChoice[]) => {
    setOptionChoices(withPriorities(choices));
  };

  return (
    <div className="flex min-h-dvh flex-col bg-ground text-ink">
      <a
        href="#stage"
        className="sr-only rounded-sm bg-ink px-3 py-2 text-label text-ground focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[var(--z-toast)]"
      >
        Skip to this stage
      </a>

      <Navbar
        student={student}
        currentStage={currentStage}
        highestStageReached={highestStageReached}
        onSelectStage={goToStage}
      />

      <main id="stage" className={`${SHELL_COLUMN} flex-1 py-6 sm:py-10`}>
        <div
          key={currentStage}
          className="animate-[row-settle_var(--dur-base)_var(--ease-out-quart)]"
        >
          {currentStage === 1 && (
            <IdentifierInputSection
              student={student}
              onProceed={() => goToStage(2)}
            />
          )}

          {currentStage === 2 && (
            <OptionEntryStudio
              optionChoices={optionChoices}
              onReorderChoices={reorderChoices}
              onRemoveChoice={removeChoice}
              onProceedToRounds={() => {}}
            />
          )}
        </div>
      </main>
    </div>
  );
}
