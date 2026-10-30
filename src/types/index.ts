export type TopicStatus = 'not_started' | 'in_progress' | 'completed' | 'needs_revision';
export type AssignmentStatus = 'not_started' | 'in_progress' | 'completed' | 'submitted';
export type AssignmentPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectStatus = 'planned' | 'in_progress' | 'on_hold' | 'completed' | 'archived';
export type ProjectTaskStatus = 'not_started' | 'in_progress' | 'completed';

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  institution?: string;
  degree?: string;
  semester?: string;
  academicTerm?: string;
  timeZone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subject {
  id: string;
  userId?: string;
  name: string;
  code?: string;
  semester?: string;
  instructor?: string;
  color: string;
  credits?: number;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Chapter {
  id: string;
  userId?: string;
  subjectId: string;
  unitNumber?: string;
  title: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Topic {
  id: string;
  userId?: string;
  subjectId: string;
  chapterId: string;
  title: string;
  status: TopicStatus;
  estimatedMinutes?: number;
  notes?: string;
  lastStudiedAt?: string;
  revisionCount?: number;
  nextRevisionDate?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassEvent {
  id: string;
  userId?: string;
  subjectId: string;
  title: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime: string; // "HH:MM" 24h
  endTime: string;   // "HH:MM" 24h
  room?: string;
  faculty?: string;
  recurrence?: 'weekly' | 'biweekly_a' | 'biweekly_b' | 'once';
  color?: string;
  notes?: string;
  isCancelled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssignmentSubtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Assignment {
  id: string;
  userId?: string;
  subjectId: string;
  title: string;
  type: string; // 'Homework' | 'Written assignment' | 'Laboratory work' | 'Report' | 'Presentation' | 'Quiz'
  description?: string;
  assignedDate?: string;
  dueDate: string; // "YYYY-MM-DD"
  dueTime?: string; // "HH:MM"
  priority: AssignmentPriority;
  status: AssignmentStatus;
  submissionUrl?: string;
  linkedTopicIds?: string[];
  subtasks?: AssignmentSubtask[];
  completedAt?: string;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectMember {
  id: string;
  name: string;
  role: string; // 'Team Leader' | 'Research Lead' | 'Hardware Lead' | 'Software Lead' | 'Documentation Lead' | 'Testing Lead' | 'Presentation Lead' | 'Member'
  email?: string;
  notes?: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  dueDate: string;
  isCompleted: boolean;
  notes?: string;
}

export interface ProjectTask {
  id: string;
  userId?: string;
  projectId: string;
  title: string;
  description?: string;
  assignedMemberId?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  status: ProjectTaskStatus;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  userId?: string;
  subjectId?: string;
  title: string;
  description?: string;
  projectType: string;
  startDate?: string;
  deadline: string;
  status: ProjectStatus;
  projectUrl?: string;
  members: ProjectMember[];
  milestones: ProjectMilestone[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Exam {
  id: string;
  userId?: string;
  subjectId: string;
  title: string;
  courseCode?: string;
  examType: string; // 'Internal' | 'Semester' | 'Practical' | 'Viva' | 'Midterm'
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endTime?: string; // "HH:MM"
  center?: string;
  room?: string;
  reportingTime?: string;
  instructions?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudyTask {
  id: string;
  userId?: string;
  subjectId?: string;
  linkedTopicId?: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  startTime?: string;
  durationMinutes?: number;
  status: 'pending' | 'completed';
  notes?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  category: 'class' | 'exam' | 'assignment' | 'revision' | 'system';
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export type TestType = 'internal' | 'midterm' | 'quiz' | 'assignment' | 'lab' | 'final' | 'other';

export interface TestMark {
  id: string;
  userId?: string;
  subjectId: string;
  testName: string;
  testType: TestType;
  date: string;
  marksObtained: number;
  maxMarks: number;
  percentage?: number;
  weightage?: number;
  targetMarks?: number;
  grade?: string;
  topicsCovered?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSettings {
  userId?: string;
  theme: 'dark' | 'light';
  weekStart: number; // 0=Sunday, 1=Monday
  quietHoursStart?: string;
  quietHoursEnd?: string;
  classReminders: boolean;
  assignmentReminders: boolean;
  examReminders: boolean;
  classReminderAdvanceMinutes?: number;
  assignmentReminderAdvanceHours?: number;
  examReminderAdvanceHours?: number;
  deviceNotificationsEnabled?: boolean;
  soundEnabled?: boolean;
  fontSize?: 'normal' | 'large' | 'extra-large' | 'huge';
  updatedAt?: string;
}
