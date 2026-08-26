export type CategoryType = 'GM' | '1G' | '2AG' | '2BG' | '3AG' | '3BG' | 'SCG' | 'STG';

export interface StudentProfile {
  id: string;
  name: string;
  aadhaarNumber: string;
  phone: string;
  email: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  fatherName: string;
  motherName: string;
  address: {
    line: string;
    taluk: string;
    district: string;
    pincode: string;
    state: string;
  };
  academic: {
    sslcRollNo: string;
    sslcBoard: string;
    sslcPassingYear: number;
    sslcMaxMarks: number;
    sslcSecuredMarks: number;
    sslcPercentage: number;
    isRuralSchool: boolean;
    isKannadaMedium: boolean;
    diplomaUsn: string;
    diplomaBoard: string;
    diplomaCollege: string;
    diplomaDistrict: string;
    diplomaBranch: string;
    diplomaPassingYear: number;
    semMarks: number[];
    aggregatePercentage: number;
    isFinalSemPending: boolean;
  };
  reservations: {
    casteRdNumber: string;
    casteCategory: CategoryType;
    subCaste: string;
    incomeRdNumber: string;
    annualIncome: number;
    isSnqEligible: boolean; // Auto-calculated if income <= 8,00,000
    isKalyanaKarnataka: boolean; // Article 371J
    kalyanaKarnatakaRdNumber?: string;
    kalyanaKarnatakaDistrict?: string;
    isRuralQuota: boolean;
    isKannadaMediumQuota: boolean;
    isPwd: boolean;
    pwdUdid?: string;
    isNcc: boolean;
    isWorkingProfessional: boolean;
    yearsOfExperience?: number;
  };
  exam: {
    dcetRollNo: string;
    dcetRank: number;
    examCenter: string;
    score: number;
  };
  verification: {
    isVerified: boolean;
    secretKey: string;
    verifiedCodes: string[];
    verificationDate: string;
    helplineCenter: string;
  };
}

export interface BranchCutoff {
  branchCode: string;
  branchName: string;
  eligibleDiplomaBranches: string[];
  intakeTotal: number;
  lateralIntake: number;
  cutoffs: {
    year2025: Record<string, number>;
    year2024: Record<string, number>;
    year2023: Record<string, number>;
  };
  placements: {
    averageCtcLpa: number;
    medianCtcLpa: number;
    highestCtcLpa: number;
    placedPercentage: number;
    topRecruiters: string[];
  };
  annualTuitionFee: number;
  snqAnnualFee: number;
}

export interface College {
  code: string;
  name: string;
  shortName: string;
  district: string;
  city: string;
  type: 'Government' | 'Aided' | 'Private Autonomous' | 'State University';
  nirfRank: number | null;
  naacGrade: string;
  establishedYear: number;
  website: string;
  hasCampusHostel: boolean;
  hostelAnnualFee: number;
  ratingOverall: number;
  branches: BranchCutoff[];
}

export type ProbabilityTier = 'Safe' | 'Moderate' | 'Ambitious';

export interface RecommendationResult {
  college: College;
  branch: BranchCutoff;
  effectiveCutoff: number;
  applicableCategory: string;
  probabilityTier: ProbabilityTier;
  probabilityScore: number; // 0 - 100%
  tuitionFee: number;
  isSnqApplied: boolean;
  matchReasons: string[];
}

export interface OptionChoice {
  priority: number;
  collegeCode: string;
  collegeName: string;
  collegeDistrict: string;
  branchCode: string;
  branchName: string;
  tuitionFee: number;
  isSnqApplied: boolean;
  probabilityTier: ProbabilityTier;
  probabilityScore: number;
}

export interface AllotmentResult {
  round: number;
  isAllotted: boolean;
  allottedChoice?: OptionChoice;
  allottedCategory: string;
  cutoffRankAtAllotment: number;
  candidateRank: number;
  allotmentDate: string;
  challanNumber: string;
  feePayable: number;
}
