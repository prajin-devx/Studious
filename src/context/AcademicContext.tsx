import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import {
  Subject,
  Chapter,
  Topic,
  TopicStatus,
  ClassEvent,
  Assignment,
  AssignmentStatus,
  Project,
  ProjectTask,
  ProjectTaskStatus,
  Exam,
  StudyTask,
  NotificationItem,
  TestMark,
  UserSettings,
  UserProfile,
} from '../types';
import {
  SAMPLE_SUBJECTS,
  SAMPLE_CHAPTERS,
  SAMPLE_TOPICS,
  SAMPLE_CLASSES,
  SAMPLE_ASSIGNMENTS,
  SAMPLE_PROJECTS,
  SAMPLE_PROJECT_TASKS,
  SAMPLE_EXAMS,
  SAMPLE_STUDY_TASKS,
  SAMPLE_NOTIFICATIONS,
  SAMPLE_TEST_MARKS,
} from '../data/sampleAcademicData';
import { playNotificationChime } from '../utils/audioChime';
import {
  isQuietHours,
  shouldTriggerClassReminder,
  shouldTriggerDeadlineReminder,
  shouldTriggerExamReminder,
} from '../utils/notificationScheduler';

interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
}

interface AcademicContextType {
  user: User | null;
  authLoading: boolean;
  isCloudSyncing: boolean;
  isGuestMode: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;

  subjects: Subject[];
  chapters: Chapter[];
  topics: Topic[];
  classes: ClassEvent[];
  assignments: Assignment[];
  projects: Project[];
  projectTasks: ProjectTask[];
  exams: Exam[];
  testMarks: TestMark[];
  studyTasks: StudyTask[];
  notifications: NotificationItem[];
  settings: UserSettings;
  profile: UserProfile;

  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Subjects
  addSubject: (subj: Omit<Subject, 'id'>) => Promise<string>;
  updateSubject: (id: string, updates: Partial<Subject>) => Promise<void>;
  updateSubjectAttendance: (id: string, attended: number, total: number, minReq?: number) => Promise<void>;
  quickMarkAttendance: (id: string, present: boolean) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  archiveSubject: (id: string, isArchived: boolean) => Promise<void>;

  // Chapters & Topics
  addChapter: (chap: Omit<Chapter, 'id'>) => Promise<string>;
  updateChapter: (id: string, updates: Partial<Chapter>) => Promise<void>;
  deleteChapter: (id: string) => Promise<void>;
  addTopic: (top: Omit<Topic, 'id'>) => Promise<string>;
  updateTopic: (id: string, updates: Partial<Topic>) => Promise<void>;
  setTopicStatus: (id: string, status: TopicStatus) => Promise<void>;
  bulkAddTopics: (chapterId: string, subjectId: string, topicTitles: string[]) => Promise<void>;
  deleteTopic: (id: string) => Promise<void>;

  // Timetable
  addClassEvent: (evt: Omit<ClassEvent, 'id'>) => Promise<string>;
  updateClassEvent: (id: string, updates: Partial<ClassEvent>) => Promise<void>;
  deleteClassEvent: (id: string) => Promise<void>;

  // Assignments
  addAssignment: (asg: Omit<Assignment, 'id'>) => Promise<string>;
  updateAssignment: (id: string, updates: Partial<Assignment>) => Promise<void>;
  setAssignmentStatus: (id: string, status: AssignmentStatus) => Promise<void>;
  toggleSubtask: (assignmentId: string, subtaskId: string) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;

  // Projects & Project Tasks
  addProject: (proj: Omit<Project, 'id'>) => Promise<string>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  toggleProjectMilestone: (projectId: string, milestoneId: string) => Promise<void>;
  addProjectTask: (task: Omit<ProjectTask, 'id'>) => Promise<string>;
  updateProjectTask: (id: string, updates: Partial<ProjectTask>) => Promise<void>;
  setProjectTaskStatus: (id: string, status: ProjectTaskStatus) => Promise<void>;
  deleteProjectTask: (id: string) => Promise<void>;

  // Exams
  addExam: (exam: Omit<Exam, 'id'>) => Promise<string>;
  updateExam: (id: string, updates: Partial<Exam>) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;

  // Test Marks
  addTestMark: (mark: Omit<TestMark, 'id'>) => Promise<string>;
  updateTestMark: (id: string, updates: Partial<TestMark>) => Promise<void>;
  deleteTestMark: (id: string) => Promise<void>;

