import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAttendancePercentage,
  calculateBunkMargin,
  calculateOverallAttendance,
} from './attendanceCalculations';

test('calculateAttendancePercentage handles normal, zero, and boundary cases', () => {
  assert.equal(calculateAttendancePercentage(18, 20), 90);
  assert.equal(calculateAttendancePercentage(0, 20), 0);
  assert.equal(calculateAttendancePercentage(0, 0), 100);
  assert.equal(calculateAttendancePercentage(25, 25), 100);
  assert.equal(calculateAttendancePercentage(22, 29), 75.9);
});

test('calculateBunkMargin accurately computes safe bunks available', () => {
  // 30 attended out of 30 held with 75% target.
  // 30 / (30 + b) >= 0.75 -> 30 >= 22.5 + 0.75b -> 7.5 >= 0.75b -> b <= 10
  const result = calculateBunkMargin(30, 30, 75);
  assert.equal(result.currentPercentage, 100);
  assert.equal(result.safeBunksAvailable, 10);
  assert.equal(result.classesNeededToRecover, 0);
  assert.equal(result.status, 'safe');

  // If attended 20 out of 25 = 80%. Target 75%.
  // (20 - 0.75 * 25) / 0.75 = (20 - 18.75) / 0.75 = 1.25 / 0.75 = 1.66 -> floor = 1 safe bunk
  const result2 = calculateBunkMargin(20, 25, 75);
  assert.equal(result2.currentPercentage, 80);
  assert.equal(result2.safeBunksAvailable, 1);
  assert.equal(result2.classesNeededToRecover, 0);
  assert.equal(result2.status, 'warning'); // 1 safe bunk is warning
});

test('calculateBunkMargin accurately computes recovery classes needed when below target', () => {
  // Attended 14 out of 20 = 70%. Target 75%.
  // Deficit: 0.75 * 20 - 14 = 15 - 14 = 1.
  // Classes needed: ceil(1 / (1 - 0.75)) = ceil(1 / 0.25) = 4 classes
  // Check: (14 + 4) / (20 + 4) = 18 / 24 = 75% exactly!
  const result = calculateBunkMargin(14, 20, 75);
  assert.equal(result.currentPercentage, 70);
  assert.equal(result.safeBunksAvailable, 0);
  assert.equal(result.classesNeededToRecover, 4);
  assert.equal(result.status, 'critical');
});

test('calculateOverallAttendance computes aggregate percentages across subjects', () => {
  const subjects = [
    { attendanceAttended: 24, attendanceTotal: 28 }, // 85.7%
    { attendanceAttended: 18, attendanceTotal: 25 }, // 72.0%
    { attendanceAttended: 30, attendanceTotal: 32 }, // 93.8%
  ];

  // Total attended: 24 + 18 + 30 = 72
  // Total held: 28 + 25 + 32 = 85
  // Percentage: 72 / 85 = 84.7%
  const summary = calculateOverallAttendance(subjects);
  assert.equal(summary.totalAttended, 72);
  assert.equal(summary.totalHeld, 85);
  assert.equal(summary.overallPercentage, 84.7);
  assert.equal(summary.status, 'safe');
});
