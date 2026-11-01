export interface BunkCalculationResult {
  attended: number;
  totalHeld: number;
  currentPercentage: number;
  targetPercentage: number;
  status: 'safe' | 'warning' | 'critical';
  safeBunksAvailable: number;
  classesNeededToRecover: number;
  projectedIfAttendNext: number;
  projectedIfMissNext: number;
  summaryMessage: string;
}

/**
 * Calculates current attendance percentage.
 * Handles edge cases like zero total classes held.
 */
export function calculateAttendancePercentage(attended: number, totalHeld: number): number {
  if (totalHeld <= 0) return 100;
  if (attended <= 0) return 0;
  if (attended >= totalHeld) return 100;
  return Number(((attended / totalHeld) * 100).toFixed(1));
}

/**
 * Calculates safe bunks available or classes needed to recover attendance.
 *
 * Formula for Safe Bunks:
 * How many classes 'b' can be missed such that:
 *   attended / (totalHeld + b) >= target / 100
 *   attended >= (target / 100) * (totalHeld + b)
 *   b <= (attended - (target / 100) * totalHeld) / (target / 100)
 *   b = floor( (attended - T * totalHeld) / T ) where T = target / 100
 *
 * Formula for Recovery Classes Needed:
 * If currently below target, how many consecutive classes 'c' must be attended:
 *   (attended + c) / (totalHeld + c) >= target / 100
 *   attended + c >= T * totalHeld + T * c
 *   c * (1 - T) >= T * totalHeld - attended
 *   c = ceil( (T * totalHeld - attended) / (1 - T) )
 */
export function calculateBunkMargin(
  attended: number,
  totalHeld: number,
  targetPercentage: number = 75
): BunkCalculationResult {
  const currentPercentage = calculateAttendancePercentage(attended, totalHeld);
  const targetFraction = targetPercentage / 100;

  // Next class projections
  const nextTotal = totalHeld + 1;
  const projectedIfAttendNext = calculateAttendancePercentage(attended + 1, nextTotal);
  const projectedIfMissNext = calculateAttendancePercentage(attended, nextTotal);

  if (totalHeld <= 0) {
    return {
      attended,
      totalHeld,
      currentPercentage: 100,
      targetPercentage,
      status: 'safe',
      safeBunksAvailable: 0,
      classesNeededToRecover: 0,
      projectedIfAttendNext: 100,
      projectedIfMissNext: 0,
      summaryMessage: 'No classes have been recorded yet.',
    };
  }

  // Above or equal to target
  if (currentPercentage >= targetPercentage) {
    const margin = attended - targetFraction * totalHeld;
    const safeBunks = Math.max(0, Math.floor(margin / targetFraction));

    const isWarning = safeBunks <= 1;
    const status: 'safe' | 'warning' = isWarning ? 'warning' : 'safe';

    const summaryMessage =
      safeBunks > 0
        ? `You can safely bunk ${safeBunks} more ${safeBunks === 1 ? 'class' : 'classes'} and stay at or above ${targetPercentage}%.`
        : `On the edge! Skipping even 1 class will drop your attendance below ${targetPercentage}%.`;

    return {
      attended,
      totalHeld,
      currentPercentage,
      targetPercentage,
      status,
      safeBunksAvailable: safeBunks,
      classesNeededToRecover: 0,
      projectedIfAttendNext,
      projectedIfMissNext,
      summaryMessage,
    };
  }

  // Below target: calculate classes needed to recover
  const deficit = targetFraction * totalHeld - attended;
  const divisor = 1 - targetFraction;
  const classesNeeded = divisor > 0 ? Math.ceil(deficit / divisor) : 0;

  return {
    attended,
    totalHeld,
    currentPercentage,
    targetPercentage,
    status: 'critical',
    safeBunksAvailable: 0,
    classesNeededToRecover: classesNeeded,
    projectedIfAttendNext,
    projectedIfMissNext,
    summaryMessage: `Shortage Alert! You must attend the next ${classesNeeded} consecutive ${classesNeeded === 1 ? 'class' : 'classes'} to reach ${targetPercentage}%.`,
  };
}

/**
 * Calculates overall weighted or cumulative attendance across all subjects.
 */
export function calculateOverallAttendance(
  subjects: Array<{ attendanceAttended?: number; attendanceTotal?: number }>
): {
  totalAttended: number;
  totalHeld: number;
  overallPercentage: number;
  status: 'safe' | 'warning' | 'critical';
} {
  let totalAttended = 0;
  let totalHeld = 0;

  subjects.forEach((subj) => {
    if (subj.attendanceTotal && subj.attendanceTotal > 0) {
      totalHeld += subj.attendanceTotal;
      totalAttended += subj.attendanceAttended || 0;
    }
  });

  const overallPercentage = calculateAttendancePercentage(totalAttended, totalHeld);
  const status =
    overallPercentage >= 80 ? 'safe' : overallPercentage >= 75 ? 'warning' : 'critical';

  return {
    totalAttended,
    totalHeld,
    overallPercentage,
    status,
  };
}