  // Study Tasks
  addStudyTask: (task: Omit<StudyTask, 'id'>) => Promise<string>;
  updateStudyTask: (id: string, updates: Partial<StudyTask>) => Promise<void>;
  toggleStudyTask: (id: string) => Promise<void>;
  deleteStudyTask: (id: string) => Promise<void>;

  // Notifications & Reminders
  deviceNotificationPermission: NotificationPermission | 'unsupported';
  requestDeviceNotificationPermission: () => Promise<boolean>;
  sendTestDeviceNotification: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;

  // Settings & Profile
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;

  // Backup, Import & Reset
  exportDataJson: () => string;
  importDataJson: (jsonString: string) => Promise<boolean>;
  resetToSampleData: () => void;
  clearAllData: () => Promise<void>;
  forceCloudSync: () => Promise<void>;
}

const AcademicContext = createContext<AcademicContextType | null>(null);

const STORAGE_KEY = 'studious_academic_state_v1';

export function AcademicProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Primary Academic Data Collections
  const [subjects, setSubjects] = useState<Subject[]>(SAMPLE_SUBJECTS);
  const [chapters, setChapters] = useState<Chapter[]>(SAMPLE_CHAPTERS);
  const [topics, setTopics] = useState<Topic[]>(SAMPLE_TOPICS);
  const [classes, setClasses] = useState<ClassEvent[]>(SAMPLE_CLASSES);
  const [assignments, setAssignments] = useState<Assignment[]>(SAMPLE_ASSIGNMENTS);
  const [projects, setProjects] = useState<Project[]>(SAMPLE_PROJECTS);
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>(SAMPLE_PROJECT_TASKS);
  const [exams, setExams] = useState<Exam[]>(SAMPLE_EXAMS);
  const [testMarks, setTestMarks] = useState<TestMark[]>(SAMPLE_TEST_MARKS);
  const [studyTasks, setStudyTasks] = useState<StudyTask[]>(SAMPLE_STUDY_TASKS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(SAMPLE_NOTIFICATIONS);

  const [deviceNotificationPermission, setDeviceNotificationPermission] = useState<
    NotificationPermission | 'unsupported'
  >('default');

  const [settings, setSettings] = useState<UserSettings>({
    theme: 'dark',
    weekStart: 1, // Monday
    classReminders: true,
    assignmentReminders: true,
    examReminders: true,
    classReminderAdvanceMinutes: 15,
    assignmentReminderAdvanceHours: 24,
    examReminderAdvanceHours: 48,
    deviceNotificationsEnabled: true,
    soundEnabled: true,
    fontSize: 'large',
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
  });

  const [profile, setProfile] = useState<UserProfile>({
    userId: 'guest_user',
    name: 'Alex Rivera',
    email: 'alex.rivera@university.edu',
    institution: 'State Institute of Technology',
    degree: 'B.S. Computer Science & Engineering',
    semester: 'Semester 5 (Fall/Winter)',
    academicTerm: '2026-2027 Academic Year',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  });

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Load local cache on mount if available
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.subjects?.length) setSubjects(parsed.subjects);
        if (parsed.chapters?.length) setChapters(parsed.chapters);
        if (parsed.topics?.length) setTopics(parsed.topics);
        if (parsed.classes?.length) setClasses(parsed.classes);
        if (parsed.assignments?.length) setAssignments(parsed.assignments);
        if (parsed.projects?.length) setProjects(parsed.projects);
        if (parsed.projectTasks?.length) setProjectTasks(parsed.projectTasks);
        if (parsed.exams?.length) setExams(parsed.exams);
        if (parsed.testMarks?.length) setTestMarks(parsed.testMarks);
        if (parsed.studyTasks?.length) setStudyTasks(parsed.studyTasks);
        if (parsed.notifications?.length) setNotifications(parsed.notifications);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.profile) setProfile(parsed.profile);
      }
    } catch (e) {
      console.warn('Error reading local cache', e);
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setDeviceNotificationPermission(Notification.permission);
    } else {
      setDeviceNotificationPermission('unsupported');
    }
  }, []);

  // Synchronize dynamic font scale attribute on HTML document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const activeSize = settings.fontSize || 'large';
      document.documentElement.setAttribute('data-font-size', activeSize);
    }
  }, [settings.fontSize]);

  // 2. Save to local storage for offline / guest resilience
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          subjects,
          chapters,
          topics,
          classes,
          assignments,
          projects,
          projectTasks,
          exams,
          testMarks,
          studyTasks,
          notifications,
          settings,
          profile,
        })
      );
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }, [
    subjects,
    chapters,
    topics,
    classes,
    assignments,
    projects,
    projectTasks,
    exams,
    testMarks,
    studyTasks,
    notifications,
    settings,
    profile,
  ]);

  // 3. Listen for Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
      if (firebaseUser) {
        setProfile((prev) => ({
          ...prev,
          userId: firebaseUser.uid,
          name: firebaseUser.displayName || prev.name,
          email: firebaseUser.email || prev.email,
        }));
        addToast({
          type: 'success',
          title: 'Connected to Firebase',
          message: `Signed in as ${firebaseUser.email || firebaseUser.displayName}. Cloud sync active.`,
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // 4. Firestore real-time sync when authenticated
  useEffect(() => {
    if (!user) return;
    setIsCloudSyncing(true);

    const uid = user.uid;
    const unsubscribes: Array<() => void> = [];

    const bindCollection = <T extends { id: string }>(
      name: string,
      setter: React.Dispatch<React.SetStateAction<T[]>>,
      fallback: T[]
    ) => {
      const colRef = collection(db, 'users', uid, name);
      const unsub = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T));
            setter(items);
          } else {
            // First time login: seed user cloud database with current data!
            fallback.forEach((item) => {
              setDoc(doc(db, 'users', uid, name, item.id), item).catch((err) => {
                handleFirestoreError(err, OperationType.WRITE, `users/${uid}/${name}/${item.id}`);
              });
            });
          }
          setIsCloudSyncing(false);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${uid}/${name}`);
        }
      );
      unsubscribes.push(unsub);
    };

    bindCollection('subjects', setSubjects, subjects);
    bindCollection('chapters', setChapters, chapters);
    bindCollection('topics', setTopics, topics);
    bindCollection('classes', setClasses, classes);
    bindCollection('assignments', setAssignments, assignments);
    bindCollection('projects', setProjects, projects);
    bindCollection('projectTasks', setProjectTasks, projectTasks);
    bindCollection('exams', setExams, exams);
    bindCollection('testMarks', setTestMarks, testMarks);
    bindCollection('studyTasks', setStudyTasks, studyTasks);
    bindCollection('notifications', setNotifications, notifications);

    return () => {
      unsubscribes.forEach((fn) => fn());
    };
  }, [user]);

  // Auth actions
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      addToast({
        type: 'error',
        title: 'Sign-in Failed',
        message: err.message || 'Could not complete Google Sign-in.',
      });
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      addToast({
        type: 'info',
        title: 'Signed Out',
        message: 'You are now in local Guest mode.',
      });
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  // Helper to persist single doc to Firestore if signed in
  const syncDoc = async (col: string, id: string, data: any) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid, col, id), data, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/${col}/${id}`);
    }
  };

  const deleteDocSync = async (col: string, id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, col, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/${col}/${id}`);
    }
  };

  // CRUD Implementations

  // Subjects
  const addSubject = async (subj: Omit<Subject, 'id'>) => {
    const id = 'sub-' + Math.random().toString(36).substring(2, 9);
    const newSubj: Subject = { ...subj, id, createdAt: new Date().toISOString() };
    setSubjects((prev) => [...prev, newSubj]);
    await syncDoc('subjects', id, newSubj);
    addToast({ type: 'success', title: 'Subject Created', message: `${newSubj.name} (${newSubj.code || ''})` });
    return id;
  };

  const updateSubject = async (id: string, updates: Partial<Subject>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s)));
    const updated = subjects.find((s) => s.id === id);
    if (updated) {
      await syncDoc('subjects', id, { ...updated, ...updates, updatedAt: new Date().toISOString() });
    }
  };

  const deleteSubject = async (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    // Cascade delete chapters, topics, linked classes
    setChapters((prev) => prev.filter((c) => c.subjectId !== id));
    setTopics((prev) => prev.filter((t) => t.subjectId !== id));
    setClasses((prev) => prev.filter((c) => c.subjectId !== id));
    await deleteDocSync('subjects', id);
    addToast({ type: 'info', title: 'Subject Deleted' });
  };

  const archiveSubject = async (id: string, isArchived: boolean) => {
    await updateSubject(id, { isArchived });
    addToast({
      type: 'info',
      title: isArchived ? 'Subject Archived' : 'Subject Restored',
    });
  };

  const updateSubjectAttendance = async (
    id: string,
    attended: number,
    total: number,
    minReq: number = 75
  ) => {
    await updateSubject(id, {
      attendanceAttended: Math.max(0, attended),
      attendanceTotal: Math.max(0, total),
      minAttendanceRequired: minReq,
    });
  };

  const quickMarkAttendance = async (id: string, present: boolean) => {
    const subj = subjects.find((s) => s.id === id);
    if (!subj) return;
    const currentAttended = subj.attendanceAttended ?? 0;
    const currentTotal = subj.attendanceTotal ?? 0;
    const newAttended = present ? currentAttended + 1 : currentAttended;
    const newTotal = currentTotal + 1;
    await updateSubjectAttendance(id, newAttended, newTotal, subj.minAttendanceRequired || 75);
    addToast({
      type: present ? 'success' : 'warning',
      title: present ? 'Class Marked Attended' : 'Class Marked Absent (Bunked)',
      message: `${subj.name}: ${newAttended}/${newTotal} classes (${((newAttended / newTotal) * 100).toFixed(1)}%)`,
    });
  };

  // Chapters & Topics
  const addChapter = async (chap: Omit<Chapter, 'id'>) => {
    const id = 'chap-' + Math.random().toString(36).substring(2, 9);
    const newChap: Chapter = { ...chap, id, createdAt: new Date().toISOString() };
    setChapters((prev) => [...prev, newChap]);
    await syncDoc('chapters', id, newChap);
    return id;
  };

  const updateChapter = async (id: string, updates: Partial<Chapter>) => {
    setChapters((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)));
    const chap = chapters.find((c) => c.id === id);
    if (chap) await syncDoc('chapters', id, { ...chap, ...updates });
  };

  const deleteChapter = async (id: string) => {
    setChapters((prev) => prev.filter((c) => c.id !== id));
    setTopics((prev) => prev.filter((t) => t.chapterId !== id));
    await deleteDocSync('chapters', id);
  };

  const addTopic = async (top: Omit<Topic, 'id'>) => {
    const id = 'top-' + Math.random().toString(36).substring(2, 9);
    const newTop: Topic = { ...top, id, createdAt: new Date().toISOString() };
    setTopics((prev) => [...prev, newTop]);
    await syncDoc('topics', id, newTop);
    return id;
  };

  const updateTopic = async (id: string, updates: Partial<Topic>) => {
    setTopics((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)));
    const top = topics.find((t) => t.id === id);
    if (top) await syncDoc('topics', id, { ...top, ...updates });
  };

  const setTopicStatus = async (id: string, status: TopicStatus) => {
    const now = new Date().toISOString();
    const target = topics.find((t) => t.id === id);
    const revisionCount = status === 'needs_revision' ? (target?.revisionCount || 0) + 1 : target?.revisionCount;
    await updateTopic(id, {
      status,
      lastStudiedAt: status === 'completed' ? now : target?.lastStudiedAt,
      revisionCount,
    });
  };

  const bulkAddTopics = async (chapterId: string, subjectId: string, topicTitles: string[]) => {
    const valid = topicTitles.map((t) => t.trim()).filter((t) => t.length > 0);
    for (let i = 0; i < valid.length; i++) {
      await addTopic({
        chapterId,
        subjectId,
        title: valid[i],
        status: 'not_started',
        order: (topics.filter((t) => t.chapterId === chapterId).length || 0) + i + 1,
      });
    }
    addToast({ type: 'success', title: `Added ${valid.length} Topics` });
  };

  const deleteTopic = async (id: string) => {
    setTopics((prev) => prev.filter((t) => t.id !== id));
    await deleteDocSync('topics', id);
  };

  // Timetable
  const addClassEvent = async (evt: Omit<ClassEvent, 'id'>) => {
    const id = 'cls-' + Math.random().toString(36).substring(2, 9);
    const newEvt: ClassEvent = { ...evt, id, createdAt: new Date().toISOString() };
    setClasses((prev) => [...prev, newEvt]);
    await syncDoc('classes', id, newEvt);
    addToast({ type: 'success', title: 'Class Scheduled', message: `${newEvt.title}` });
    return id;
  };

  const updateClassEvent = async (id: string, updates: Partial<ClassEvent>) => {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)));
    const cls = classes.find((c) => c.id === id);
    if (cls) await syncDoc('classes', id, { ...cls, ...updates });
  };

  const deleteClassEvent = async (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    await deleteDocSync('classes', id);
    addToast({ type: 'info', title: 'Class Event Removed' });
  };

  // Assignments
  const addAssignment = async (asg: Omit<Assignment, 'id'>) => {
    const id = 'asg-' + Math.random().toString(36).substring(2, 9);
    const newAsg: Assignment = { ...asg, id, createdAt: new Date().toISOString() };
    setAssignments((prev) => [...prev, newAsg]);
    await syncDoc('assignments', id, newAsg);
    addToast({ type: 'success', title: 'Assignment Added', message: newAsg.title });
    return id;
  };

  const updateAssignment = async (id: string, updates: Partial<Assignment>) => {
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a)));
    const asg = assignments.find((a) => a.id === id);
    if (asg) await syncDoc('assignments', id, { ...asg, ...updates });
  };

  const setAssignmentStatus = async (id: string, status: AssignmentStatus) => {
    const now = new Date().toISOString();
    const updates: Partial<Assignment> = { status };
    if (status === 'completed') updates.completedAt = now;
    if (status === 'submitted') updates.submittedAt = now;
    await updateAssignment(id, updates);
    addToast({
      type: 'info',
      title: 'Status Updated',
      message: `Marked as ${status.replace('_', ' ')}`,
    });
  };

  const toggleSubtask = async (assignmentId: string, subtaskId: string) => {
    const asg = assignments.find((a) => a.id === assignmentId);
    if (!asg || !asg.subtasks) return;
    const newSubtasks = asg.subtasks.map((st) => (st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st));
    await updateAssignment(assignmentId, { subtasks: newSubtasks });
  };

  const deleteAssignment = async (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    await deleteDocSync('assignments', id);
    addToast({ type: 'info', title: 'Assignment Removed' });
  };

  // Projects & Tasks
  const addProject = async (proj: Omit<Project, 'id'>) => {
    const id = 'proj-' + Math.random().toString(36).substring(2, 9);
    const newProj: Project = { ...proj, id, createdAt: new Date().toISOString() };
    setProjects((prev) => [...prev, newProj]);
    await syncDoc('projects', id, newProj);
    addToast({ type: 'success', title: 'Project Created', message: newProj.title });
    return id;
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)));
    const proj = projects.find((p) => p.id === id);
    if (proj) await syncDoc('projects', id, { ...proj, ...updates });
  };

  const deleteProject = async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setProjectTasks((prev) => prev.filter((t) => t.projectId !== id));
    await deleteDocSync('projects', id);
    addToast({ type: 'info', title: 'Project Removed' });
  };

  const toggleProjectMilestone = async (projectId: string, milestoneId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;
    const newMilestones = proj.milestones.map((m) => (m.id === milestoneId ? { ...m, isCompleted: !m.isCompleted } : m));
    await updateProject(projectId, { milestones: newMilestones });
  };

  const addProjectTask = async (task: Omit<ProjectTask, 'id'>) => {
    const id = 'pt-' + Math.random().toString(36).substring(2, 9);
    const newTask: ProjectTask = { ...task, id, createdAt: new Date().toISOString() };
    setProjectTasks((prev) => [...prev, newTask]);
    await syncDoc('projectTasks', id, newTask);
    return id;
  };

  const updateProjectTask = async (id: string, updates: Partial<ProjectTask>) => {
    setProjectTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)));
    const pt = projectTasks.find((t) => t.id === id);
    if (pt) await syncDoc('projectTasks', id, { ...pt, ...updates });
  };

  const setProjectTaskStatus = async (id: string, status: ProjectTaskStatus) => {
    await updateProjectTask(id, {
      status,
      completedAt: status === 'completed' ? new Date().toISOString() : undefined,
    });
  };

  const deleteProjectTask = async (id: string) => {
    setProjectTasks((prev) => prev.filter((t) => t.id !== id));
    await deleteDocSync('projectTasks', id);
  };

  // Exams
  const addExam = async (exam: Omit<Exam, 'id'>) => {
    const id = 'ex-' + Math.random().toString(36).substring(2, 9);
    const newExam: Exam = { ...exam, id, createdAt: new Date().toISOString() };
    setExams((prev) => [...prev, newExam]);
    await syncDoc('exams', id, newExam);
    addToast({ type: 'success', title: 'Examination Scheduled', message: `${newExam.title}` });
    return id;
  };

  const updateExam = async (id: string, updates: Partial<Exam>) => {
    setExams((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e)));
    const ex = exams.find((e) => e.id === id);
    if (ex) await syncDoc('exams', id, { ...ex, ...updates });
  };

  const deleteExam = async (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
    await deleteDocSync('exams', id);
    addToast({ type: 'info', title: 'Exam Removed' });
  };

  // Test Marks
  const addTestMark = async (mark: Omit<TestMark, 'id'>) => {
    const id = 'tm-' + Math.random().toString(36).substring(2, 9);
    const percent =
      mark.percentage !== undefined
        ? mark.percentage
        : mark.maxMarks > 0
        ? Math.round((mark.marksObtained / mark.maxMarks) * 100 * 10) / 10
        : 0;
    const newMark: TestMark = {
      ...mark,
      id,
      percentage: percent,
      createdAt: new Date().toISOString(),
    };
    setTestMarks((prev) => [newMark, ...prev]);
    await syncDoc('testMarks', id, newMark);
    addToast({
      type: 'success',
      title: 'Test Mark Recorded',
      message: `${newMark.testName} (${newMark.marksObtained}/${newMark.maxMarks})`,
    });
    return id;
  };

  const updateTestMark = async (id: string, updates: Partial<TestMark>) => {
    let percent = updates.percentage;
    if (updates.marksObtained !== undefined && updates.maxMarks !== undefined) {
      percent = updates.maxMarks > 0 ? Math.round((updates.marksObtained / updates.maxMarks) * 100 * 10) / 10 : 0;
    }
    setTestMarks((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              ...updates,
              percentage: percent !== undefined ? percent : m.percentage,
              updatedAt: new Date().toISOString(),
            }
          : m
      )
    );
    const existing = testMarks.find((m) => m.id === id);
    if (existing) {
      await syncDoc('testMarks', id, {
        ...existing,
        ...updates,
        percentage: percent !== undefined ? percent : existing.percentage,
      });
    }
  };

  const deleteTestMark = async (id: string) => {
    setTestMarks((prev) => prev.filter((m) => m.id !== id));
    await deleteDocSync('testMarks', id);
    addToast({ type: 'info', title: 'Test Mark Deleted' });
  };

  // Study Tasks
  const addStudyTask = async (task: Omit<StudyTask, 'id'>) => {
    const id = 'stk-' + Math.random().toString(36).substring(2, 9);
    const newTask: StudyTask = { ...task, id, createdAt: new Date().toISOString() };
    setStudyTasks((prev) => [...prev, newTask]);
    await syncDoc('studyTasks', id, newTask);
    addToast({ type: 'success', title: 'Study Task Created', message: newTask.title });
    return id;
  };

  const updateStudyTask = async (id: string, updates: Partial<StudyTask>) => {
    setStudyTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)));
    const st = studyTasks.find((t) => t.id === id);
    if (st) await syncDoc('studyTasks', id, { ...st, ...updates });
  };

  const toggleStudyTask = async (id: string) => {
    const task = studyTasks.find((t) => t.id === id);
    if (!task) return;
    const isCompleted = task.status === 'completed';
    const newStatus = isCompleted ? 'pending' : 'completed';
    await updateStudyTask(id, {
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
    });
  };

  const deleteStudyTask = async (id: string) => {
    setStudyTasks((prev) => prev.filter((t) => t.id !== id));
    await deleteDocSync('studyTasks', id);
  };

  // Notifications
  // Device Notification Permissions & Actions
  const requestDeviceNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      addToast({
        type: 'warning',
        title: 'Device Notifications Unsupported',
        message: 'This web browser does not support the Web Notification API.',
      });
      return false;
    }

    try {
      const res = await Notification.requestPermission();
      setDeviceNotificationPermission(res);
      if (res === 'granted') {
        addToast({
          type: 'success',
          title: 'Device Notifications Enabled',
          message: 'Studious will alert you before lectures and approaching deadlines.',
        });
        if (settings.soundEnabled !== false) {
          playNotificationChime();
        }
        return true;
      } else if (res === 'denied') {
        addToast({
          type: 'warning',
          title: 'Notifications Blocked',
          message:
            'Permission was denied. Please allow notifications in browser permissions to receive alerts.',
        });
        return false;
      }
      return false;
    } catch (err) {
      console.error('Notification permission error', err);
      return false;
    }
  };

  const sendTestDeviceNotification = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      addToast({
        type: 'warning',
        title: 'Device Notifications Unsupported',
        message: 'Your current browser does not support web push notifications.',
      });
      return;
    }

    if (Notification.permission !== 'granted') {
      const granted = await requestDeviceNotificationPermission();
      if (!granted) return;
    }

    try {
      new Notification('Studious • Academic Reminder', {
        body: 'Upcoming Class: Operating Systems starts in 15 mins (Hall 402).',
        icon: '/favicon.ico',
      });
    } catch (err) {
      console.warn('Native notification failed', err);
    }

    if (settings.soundEnabled !== false) {
      playNotificationChime();
    }

    addToast({
      type: 'info',
      title: 'Test Notification Sent',
      message: 'Mobile banner & chime delivered. You will receive real advance notices automatically.',
    });
  };

  // Background Academic Notification Scheduler
  const notifiedKeysRef = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentDayOfWeek = now.getDay();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const inQuiet = isQuietHours(
        currentMinutes,
        settings.quietHoursStart || '22:00',
        settings.quietHoursEnd || '07:00'
      );

      // Helper to dispatch alert
      const dispatchAlert = (payload: {
        id: string;
        title: string;
        message: string;
        category: 'class' | 'assignment' | 'exam' | 'revision' | 'system';
        linkUrl?: string;
      }) => {
        notifiedKeysRef.current.add(payload.id);

        const newNotif: NotificationItem = {
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          title: payload.title,
          message: payload.message,
          category: payload.category,
          isRead: false,
          linkUrl: payload.linkUrl,
          createdAt: new Date().toISOString(),
        };

        // Add to in-app notification center
        setNotifications((prev) => [newNotif, ...prev]);

        // Persist to Firestore if logged in
        if (user) {
          syncDoc('notifications', newNotif.id, newNotif);
        }

        // Show toast
        addToast({
          type: 'info',
          title: payload.title,
          message: payload.message,
        });

        // Trigger device notification if allowed and not quiet hours
        if (!inQuiet && settings.deviceNotificationsEnabled !== false) {
          if (
            typeof window !== 'undefined' &&
            'Notification' in window &&
            Notification.permission === 'granted'
          ) {
            try {
              new Notification(payload.title, {
                body: payload.message,
                icon: '/favicon.ico',
                tag: payload.id,
              });
            } catch (e) {
              console.warn('Native notification failed', e);
            }
          }
        }

        // Play chime if allowed
        if (!inQuiet && settings.soundEnabled !== false) {
          playNotificationChime();
        }
      };

      // 1. Classes
      if (settings.classReminders !== false) {
        for (const cls of classes) {
          const payload = shouldTriggerClassReminder(
            cls,
            currentDayOfWeek,
            currentMinutes,
            settings.classReminderAdvanceMinutes || 15,
            notifiedKeysRef.current
          );
          if (payload) {
            dispatchAlert(payload);
          }
        }
      }

      // 2. Assignment Deadlines
      if (settings.assignmentReminders !== false) {
        for (const asg of assignments) {
          const payload = shouldTriggerDeadlineReminder(
            asg,
            now,
            settings.assignmentReminderAdvanceHours || 24,
            notifiedKeysRef.current
          );
          if (payload) {
            dispatchAlert(payload);
          }
        }
      }

      // 3. Exams
      if (settings.examReminders !== false) {
        for (const exam of exams) {
          const payload = shouldTriggerExamReminder(
            exam,
            now,
            settings.examReminderAdvanceHours || 48,
            notifiedKeysRef.current
          );
          if (payload) {
            dispatchAlert(payload);
          }
        }
      }
    };

    // Run check immediately and every 30 seconds
    checkReminders();
    const timer = setInterval(checkReminders, 30000);
    return () => clearInterval(timer);
  }, [classes, assignments, exams, settings, user]);

  const markNotificationRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    const notif = notifications.find((n) => n.id === id);
    if (notif) await syncDoc('notifications', id, { ...notif, isRead: true });
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    if (user) {
      notifications.forEach((n) => syncDoc('notifications', n.id, { ...n, isRead: true }));
    }
  };

  const clearNotifications = async () => {
    if (user) {
      notifications.forEach((n) => deleteDocSync('notifications', n.id));
    }
    setNotifications([]);
  };

  // Settings & Profile
  const updateSettings = async (updates: Partial<UserSettings>) => {
    const updated = { ...settings, ...updates, updatedAt: new Date().toISOString() };
    setSettings(updated);
    if (user) {
      await syncDoc('settings', 'preferences', updated);
    }
    addToast({ type: 'info', title: 'Preferences Saved' });
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const updated = { ...profile, ...updates, updatedAt: new Date().toISOString() };
    setProfile(updated);
    if (user) {
      await syncDoc('profile', 'student', updated);
    }
    addToast({ type: 'success', title: 'Profile Updated' });
  };

  // Backup & Import
  const exportDataJson = () => {
    const snapshot = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile,
      settings,
      subjects,
      chapters,
      topics,
      classes,
      assignments,
      projects,
      projectTasks,
      exams,
      testMarks,
      studyTasks,
    };
    return JSON.stringify(snapshot, null, 2);
  };

  const importDataJson = async (jsonString: string): Promise<boolean> => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.subjects || !Array.isArray(data.subjects)) {
        throw new Error('Invalid export file format: subjects array missing.');
      }
      setSubjects(data.subjects || []);
      setChapters(data.chapters || []);
      setTopics(data.topics || []);
      setClasses(data.classes || []);
      setAssignments(data.assignments || []);
      setProjects(data.projects || []);
      setProjectTasks(data.projectTasks || []);
      setExams(data.exams || []);
      setTestMarks(data.testMarks || []);
      setStudyTasks(data.studyTasks || []);
      if (data.settings) setSettings(data.settings);
      if (data.profile) setProfile(data.profile);

      addToast({ type: 'success', title: 'Data Restored Successfully', message: `Imported ${data.subjects.length} subjects.` });
      return true;
    } catch (err: any) {
      console.error('Import error:', err);
      addToast({ type: 'error', title: 'Import Failed', message: err.message || 'Corrupted or invalid JSON.' });
      return false;
    }
  };

  const resetToSampleData = () => {
    setSubjects(SAMPLE_SUBJECTS);
    setChapters(SAMPLE_CHAPTERS);
    setTopics(SAMPLE_TOPICS);
    setClasses(SAMPLE_CLASSES);
    setAssignments(SAMPLE_ASSIGNMENTS);
    setProjects(SAMPLE_PROJECTS);
    setProjectTasks(SAMPLE_PROJECT_TASKS);
    setExams(SAMPLE_EXAMS);
    setTestMarks(SAMPLE_TEST_MARKS);
    setStudyTasks(SAMPLE_STUDY_TASKS);
    setNotifications(SAMPLE_NOTIFICATIONS);
    addToast({ type: 'info', title: 'Sample Data Loaded', message: 'Restored standard university semester syllabus & timetable.' });
  };

  const clearAllData = async () => {
    setSubjects([]);
    setChapters([]);
    setTopics([]);
    setClasses([]);
    setAssignments([]);
    setProjects([]);
    setProjectTasks([]);
    setExams([]);
    setTestMarks([]);
    setStudyTasks([]);
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
    addToast({ type: 'warning', title: 'Academic Workspace Cleared' });
  };

  const forceCloudSync = async () => {
    setIsCloudSyncing(true);
    try {
      if (user) {
        const uid = user.uid;
        await setDoc(
          doc(db, 'users', uid),
          {
            lastSyncedAt: new Date().toISOString(),
            profile,
            settings,
          },
          { merge: true }
        );
      }
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          subjects,
          chapters,
          topics,
          classes,
          assignments,
          projects,
          projectTasks,
          exams,
          testMarks,
          studyTasks,
          notifications,
          settings,
          profile,
        })
      );
    } catch (e: any) {
      console.error('Manual sync error:', e);
      throw e;
    } finally {
      setTimeout(() => setIsCloudSyncing(false), 500);
    }
  };

  return (
    <AcademicContext.Provider
      value={{
        user,
        authLoading,
        isCloudSyncing,
        isGuestMode: !user,
        signInWithGoogle,
        signOutUser,

        subjects,
        chapters,
        topics,
        classes,
        assignments,
        projects,
        projectTasks,
        exams,
        testMarks,
        studyTasks,
        notifications,
        settings,
        profile,

        toasts,
        addToast,
        removeToast,

        addSubject,
        updateSubject,
        updateSubjectAttendance,
        quickMarkAttendance,
        deleteSubject,
        archiveSubject,

        addChapter,
        updateChapter,
        deleteChapter,
        addTopic,
        updateTopic,
        setTopicStatus,
        bulkAddTopics,
        deleteTopic,

        addClassEvent,
        updateClassEvent,
        deleteClassEvent,

        addAssignment,
        updateAssignment,
        setAssignmentStatus,
        toggleSubtask,
        deleteAssignment,

        addProject,
        updateProject,
        deleteProject,
        toggleProjectMilestone,
        addProjectTask,
        updateProjectTask,
        setProjectTaskStatus,
        deleteProjectTask,

        addExam,
        updateExam,
        deleteExam,

        addTestMark,
        updateTestMark,
        deleteTestMark,

        addStudyTask,
        updateStudyTask,
        toggleStudyTask,
        deleteStudyTask,

        deviceNotificationPermission,
        requestDeviceNotificationPermission,
        sendTestDeviceNotification,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,

        updateSettings,
        updateProfile,

        exportDataJson,
        importDataJson,
        resetToSampleData,
        clearAllData,
        forceCloudSync,
      }}
    >
      {children}
    </AcademicContext.Provider>
  );
}

export function useAcademic(): AcademicContextType {
  const ctx = useContext(AcademicContext);
  if (!ctx) {
    throw new Error('useAcademic must be used within an AcademicProvider');
  }
  return ctx;
}
