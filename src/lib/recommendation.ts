import { College, BranchCutoff, StudentProfile, RecommendationResult, ProbabilityTier } from '@/types';

export function calculateCollegeRecommendations(
  student: StudentProfile,
  colleges: College[],
  filters?: {
    maxFee?: number;
    requireHostel?: boolean;
    districts?: string[];
    branches?: string[];
  }
): RecommendationResult[] {
  const results: RecommendationResult[] = [];
  const rank = student.exam.dcetRank;
  const { casteCategory, isKalyanaKarnataka, isRuralQuota, isSnqEligible } = student.reservations;
  const diplomaBranch = student.academic.diplomaBranch;

  for (const college of colleges) {
    if (filters?.requireHostel && !college.hasCampusHostel) continue;
    if (filters?.districts && filters.districts.length > 0 && !filters.districts.includes(college.district)) continue;

    for (const branch of college.branches) {
      // 1. Branch Eligibility Check: Ensure diploma branch matches engineering branch
      const isBranchEligible = branch.eligibleDiplomaBranches.some(eb => 
        eb.toLowerCase() === diplomaBranch.toLowerCase() ||
        diplomaBranch.toLowerCase().includes(eb.toLowerCase()) ||
        eb.toLowerCase().includes(diplomaBranch.toLowerCase())
      );

      if (!isBranchEligible) continue;
      if (filters?.branches && filters.branches.length > 0 && !filters.branches.includes(branch.branchCode)) continue;

      // 2. Determine best applicable category cutoff
      const cutoffs2025 = branch.cutoffs.year2025;
      let effectiveCutoff = cutoffs2025['GM'] || 1000;
      let applicableCategory = 'GM (General Merit)';
      const matchReasons: string[] = [];

      // Check SNQ first if eligible
      if (isSnqEligible && cutoffs2025['SNQ']) {
        if (rank <= cutoffs2025['SNQ'] * 1.1) {
          effectiveCutoff = cutoffs2025['SNQ'];
          applicableCategory = 'SNQ (Supernumerary Quota)';
          matchReasons.push('Eligible for SNQ 90%+ tuition fee waiver based on verified family income');
        }
      }

      // Check Kalyana Karnataka (371J)
      if (isKalyanaKarnataka) {
        const hkKey = `${casteCategory.replace('G', '')}HK`;
        const gmHkKey = 'GMHK';
        const hkCutoff = cutoffs2025[hkKey] || cutoffs2025[gmHkKey];
        if (hkCutoff && hkCutoff > effectiveCutoff) {
          effectiveCutoff = hkCutoff;
          applicableCategory = `${hkKey} (Article 371J Kalyana-Karnataka)`;
          matchReasons.push('Benefited from Article 371J Regional Reservation');
        }
      }

      // Check Rural Quota
      if (isRuralQuota) {
        const ruralKey = `${casteCategory.replace('G', '')}R`;
        const ruralCutoff = cutoffs2025[ruralKey];
        if (ruralCutoff && ruralCutoff > effectiveCutoff) {
          effectiveCutoff = ruralCutoff;
          applicableCategory = `${ruralKey} (Rural 1st-10th Quota)`;
          matchReasons.push('Benefited from 1st-10th Rural School Quota');
        }
      }

      // Check Category General (e.g. 3AG, 2AG, SCG)
      const catCutoff = cutoffs2025[casteCategory];
      if (catCutoff && catCutoff > effectiveCutoff) {
        effectiveCutoff = catCutoff;
        applicableCategory = `${casteCategory} (Category Reservation)`;
        matchReasons.push(`Evaluated under verified ${casteCategory} reservation`);
      }

      if (matchReasons.length === 0) {
        matchReasons.push('Evaluated under Karnataka State General Merit cutoff');
      }

      // 3. Calculate Probability Tier and Score
      let probabilityTier: ProbabilityTier;
      let probabilityScore: number;

      const rankRatio = rank / effectiveCutoff;

      if (rankRatio <= 0.85) {
        probabilityTier = 'Safe';
        // Score between 88% and 99%
        probabilityScore = Math.min(99, Math.round(99 - (rankRatio * 12)));
      } else if (rankRatio <= 1.08) {
        probabilityTier = 'Moderate';
        // Score between 55% and 85%
        probabilityScore = Math.max(55, Math.min(85, Math.round(85 - ((rankRatio - 0.85) * 130))));
      } else {
        probabilityTier = 'Ambitious';
        // Score between 15% and 50%
        probabilityScore = Math.max(15, Math.min(50, Math.round(50 - ((rankRatio - 1.08) * 40))));
      }

      // 4. Calculate Net Tuition Fee
      const isSnqApplied = isSnqEligible && (applicableCategory.includes('SNQ') || probabilityTier === 'Safe');
      const tuitionFee = isSnqApplied ? branch.snqAnnualFee : branch.annualTuitionFee;

      if (filters?.maxFee && tuitionFee > filters.maxFee) continue;

      results.push({
        college,
        branch,
        effectiveCutoff,
        applicableCategory,
        probabilityTier,
        probabilityScore,
        tuitionFee,
        isSnqApplied,
        matchReasons
      });
    }
  }

  // Sort logically: First by Probability Tier (Safe & Moderate first, or sorted by college rating & cutoff)
  return results.sort((a, b) => {
    // Quality weight: college rating + placement
    const scoreA = (a.probabilityScore * 0.5) + (a.college.ratingOverall * 10);
    const scoreB = (b.probabilityScore * 0.5) + (b.college.ratingOverall * 10);
    return scoreB - scoreA;
  });
}
