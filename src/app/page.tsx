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
import { VerificationSlip } from '@/components/VerificationSlip';
import { CollegeRecommendationList } from '@/components/CollegeRecommendationList';
import { OptionEntryStudio } from '@/components/OptionEntryStudio';
import { RoundSimulator } from '@/components/RoundSimulator';

/** KEA allows ten options in the lateral-entry option entry. Not eleven. */
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

/** Priority is the list order and nothing else. Re-derive it after every edit. */
function withPriorities(choices: OptionChoice[]): OptionChoice[] {
  return choices.map((choice, index) => ({ ...choice, priority: index + 1 }));
}

/** The same branch at the same college is one seat, however many times it is offered. */
function holdsSeat(
  choices: OptionChoice[],
  recommendation: RecommendationResult,
): boolean {
  return choices.some(
    (choice) =>
      choice.collegeCode === recommendation.college.code &&
      choice.branchCode === recommendation.branch.branchCode,
  );
}

export default function Home() {
  const [currentStage, setCurrentStage] = useState<Stage>(1);
  const [highestStageReached, setHighestStageReached] = useState<Stage>(1);
  const [optionChoices, setOptionChoices] = useState<OptionChoice[]>([]);

  const hasMounted = useRef(false);

  // A stage change replaces the whole screen. Land the reader at the top of the
  // new one rather than halfway down it. Not on first paint — nothing moved yet.
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

  const addChoice = (recommendation: RecommendationResult) => {
    setOptionChoices((choices) => {
      if (choices.length >= MAX_OPTIONS) return choices;
      if (holdsSeat(choices, recommendation)) return choices;
      return withPriorities([
        ...choices,
        toOptionChoice(recommendation, choices.length + 1),
      ]);
    });
  };

  const addAllChoices = (recommendations: RecommendationResult[]) => {
    setOptionChoices((choices) => {
      const next = [...choices];
      for (const recommendation of recommendations) {
        if (next.length >= MAX_OPTIONS) break;
        if (holdsSeat(next, recommendation)) continue;
        next.push(toOptionChoice(recommendation, next.length + 1));
      }
      return withPriorities(next);
    });
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
        {/*
          The stage swap is a crossfade and nothing more: `row-settle` at 180ms,
          keyed on the stage so it replays on each change. It carries no
          fill-mode, so the content is fully rendered and readable whether or not
          the animation ever runs.
        */}
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
            <VerificationSlip
              student={student}
              onProceedToColleges={() => goToStage(3)}
            />
          )}

          {currentStage === 3 && (
            <CollegeRecommendationList
              student={student}
              colleges={colleges}
              optionChoices={optionChoices}
              onAddChoice={addChoice}
              onAddAllChoices={addAllChoices}
              onProceedToOptionEntry={() => goToStage(4)}
            />
          )}

          {currentStage === 4 && (
            <OptionEntryStudio
              optionChoices={optionChoices}
              onReorderChoices={reorderChoices}
              onRemoveChoice={removeChoice}
              onProceedToRounds={() => goToStage(5)}
            />
          )}

          {currentStage === 5 && (
            <RoundSimulator
              student={student}
              optionChoices={optionChoices}
              onResetToOptions={() => goToStage(4)}
            />
          )}
        </div>
      </main>

      <footer className="border-t border-hairline bg-panel">
        <div className={`${SHELL_COLUMN} py-4`}>
          <p className="text-micro text-ink-muted">
            Demonstration build. Every record, cutoff and allotment shown here is
            mock data. Not affiliated with, or endorsed by, the Karnataka
            Examinations Authority.
          </p>
        </div>
      </footer>
    </div>
  );
}
