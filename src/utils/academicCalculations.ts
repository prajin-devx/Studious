/**
 * Pure deterministic academic calculation functions for Studious.
 * Decoupled from React and DOM for reliable unit testing.
 */

export interface TopicItem {
  id: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'needs_revision';
  subjectId: string;
  chapterId: string;
}

export interface SubjectItem {
  id: string;
  name: string;
  isArchived?: boolean;
}

export interface ClassScheduleItem {
  id: string;
  subjectId: string;
  title: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime: string; // "HH:MM" 24h
  endTime: string;   // "HH:MM" 24h
  room?: string;
  faculty?: string;
  isCancelled?: boolean;
}

export interface AssignmentItem {
  id: string;
  dueDate: string; // "YYYY-MM-DD"
  dueTime?: string; // "HH:MM"
  status: 'not_started' | 'in_progress' | 'completed' | 'submitted';
}

export interface ExamItem {
  id: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  subjectId: string;
}

export interface ProjectTaskItem {
  id: string;
  projectId: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface ProjectMilestoneItem {
  id: string;
  isCompleted?: boolean;
}

/**
 * Calculates completion percentage for a given chapter's topics.
 * Returns 0 if there are no topics.
 */
export function calculateChapterProgress(topics: TopicItem[], chapterId: string): {
  total: number;
  completed: number;
  percentage: number;
} {
  const chapterTopics = topics.filter(t => t.chapterId === chapterId);
  const total = chapterTopics.length;
  if (total === 0) {
    return { total: 0, completed: 0, percentage: 0 };
  }
  const completed = chapterTopics.filter(t => t.status === 'completed').length;
  const percentage = Math.round((completed / total) * 100);
  return { total, completed, percentage };
}

/**
 * Calculates completion percentage for a subject.
 * Completed topics divided by total applicable topics.
 */
export function calculateSubjectProgress(topics: TopicItem[], subjectId: string): {
  total: number;
  completed: number;
  inProgress: number;
  needsRevision: number;
  percentage: number;
} {
  const subjectTopics = topics.filter(t => t.subjectId === subjectId);
  const total = subjectTopics.length;
  if (total === 0) {
    return { total: 0, completed: 0, inProgress: 0, needsRevision: 0, percentage: 0 };
  }
  const completed = subjectTopics.filter(t => t.status === 'completed').length;
  const inProgress = subjectTopics.filter(t => t.status === 'in_progress').length;
  const needsRevision = subjectTopics.filter(t => t.status === 'needs_revision').length;
  const percentage = Math.round((completed / total) * 100);
  return { total, completed, inProgress, needsRevision, percentage };
}

/**
 * Calculates overall syllabus completion across all active (non-archived) subjects.
 */
export function calculateOverallSyllabusProgress(
  subjects: SubjectItem[],
  topics: TopicItem[]
): {
  totalTopics: number;
  completedTopics: number;
  percentage: number;
} {
  const activeSubjectIds = new Set(subjects.filter(s => !s.isArchived).map(s => s.id));
  const activeTopics = topics.filter(t => activeSubjectIds.has(t.subjectId));
  const totalTopics = activeTopics.length;
  if (totalTopics === 0) {
    return { totalTopics: 0, completedTopics: 0, percentage: 0 };
  }
  const completedTopics = activeTopics.filter(t => t.status === 'completed').length;
  const percentage = Math.round((completedTopics / totalTopics) * 100);
  return { totalTopics, completedTopics, percentage };
}

/**
 * Converts "HH:MM" string to minutes from start of day.
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  return h * 60 + m;
}

/**
 * Detects whether two class schedule items conflict (same day and overlapping time).
 */
export function doClassesOverlap(a: ClassScheduleItem, b: ClassScheduleItem): boolean {
  if (a.id === b.id) return false;
  if (a.dayOfWeek !== b.dayOfWeek) return false;
  if (a.isCancelled || b.isCancelled) return false;

  const aStart = timeStringToMinutes(a.startTime);
  const aEnd = timeStringToMinutes(a.endTime);
  const bStart = timeStringToMinutes(b.startTime);
  const bEnd = timeStringToMinutes(b.endTime);

  // Overlap condition: max(start) < min(end)
  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
}

/**
 * Detects all conflicting class pairs in a timetable.
 */
export function findTimetableConflicts(classes: ClassScheduleItem[]): Array<[ClassScheduleItem, ClassScheduleItem]> {
  const conflicts: Array<[ClassScheduleItem, ClassScheduleItem]> = [];
  for (let i = 0; i < classes.length; i++) {
    for (let j = i + 1; j < classes.length; j++) {
      if (doClassesOverlap(classes[i], classes[j])) {
        conflicts.push([classes[i], classes[j]]);
      }
    }
  }
  return conflicts;
}

/**
 * Calculates days remaining from reference date to target date.
 * Returns negative if target date is in the past.
 */
export function calculateDaysRemaining(targetDateStr: string, fromDate: Date = new Date()): number {
  const [y, m, d] = targetDateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d, 0, 0, 0);
  const ref = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 0, 0, 0);
  const diffMs = target.getTime() - ref.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculates project task progress percentage.
 */
export function calculateProjectProgress(tasks: ProjectTaskItem[]): {
  total: number;
  completed: number;
  percentage: number;
} {
  const total = tasks.length;
  if (total === 0) return { total: 0, completed: 0, percentage: 0 };
  const completed = tasks.filter(t => t.status === 'completed').length;
  return { total, completed, percentage: Math.round((completed / total) * 100) };
}

/**
 * Formats 24h "HH:MM" into readable 12h format (e.g., "09:00" -> "9:00 AM", "14:30" -> "2:30 PM").
 */
export function formatTime12h(timeStr: string): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10) || 0;
  const m = mStr ? mStr.padStart(2, '0') : '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}
