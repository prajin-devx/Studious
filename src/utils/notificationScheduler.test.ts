import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isQuietHours,
  shouldTriggerClassReminder,
  shouldTriggerDeadlineReminder,
  shouldTriggerExamReminder,
} from './notificationScheduler';
import { ClassEvent, Assignment, Exam } from '../types';

test('isQuietHours detects overnight and daytime quiet periods correctly', () => {
  // 22:00 (1320 mins) to 07:00 (420 mins)
  assert.equal(isQuietHours(1350, '22:00', '07:00'), true); // 22:30 -> quiet
  assert.equal(isQuietHours(300, '22:00', '07:00'), true);  // 05:00 -> quiet
  assert.equal(isQuietHours(600, '22:00', '07:00'), false); // 10:00 -> active

  // Normal day: 13:00 (780) to 15:00 (900)
  assert.equal(isQuietHours(800, '13:00', '15:00'), true);  // 13:20 -> quiet
  assert.equal(isQuietHours(1000, '13:00', '15:00'), false); // 16:40 -> active
});

test('shouldTriggerClassReminder triggers when class is within advance window', () => {
  const cls: ClassEvent = {
    id: 'cls-1',
    subjectId: 'sub-1',
    title: 'Operating Systems',
    dayOfWeek: 1, // Mon
    startTime: '10:00', // 600 mins
    endTime: '11:30',
    room: 'Hall 402',
  };

  // Current time: Mon 09:48 (588 mins) -> 12 minutes before class
  const reminder = shouldTriggerClassReminder(cls, 1, 588, 15, new Set());
  assert.notEqual(reminder, null);
  assert.equal(reminder?.title, 'Upcoming Class: Operating Systems');
  assert.match(reminder?.message || '', /12 mins/);

  // If already notified: returns null
  const notified = new Set([reminder!.id]);
  assert.equal(shouldTriggerClassReminder(cls, 1, 588, 15, notified), null);

  // If different day: returns null
  assert.equal(shouldTriggerClassReminder(cls, 2, 588, 15, new Set()), null);

  // If class is too far ahead (e.g. 45 mins before when window is 15): returns null
  assert.equal(shouldTriggerClassReminder(cls, 1, 550, 15, new Set()), null);
});

test('shouldTriggerDeadlineReminder triggers for approaching uncompleted assignments', () => {
  const asg: Assignment = {
    id: 'asg-1',
    subjectId: 'sub-1',
    title: 'Lab Report 2',
    type: 'Report',
    dueDate: '2026-10-30',
    dueTime: '18:00',
    priority: 'high',
    status: 'in_progress',
  };

  // Reference now: 2026-10-30 at 14:00 (4 hours before due)
  const now = new Date('2026-10-30T14:00:00');
  const reminder = shouldTriggerDeadlineReminder(asg, now, 24, new Set());
  assert.notEqual(reminder, null);
  assert.equal(reminder?.title, 'Deadline Approaching: Lab Report 2');
  assert.match(reminder?.message || '', /Due in 4 hours/);

  // If completed: returns null
  const completedAsg: Assignment = { ...asg, status: 'completed' };
  assert.equal(shouldTriggerDeadlineReminder(completedAsg, now, 24, new Set()), null);
});

test('shouldTriggerExamReminder triggers when exam is within window', () => {
  const exam: Exam = {
    id: 'exam-1',
    subjectId: 'sub-1',
    title: 'Midterm Theory Exam',
    examType: 'Midterm',
    date: '2026-11-02',
    startTime: '09:30',
    room: 'Hall B',
  };

  // Now is 2026-11-01 at 09:30 (exactly 24 hours before)
  const now = new Date('2026-11-01T09:30:00');
  const reminder = shouldTriggerExamReminder(exam, now, 48, new Set());
  assert.notEqual(reminder, null);
  assert.equal(reminder?.title, 'Upcoming Exam: Midterm Theory Exam');
  assert.match(reminder?.message || '', /1 day/);

  // If already notified: returns null
  const notified = new Set([reminder!.id]);
  assert.equal(shouldTriggerExamReminder(exam, now, 48, notified), null);
});

