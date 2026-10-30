import { TestMark, Subject } from '../types';

export interface GradeInfo {
  letter: string;
  color: string;
  badgeBg: string;
  label: string;
  gpa: number;
}

export function calculatePercentage(obtained: number, max: number): number {
  if (!max || max <= 0) return 0;
  const p = (obtained / max) * 100;
  return Math.round(p * 10) / 10;
}

export function calculateGrade(percentage: number): GradeInfo {
  if (percentage >= 90) {
    return {
      letter: 'A+',
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      label: 'Outstanding',
      gpa: 4.0,
    };
  }
  if (percentage >= 80) {
    return {
      letter: 'A',
      color: 'text-teal-400',
      badgeBg: 'bg-teal-500/10 border-teal-500/20 text-teal-400',
      label: 'Excellent',
      gpa: 3.7,
    };
  }
  if (percentage >= 70) {
    return {
      letter: 'B+',
      color: 'text-blue-400',
      badgeBg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      label: 'Very Good',
      gpa: 3.3,
    };
  }
  if (percentage >= 60) {
    return {
      letter: 'B',
      color: 'text-indigo-400',
      badgeBg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
      label: 'Good',
      gpa: 3.0,
    };
  }
  if (percentage >= 50) {
    return {
      letter: 'C',
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      label: 'Satisfactory',
      gpa: 2.0,
    };
  }
  if (percentage >= 40) {
    return {
      letter: 'D',
      color: 'text-orange-400',
      badgeBg: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
      label: 'Pass',
      gpa: 1.0,
    };
  }
  return {
    letter: 'F',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    label: 'Needs Improvement',
    gpa: 0.0,
  };
}

export interface MarksSummary {
  totalTests: number;
  totalMarksObtained: number;
  totalMaxMarks: number;
  averagePercentage: number;
  weightedAveragePercentage: number;
  totalWeightageEvaluated: number;
  highestMark: TestMark | null;
  lowestMark: TestMark | null;
  grade: GradeInfo;
}

export function calculateMarksSummary(marks: TestMark[]): MarksSummary {
  if (!marks || marks.length === 0) {
    return {
      totalTests: 0,
      totalMarksObtained: 0,
      totalMaxMarks: 0,
      averagePercentage: 0,
      weightedAveragePercentage: 0,
      totalWeightageEvaluated: 0,
      highestMark: null,
      lowestMark: null,
      grade: calculateGrade(0),
    };
  }

  let totalObtained = 0;
  let totalMax = 0;
  let sumPercentage = 0;
  let weightedScoreSum = 0;
  let totalWeightage = 0;

  let highestMark: TestMark | null = null;
  let lowestMark: TestMark | null = null;
  let highestPercent = -1;
  let lowestPercent = 101;

  marks.forEach((m) => {
    totalObtained += m.marksObtained;
    totalMax += m.maxMarks;

    const percent = m.percentage ?? calculatePercentage(m.marksObtained, m.maxMarks);
    sumPercentage += percent;

    if (m.weightage && m.weightage > 0) {
      totalWeightage += m.weightage;
      weightedScoreSum += (percent * m.weightage) / 100;
    }

    if (percent > highestPercent) {
      highestPercent = percent;
      highestMark = m;
    }
    if (percent < lowestPercent) {
      lowestPercent = percent;
      lowestMark = m;
    }
  });

  const rawAverage = Math.round((sumPercentage / marks.length) * 10) / 10;

  const weightedAverage =
    totalWeightage > 0
      ? Math.round((weightedScoreSum / totalWeightage) * 100 * 10) / 10
      : rawAverage;

  return {
    totalTests: marks.length,
    totalMarksObtained: Math.round(totalObtained * 10) / 10,
    totalMaxMarks: Math.round(totalMax * 10) / 10,
    averagePercentage: rawAverage,
    weightedAveragePercentage: weightedAverage,
    totalWeightageEvaluated: Math.min(100, Math.round(totalWeightage)),
    highestMark,
    lowestMark,
    grade: calculateGrade(weightedAverage),
  };
}

export function calculateTargetNeeded(
  marks: TestMark[],
  targetDesiredPercent: number,
  remainingWeightage: number
): { requiredPercentage: number; achievable: boolean } {
  if (remainingWeightage <= 0) {
    return { requiredPercentage: 0, achievable: false };
  }

  let currentWeightedSum = 0;
  marks.forEach((m) => {
    const percent = m.percentage ?? calculatePercentage(m.marksObtained, m.maxMarks);
    const weight = m.weightage || 0;
    currentWeightedSum += (percent * weight) / 100;
  });

  // targetDesiredPercent = currentWeightedSum + (requiredPercentage * remainingWeightage) / 100
  // requiredPercentage = ((targetDesiredPercent - currentWeightedSum) * 100) / remainingWeightage
  const needed = ((targetDesiredPercent - currentWeightedSum) * 100) / remainingWeightage;
  const rounded = Math.round(needed * 10) / 10;

  return {
    requiredPercentage: Math.max(0, rounded),
    achievable: rounded <= 100,
  };
}
