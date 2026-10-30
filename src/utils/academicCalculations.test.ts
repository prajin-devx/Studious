import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateChapterProgress,
  calculateSubjectProgress,
  calculateOverallSyllabusProgress,
  timeStringToMinutes,
  doClassesOverlap,
  findTimetableConflicts,
  calculateDaysRemaining,
  calculateProjectProgress,
  formatTime12h,
  TopicItem,
  SubjectItem,
  ClassScheduleItem,
  ProjectTaskItem,
} from './academicCalculations';

test('calculateChapterProgress calculates correct percentage and edge cases', () => {
  const empty: TopicItem[] = [];
  assert.deepEqual(calculateChapterProgress(empty, 'ch1'), {
    total: 0,
    completed: 0,
    percentage: 0,
  });

  const topics: TopicItem[] = [
    { id: '1', status: 'completed', subjectId: 's1', chapterId: 'ch1' },
    { id: '2', status: 'in_progress', subjectId: 's1', chapterId: 'ch1' },
    { id: '3', status: 'not_started', subjectId: 's1', chapterId: 'ch1' },
    { id: '4', status: 'completed', subjectId: 's1', chapterId: 'ch2' },
  ];

  const resCh1 = calculateChapterProgress(topics, 'ch1');
  assert.equal(resCh1.total, 3);
  assert.equal(resCh1.completed, 1);
  assert.equal(resCh1.percentage, 33);
});

test('calculateSubjectProgress breaks down topic counts properly', () => {
  const topics: TopicItem[] = [
    { id: '1', status: 'completed', subjectId: 's1', chapterId: 'ch1' },
    { id: '2', status: 'completed', subjectId: 's1', chapterId: 'ch1' },
    { id: '3', status: 'in_progress', subjectId: 's1', chapterId: 'ch2' },
    { id: '4', status: 'needs_revision', subjectId: 's1', chapterId: 'ch2' },
    { id: '5', status: 'not_started', subjectId: 's1', chapterId: 'ch2' },
  ];

  const res = calculateSubjectProgress(topics, 's1');
  assert.equal(res.total, 5);
  assert.equal(res.completed, 2);
  assert.equal(res.inProgress, 1);
  assert.equal(res.needsRevision, 1);
  assert.equal(res.percentage, 40);
});

test('calculateOverallSyllabusProgress excludes archived subjects', () => {
  const subjects: SubjectItem[] = [
    { id: 's1', name: 'Operating Systems', isArchived: false },
    { id: 's2', name: 'Old Subject', isArchived: true },
  ];
  const topics: TopicItem[] = [
    { id: '1', status: 'completed', subjectId: 's1', chapterId: 'c1' },
    { id: '2', status: 'not_started', subjectId: 's1', chapterId: 'c1' },
    { id: '3', status: 'completed', subjectId: 's2', chapterId: 'c2' }, // should be ignored
  ];

  const res = calculateOverallSyllabusProgress(subjects, topics);
  assert.equal(res.totalTopics, 2);
  assert.equal(res.completedTopics, 1);
  assert.equal(res.percentage, 50);
});

test('timeStringToMinutes parses properly', () => {
  assert.equal(timeStringToMinutes('09:30'), 570);
  assert.equal(timeStringToMinutes('00:00'), 0);
  assert.equal(timeStringToMinutes('23:59'), 1439);
});

test('doClassesOverlap detects timing conflicts', () => {
  const classA: ClassScheduleItem = {
    id: 'a',
    subjectId: 's1',
    title: 'Algorithms',
    dayOfWeek: 1, // Mon
    startTime: '09:00',
    endTime: '10:30',
  };

  const classB: ClassScheduleItem = {
    id: 'b',
    subjectId: 's2',
    title: 'Computer Networks',
    dayOfWeek: 1, // Mon
    startTime: '10:00',
    endTime: '11:30',
  };

  const classC: ClassScheduleItem = {
    id: 'c',
    subjectId: 's3',
    title: 'Databases',
    dayOfWeek: 1, // Mon
    startTime: '11:30',
    endTime: '13:00',
  };

  const classD_Tuesday: ClassScheduleItem = {
    id: 'd',
    subjectId: 's4',
    title: 'Web Dev',
    dayOfWeek: 2, // Tue
    startTime: '09:00',
    endTime: '10:30',
  };

  // classA (09:00-10:30) and classB (10:00-11:30) overlap
  assert.equal(doClassesOverlap(classA, classB), true);
  // classB (10:00-11:30) and classC (11:30-13:00) meet at boundary, no overlap
  assert.equal(doClassesOverlap(classB, classC), false);
  // Different days never overlap
  assert.equal(doClassesOverlap(classA, classD_Tuesday), false);

  const conflicts = findTimetableConflicts([classA, classB, classC]);
  // Only classA and classB conflict
  assert.equal(conflicts.length, 1);
});

test('calculateProjectProgress computes completion rate accurately', () => {
  const tasks: ProjectTaskItem[] = [
    { id: '1', projectId: 'p1', status: 'completed' },
    { id: '2', projectId: 'p1', status: 'completed' },
    { id: '3', projectId: 'p1', status: 'in_progress' },
    { id: '4', projectId: 'p1', status: 'not_started' },
  ];
  assert.deepEqual(calculateProjectProgress(tasks), {
    total: 4,
    completed: 2,
    percentage: 50,
  });
});

test('formatTime12h converts time correctly', () => {
  assert.equal(formatTime12h('09:05'), '9:05 AM');
  assert.equal(formatTime12h('12:00'), '12:00 PM');
  assert.equal(formatTime12h('14:30'), '2:30 PM');
  assert.equal(formatTime12h('00:15'), '12:15 AM');
});
