import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateTimetableIcs, formatIcsTime } from './calendarExport';
import { ClassEvent } from '../types';

test('formatIcsTime correctly pads hours and minutes', () => {
  assert.equal(formatIcsTime('09:30'), '093000');
  assert.equal(formatIcsTime('14:05'), '140500');
  assert.equal(formatIcsTime('8:00'), '080000');
});

test('generateTimetableIcs produces valid RFC 5545 calendar data', () => {
  const sampleClasses: ClassEvent[] = [
    {
      id: 'cls-1',
      subjectId: 'sub-1',
      title: 'Operating Systems',
      dayOfWeek: 1, // Monday
      startTime: '09:00',
      endTime: '10:00',
      room: 'LH-101',
      faculty: 'Dr. Alan Turing',
    },
    {
      id: 'cls-2',
      subjectId: 'sub-2',
      title: 'Database Management',
      dayOfWeek: 3, // Wednesday
      startTime: '11:15',
      endTime: '12:45',
      room: 'CS-Lab-3',
      faculty: 'Prof. Edgar Codd',
    },
  ];

  const icsOutput = generateTimetableIcs(sampleClasses, 'Semester 5', '2026-10-30');

  assert.ok(icsOutput.includes('BEGIN:VCALENDAR'));
  assert.ok(icsOutput.includes('VERSION:2.0'));
  assert.ok(icsOutput.includes('PRODID:-//Studious Academic SaaS//Timetable Calendar 2.0//EN'));
  assert.ok(icsOutput.includes('BEGIN:VEVENT'));
  assert.ok(icsOutput.includes('SUMMARY:Operating Systems'));
  assert.ok(icsOutput.includes('LOCATION:LH-101'));
  assert.ok(icsOutput.includes('RRULE:FREQ=WEEKLY;BYDAY=MO'));
  assert.ok(icsOutput.includes('SUMMARY:Database Management'));
  assert.ok(icsOutput.includes('LOCATION:CS-Lab-3'));
  assert.ok(icsOutput.includes('RRULE:FREQ=WEEKLY;BYDAY=WE'));
  assert.ok(icsOutput.includes('END:VCALENDAR'));
});
