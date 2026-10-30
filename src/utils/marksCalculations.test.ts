import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePercentage,
  calculateGrade,
  calculateMarksSummary,
  calculateTargetNeeded,
} from './marksCalculations';
import { TestMark } from '../types';

test('calculatePercentage handles regular and edge cases', () => {
  assert.equal(calculatePercentage(45, 50), 90);
  assert.equal(calculatePercentage(23, 25), 92);
  assert.equal(calculatePercentage(0, 50), 0);
  assert.equal(calculatePercentage(50, 0), 0);
  assert.equal(calculatePercentage(33.333, 100), 33.3);
});

test('calculateGrade assigns correct grade letters, colors, and gpa', () => {
  assert.equal(calculateGrade(95).letter, 'A+');
  assert.equal(calculateGrade(95).gpa, 4.0);

  assert.equal(calculateGrade(82).letter, 'A');
  assert.equal(calculateGrade(82).gpa, 3.7);

  assert.equal(calculateGrade(74).letter, 'B+');
  assert.equal(calculateGrade(65).letter, 'B');
  assert.equal(calculateGrade(55).letter, 'C');
  assert.equal(calculateGrade(42).letter, 'D');
  assert.equal(calculateGrade(35).letter, 'F');
});

test('calculateMarksSummary calculates cumulative and weighted statistics', () => {
  const dummyMarks: TestMark[] = [
    {
      id: 'm1',
      subjectId: 'sub1',
      testName: 'Midterm 1',
      testType: 'midterm',
      date: '2026-03-01',
      marksObtained: 40,
      maxMarks: 50, // 80%
      percentage: 80,
      weightage: 20,
    },
    {
      id: 'm2',
      subjectId: 'sub1',
      testName: 'Quiz 1',
      testType: 'quiz',
      date: '2026-03-15',
      marksObtained: 20,
      maxMarks: 20, // 100%
      percentage: 100,
      weightage: 10,
    },
  ];

  const summary = calculateMarksSummary(dummyMarks);
  assert.equal(summary.totalTests, 2);
  assert.equal(summary.totalMarksObtained, 60);
  assert.equal(summary.totalMaxMarks, 70);
  assert.equal(summary.averagePercentage, 90); // (80 + 100) / 2
  // Weighted: (80*0.20 + 100*0.10) / (0.30) = (16 + 10)/0.30 = 26/0.30 = 86.66% -> 86.7%
  assert.equal(summary.weightedAveragePercentage, 86.7);
  assert.equal(summary.totalWeightageEvaluated, 30);
  assert.equal(summary.highestMark?.id, 'm2');
  assert.equal(summary.lowestMark?.id, 'm1');
});

test('calculateTargetNeeded accurately calculates remaining exam target', () => {
  const existingMarks: TestMark[] = [
    {
      id: 'm1',
      subjectId: 'sub1',
      testName: 'Midterm',
      testType: 'midterm',
      date: '2026-03-01',
      marksObtained: 40,
      maxMarks: 50, // 80%
      percentage: 80,
      weightage: 40, // contributes 32%
    },
  ];

  // Desired total: 85%
  // Remaining weight: 60%
  // Need: (85 - 32) / 0.60 = 53 / 0.6 = 88.33% -> 88.3%
  const res = calculateTargetNeeded(existingMarks, 85, 60);
  assert.equal(res.requiredPercentage, 88.3);
  assert.equal(res.achievable, true);

  // Impossible target
  const impossible = calculateTargetNeeded(existingMarks, 95, 20); // current contributes 32%, needs 63% from 20% -> >300%
  assert.equal(impossible.achievable, false);
});
