import { ClassEvent } from '../types';

/**
 * Maps day of week (0=Sunday, 1=Monday, ..., 6=Saturday) to iCalendar standard day code
 */
function getDayCode(day: number | string): string {
  if (typeof day === 'number') {
    switch (day) {
      case 1:
        return 'MO';
      case 2:
        return 'TU';
      case 3:
        return 'WE';
      case 4:
        return 'TH';
      case 5:
        return 'FR';
      case 6:
        return 'SA';
      case 0:
        return 'SU';
      default:
        return 'MO';
    }
  }

  switch (String(day).toLowerCase()) {
    case 'monday':
    case 'mon':
      return 'MO';
    case 'tuesday':
    case 'tue':
      return 'TU';
    case 'wednesday':
    case 'wed':
      return 'WE';
    case 'thursday':
    case 'thu':
      return 'TH';
    case 'friday':
    case 'fri':
      return 'FR';
    case 'saturday':
    case 'sat':
      return 'SA';
    case 'sunday':
    case 'sun':
      return 'SU';
    default:
      return 'MO';
  }
}

/**
 * Formats time string (HH:mm) into iCalendar recurring event format
 */
export function formatIcsTime(timeStr: string): string {
  const [hours, minutes] = (timeStr || '09:00').split(':').map((s) => s.padStart(2, '0'));
  return `${hours || '09'}${minutes || '00'}00`;
}

/**
 * Generates standard RFC 5545 .ics calendar content for student timetable classes.
 * Compatible with Google Calendar, Apple Calendar, Outlook, and mobile calendar apps.
 */
export function generateTimetableIcs(
  classes: ClassEvent[],
  semesterName: string = 'Current Semester',
  startDateIso: string = new Date().toISOString().split('T')[0]
): string {
  const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const startYear = startDateIso.replace(/-/g, '');

  const events = classes
    .filter((c) => !c.isCancelled)
    .map((cls) => {
      const dayCode = getDayCode(cls.dayOfWeek);
      const startTime = formatIcsTime(cls.startTime);
      const endTime = formatIcsTime(cls.endTime);
      const uid = `studious-class-${cls.id}@studious.app`;

      const summary = cls.title || 'Class';
      const location = cls.room || 'Classroom';
      const description = [
        cls.faculty ? `Professor: ${cls.faculty}` : '',
        cls.notes ? `Notes: ${cls.notes}` : '',
        `Semester: ${semesterName}`,
      ]
        .filter(Boolean)
        .join('\\n');

      return [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtStamp}`,
        `DTSTART;TZID=UTC:${startYear}T${startTime}`,
        `DTEND;TZID=UTC:${startYear}T${endTime}`,
        `RRULE:FREQ=WEEKLY;BYDAY=${dayCode}`,
        `SUMMARY:${summary}`,
        `LOCATION:${location}`,
        `DESCRIPTION:${description}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
      ].join('\r\n');
    })
    .join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Studious Academic SaaS//Timetable Calendar 2.0//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Studious Timetable - ${semesterName}`,
    'X-WR-TIMEZONE:UTC',
    events,
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Triggers a browser download of the generated .ics file
 */
export function downloadCalendarIcs(
  classes: ClassEvent[],
  semesterName: string = 'Semester 5'
): void {
  const icsData = generateTimetableIcs(classes, semesterName);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Studious_Timetable_${semesterName.replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
