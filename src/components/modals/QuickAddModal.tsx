import React, { useState } from 'react';
import {
  Timer,
  CheckSquare,
  Calendar,
  BookOpen,
  GraduationCap,
  FolderKanban,
  Award,
  X,
  Plus,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { TestType } from '../../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'task' | 'assignment' | 'class' | 'subject' | 'exam' | 'project' | 'mark';
}

export function QuickAddModal({ isOpen, onClose, initialTab = 'task' }: QuickAddModalProps) {
  const {
    subjects,
    addStudyTask,
    addAssignment,
    addClassEvent,
    addSubject,
    addExam,
    addProject,
    addTestMark,
  } = useAcademic();

  const [activeTab, setActiveTab] = useState<'task' | 'assignment' | 'class' | 'subject' | 'exam' | 'project' | 'mark'>(initialTab);

  // Form states
  // Task
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubjectId, setTaskSubjectId] = useState(subjects[0]?.id || '');
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskDuration, setTaskDuration] = useState(45);

  // Assignment
  const [asgTitle, setAsgTitle] = useState('');
  const [asgSubjectId, setAsgSubjectId] = useState(subjects[0]?.id || '');
  const [asgType, setAsgType] = useState('Homework');
  const [asgDueDate, setAsgDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [asgDueTime, setAsgDueTime] = useState('23:59');
  const [asgPriority, setAsgPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  // Class
  const [classTitle, setClassTitle] = useState('');
  const [classSubjectId, setClassSubjectId] = useState(subjects[0]?.id || '');
  const [classDay, setClassDay] = useState(1); // Monday
  const [classStart, setClassStart] = useState('09:00');
  const [classEnd, setClassEnd] = useState('10:30');
  const [classRoom, setClassRoom] = useState('');

  // Subject
  const [subjName, setSubjName] = useState('');
  const [subjCode, setSubjCode] = useState('');
  const [subjColor, setSubjColor] = useState('#3B82F6');
  const [subjCredits, setSubjCredits] = useState(3);

  // Exam
  const [examTitle, setExamTitle] = useState('');
  const [examSubjectId, setExamSubjectId] = useState(subjects[0]?.id || '');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [examStart, setExamStart] = useState('09:30');
  const [examRoom, setExamRoom] = useState('');

  // Project
  const [projTitle, setProjTitle] = useState('');
  const [projDeadline, setProjDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [projType, setProjType] = useState('Course Project');

  // Test Mark
  const [markName, setMarkName] = useState('');
  const [markSubjectId, setMarkSubjectId] = useState(subjects[0]?.id || '');
  const [markType, setMarkType] = useState<TestType>('internal');
  const [markDate, setMarkDate] = useState(new Date().toISOString().split('T')[0]);
  const [markObtained, setMarkObtained] = useState('');
  const [markMax, setMarkMax] = useState('50');
  const [markWeightage, setMarkWeightage] = useState('15');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'task') {
      if (!taskTitle.trim()) return;
      await addStudyTask({
        title: taskTitle.trim(),
        subjectId: taskSubjectId || undefined,
        date: taskDate,
        durationMinutes: Number(taskDuration),
        status: 'pending',
      });
    } else if (activeTab === 'mark') {
      if (!markName.trim()) return;
      const obtained = parseFloat(markObtained) || 0;
      const max = parseFloat(markMax) || 50;
      const pct = max > 0 ? Math.round((obtained / max) * 100 * 10) / 10 : 0;
      await addTestMark({
        testName: markName.trim(),
        subjectId: markSubjectId || subjects[0]?.id || 'sub-gen',
        testType: markType,
        date: markDate,
        marksObtained: obtained,
        maxMarks: max,
        percentage: pct,
        weightage: markWeightage ? parseFloat(markWeightage) : undefined,
      });
    } else if (activeTab === 'assignment') {
      if (!asgTitle.trim()) return;
      await addAssignment({
        title: asgTitle.trim(),
        subjectId: asgSubjectId || subjects[0]?.id || 'sub-gen',
        type: asgType,
        dueDate: asgDueDate,
        dueTime: asgDueTime,
        priority: asgPriority,
        status: 'not_started',
      });
    } else if (activeTab === 'class') {
      if (!classTitle.trim()) return;
      await addClassEvent({
        title: classTitle.trim(),
        subjectId: classSubjectId || subjects[0]?.id || 'sub-gen',
        dayOfWeek: Number(classDay),
        startTime: classStart,
        endTime: classEnd,
        room: classRoom.trim(),
        recurrence: 'weekly',
      });
    } else if (activeTab === 'subject') {
      if (!subjName.trim()) return;
      await addSubject({
        name: subjName.trim(),
        code: subjCode.trim(),
        color: subjColor,
        credits: Number(subjCredits),
      });
    } else if (activeTab === 'exam') {
      if (!examTitle.trim()) return;
      await addExam({
        title: examTitle.trim(),
        subjectId: examSubjectId || subjects[0]?.id || 'sub-gen',
        examType: 'Semester',
        date: examDate,
        startTime: examStart,
        room: examRoom.trim(),
      });
    } else if (activeTab === 'project') {
      if (!projTitle.trim()) return;
      await addProject({
        title: projTitle.trim(),
        projectType: projType,
        deadline: projDeadline,
        status: 'in_progress',
        members: [{ id: 'm-owner', name: 'You (Owner)', role: 'Lead' }],
        milestones: [{ id: 'ms-1', title: 'Initial Milestone', dueDate: projDeadline, isCompleted: false }],
      });
    }

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-add-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
    >
      <div className="bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between">
          <h2 id="quick-add-title" className="text-lg sm:text-xl font-bold text-zinc-100">
            Quick Add Academic Record
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-zinc-800 px-4 pt-2 overflow-x-auto gap-1">
          {[
            { id: 'task', label: 'Study Task', icon: Timer },
            { id: 'mark', label: 'Test Mark', icon: Award },
            { id: 'assignment', label: 'Assignment', icon: CheckSquare },
            { id: 'class', label: 'Class', icon: Calendar },
            { id: 'subject', label: 'Subject', icon: BookOpen },
            { id: 'exam', label: 'Exam', icon: GraduationCap },
            { id: 'project', label: 'Project', icon: FolderKanban },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-colors whitespace-nowrap border-b-2 ${
                  isSelected
                    ? 'border-indigo-500 text-indigo-400 bg-zinc-800/60 font-bold'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {activeTab === 'task' && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Revise Deadlock algorithms"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Subject</label>
                  <select
                    value={taskSubjectId}
                    onChange={(e) => setTaskSubjectId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="">General</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Date</label>
                  <input
                    type="date"
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'mark' && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Test / Assessment Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Midterm 1, Quiz 2"
                  value={markName}
                  onChange={(e) => setMarkName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Subject *
                  </label>
                  <select
                    value={markSubjectId}
                    onChange={(e) => setMarkSubjectId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Assessment Type
                  </label>
                  <select
                    value={markType}
                    onChange={(e) => setMarkType(e.target.value as TestType)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500 capitalize"
                  >
                    <option value="internal">Internal Assessment</option>
                    <option value="midterm">Midterm Exam</option>
                    <option value="quiz">Quiz</option>
                    <option value="lab">Lab Viva</option>
                    <option value="assignment">Assignment</option>
                    <option value="final">Final Exam</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Score *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="e.g. 42"
                    value={markObtained}
                    onChange={(e) => setMarkObtained(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Out Of *
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="50"
                    value={markMax}
                    onChange={(e) => setMarkMax(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Weight %
                  </label>
                  <input
                    type="number"
                    step="1"
                    placeholder="20"
                    value={markWeightage}
                    onChange={(e) => setMarkWeightage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'assignment' && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Assignment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Lab Report 3: Concurrency"
                  value={asgTitle}
                  onChange={(e) => setAsgTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Subject</label>
                  <select
                    value={asgSubjectId}
                    onChange={(e) => setAsgSubjectId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Type</label>
                  <select
                    value={asgType}
                    onChange={(e) => setAsgType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="Homework">Homework</option>
                    <option value="Written assignment">Written assignment</option>
                    <option value="Laboratory work">Laboratory work</option>
                    <option value="Report">Report</option>
                    <option value="Presentation">Presentation</option>
                    <option value="Quiz">Quiz</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={asgDueDate}
                    onChange={(e) => setAsgDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Due Time</label>
                  <input
                    type="time"
                    value={asgDueTime}
                    onChange={(e) => setAsgDueTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Priority</label>
                  <select
                    value={asgPriority}
                    onChange={(e) => setAsgPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {activeTab === 'class' && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Class Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Computer Networks Lecture"
                  value={classTitle}
                  onChange={(e) => setClassTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Subject</label>
                  <select
                    value={classSubjectId}
                    onChange={(e) => setClassSubjectId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Weekday</label>
                  <select
                    value={classDay}
                    onChange={(e) => setClassDay(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                    <option value={0}>Sunday</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Start Time</label>
                  <input
                    type="time"
                    value={classStart}
                    onChange={(e) => setClassStart(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">End Time</label>
                  <input
                    type="time"
                    value={classEnd}
                    onChange={(e) => setClassEnd(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Room / Lab</label>
                  <input
                    type="text"
                    placeholder="Hall 402"
                    value={classRoom}
                    onChange={(e) => setClassRoom(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'subject' && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Computer Architecture"
                  value={subjName}
                  onChange={(e) => setSubjName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Course Code</label>
                  <input
                    type="text"
                    placeholder="CS302"
                    value={subjCode}
                    onChange={(e) => setSubjCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Credits</label>
                  <input
                    type="number"
                    value={subjCredits}
                    onChange={(e) => setSubjCredits(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Color</label>
                  <input
                    type="color"
                    value={subjColor}
                    onChange={(e) => setSubjColor(e.target.value)}
                    className="w-full h-10 bg-zinc-800 border border-zinc-700 rounded-xl cursor-pointer"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'exam' && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Exam Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Operating Systems End-Semester"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Subject</label>
                  <select
                    value={examSubjectId}
                    onChange={(e) => setExamSubjectId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Date</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Start Time</label>
                  <input
                    type="time"
                    value={examStart}
                    onChange={(e) => setExamStart(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Exam Room / Desk</label>
                  <input
                    type="text"
                    placeholder="Desk 42, Hall A"
                    value={examRoom}
                    onChange={(e) => setExamRoom(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'project' && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Autonomous Quadcopter Navigation"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Project Type</label>
                  <input
                    type="text"
                    value={projType}
                    onChange={(e) => setProjType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Final Deadline</label>
                  <input
                    type="date"
                    value={projDeadline}
                    onChange={(e) => setProjDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-zinc-400 hover:text-zinc-200 rounded-xl hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
