import { ClassEvent, Assignment, Exam } from '../types';
import { timeStringToMinutes } from './academicCalculations';

export interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  category: 'class' | 'assignment' | 'exam' | 'revision' | 'system';
  linkUrl?: string;
}

/**
 * Checks if current time is within user-configured quiet hours.
 * Handles overnight spans (e.g. 22:00 to 07:00).
 */
export function isQuietHours(
  currentMinutes: number,
  quietStartStr: string = '22:00',
  quietEndStr: string = '07:00'
): boolean {
  const start = timeStringToMinutes(quietStartStr);
  const end = timeStringToMinutes(quietEndStr);

  if (start <= end) {
    // Normal day range (e.g., 13:00 to 15:00)
    return currentMinutes >= start && currentMinutes <= end;
  } else {
    // Overnight range (e.g., 22:00 to 07:00)
    return currentMinutes >= start || currentMinutes <= end;
  }
}

/**
 * Evaluates whether a class lecture is within the advance reminder window.
 * e.g., if class starts at 10:00 (600 mins), current time is 09:45 (585 mins),
 * and advanceNoticeMinutes is 15 -> triggers reminder!
 */
export function shouldTriggerClassReminder(
  cls: ClassEvent,
  currentDayOfWeek: number,
  currentMinutes: number,
  advanceNoticeMinutes: number = 15,
  notifiedIds: Set<string> = new Set()
): NotificationPayload | null {
  if (cls.isCancelled) return null;
  if (cls.dayOfWeek !== currentDayOfWeek) return null;

  const reminderKey = `class-${cls.id}-${cls.startTime}`;
  if (notifiedIds.has(reminderKey)) return null;

  const classStartMinutes = timeStringToMinutes(cls.startTime);
  const minutesUntilClass = classStartMinutes - currentMinutes;

  // Trigger if class starts within advanceNoticeMinutes and hasn't already started
  if (minutesUntilClass > 0 && minutesUntilClass <= advanceNoticeMinutes) {
    return {
      id: reminderKey,
      title: `Upcoming Class: ${cls.title}`,
      message: `Starts in ${minutesUntilClass} min${minutesUntilClass === 1 ? '' : 's'} at ${cls.startTime}${
        cls.room ? ` in ${cls.room}` : ''
      }.`,
      category: 'class',
      linkUrl: 'timetable',
    };
  }

  return null;
}

/**
 * Evaluates whether an assignment deadline is approaching.
 * e.g., assignment due within advanceHours and not completed.
 */
export function shouldTriggerDeadlineReminder(
  asg: Assignment,
  now: Date,
  advanceHours: number = 24,
  notifiedIds: Set<string> = new Set()
): NotificationPayload | null {
  if (asg.status === 'completed' || asg.status === 'submitted') return null;

  const reminderKey = `asg-${asg.id}-${asg.dueDate}`;
  if (notifiedIds.has(reminderKey)) return null;

  const [y, m, d] = asg.dueDate.split('-').map(Number);
  const dueTimeParts = (asg.dueTime || '23:59').split(':').map(Number);
  const dueDateTime = new Date(y, m - 1, d, dueTimeParts[0], dueTimeParts[1]);

  const diffMs = dueDateTime.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // If due within advanceHours and in the future
  if (diffHours > 0 && diffHours <= advanceHours) {
    const formattedHours = Math.round(diffHours);
    return {
      id: reminderKey,
      title: `Deadline Approaching: ${asg.title}`,
      message: `Due in ${formattedHours} hour${formattedHours === 1 ? '' : 's'} (${asg.dueDate}${
        asg.dueTime ? ` at ${asg.dueTime}` : ''
      }). Priority: ${asg.priority}.`,
      category: 'assignment',
      linkUrl: 'assignments',
    };
  }

  return null;
}

/**
 * Evaluates whether an upcoming examination is within the advance reminder window.
 * e.g., exam scheduled within advanceHours.
 */
export function shouldTriggerExamReminder(
  exam: Exam,
  now: Date,
  advanceHours: number = 48,
  notifiedIds: Set<string> = new Set()
): NotificationPayload | null {
  const reminderKey = `exam-${exam.id}-${exam.date}`;
  if (notifiedIds.has(reminderKey)) return null;

  const [y, m, d] = exam.date.split('-').map(Number);
  const timeParts = (exam.startTime || '09:00').split(':').map(Number);
  const examDateTime = new Date(y, m - 1, d, timeParts[0], timeParts[1]);

  const diffMs = examDateTime.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // If within advanceHours and in the future
  if (diffHours > 0 && diffHours <= advanceHours) {
    const formattedHours = Math.round(diffHours);
    const days = Math.floor(formattedHours / 24);
    const remainingHours = formattedHours % 24;
    const timeDisplay =
      days > 0
        ? `${days} day${days === 1 ? '' : 's'}${remainingHours > 0 ? ` ${remainingHours}h` : ''}`
        : `${formattedHours} hour${formattedHours === 1 ? '' : 's'}`;

    return {
      id: reminderKey,
      title: `Upcoming Exam: ${exam.title}`,
      message: `Exam scheduled in ${timeDisplay} (${exam.date} at ${exam.startTime}${
        exam.room ? `, ${exam.room}` : ''
      }). Have your materials ready!`,
      category: 'exam',
      linkUrl: 'exams',
    };
  }

  return null;
}

