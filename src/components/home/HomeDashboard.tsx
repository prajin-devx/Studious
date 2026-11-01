import React from 'react';
import {
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Timer,
  GraduationCap,
  FolderKanban,
  CheckSquare,
  Award,
  Plus,
  FileText,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import {
  calculateOverallSyllabusProgress,
  calculateSubjectProgress,
  calculateDaysRemaining,
  formatTime12h,
  timeStringToMinutes,
} from '../../utils/academicCalculations';
import { calculateMarksSummary } from '../../utils/marksCalculations';
import {
  calculateOverallAttendance,
  calculateBunkMargin,
} from '../../utils/attendanceCalculations';
import { AcademicTranscriptModal } from '../modals/AcademicTranscriptModal';
import { AttendanceBunkModal } from '../modals/AttendanceBunkModal';

interface HomeDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenQuickAdd: (tab?: any) => void;
  onOpenTimer: () => void;
  onOpenPdfImport: (docType?: any) => void;
}

export function HomeDashboard({
  onNavigate,
  onOpenQuickAdd,
  onOpenTimer,
  onOpenPdfImport,
}: HomeDashboardProps) {
  const {
    profile,
    subjects,
    topics,
    classes,
    assignments,
    exams,
    testMarks,
    studyTasks,
    toggleStudyTask,
    setAssignmentStatus,
  } = useAcademic();

  const [isTranscriptOpen, setIsTranscriptOpen] = React.useState<boolean>(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = React.useState<boolean>(false);

  const overallAttendance = calculateOverallAttendance(subjects);

  const marksSummary = calculateMarksSummary(testMarks);
  const recentMarks = [...testMarks]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Classes today sorted chronologically
  const todaysClasses = classes
    .filter((c) => c.dayOfWeek === currentDayOfWeek && !c.isCancelled)
    .sort((a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime));

  // Determine current class & next upcoming class
  let currentClass = null;
  let nextClass = null;
  for (const cls of todaysClasses) {
    const sMin = timeStringToMinutes(cls.startTime);
    const eMin = timeStringToMinutes(cls.endTime);
    if (currentMinutes >= sMin && currentMinutes <= eMin) {
      currentClass = cls;
    } else if (currentMinutes < sMin && !nextClass) {
      nextClass = cls;
    }
  }

  // Next class countdown in minutes
  const timeToNextClass = nextClass
    ? timeStringToMinutes(nextClass.startTime) - currentMinutes
    : null;

  // Upcoming assignments (not completed, sorted by due date)
  const pendingAssignments = assignments
    .filter((a) => a.status !== 'completed' && a.status !== 'submitted')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  // Today's pending study tasks
  const todayDateStr = now.toISOString().split('T')[0];
  const pendingStudyTasks = studyTasks.filter(
    (st) => st.date === todayDateStr && st.status === 'pending'
  );

  // Nearest examinations
  const upcomingExams = exams
    .filter((e) => calculateDaysRemaining(e.date, now) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  // Overall syllabus completion
  const overallProgress = calculateOverallSyllabusProgress(subjects, topics);

  // Topics needing revision count
  const needsRevisionCount = topics.filter((t) => t.status === 'needs_revision').length;

  const dateFormatted = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. Header / Greeting Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-900/50 border border-zinc-800 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
            <span>{dateFormatted}</span>
            <span>•</span>
            <span>{profile.semester || 'Semester 5'}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100">
            Welcome back, {profile.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-zinc-300 mt-1 max-w-xl">
            You have {todaysClasses.length} {todaysClasses.length === 1 ? 'class' : 'classes'} scheduled
            today and {pendingAssignments.length} pending academic deadlines this week.
          </p>
        </div>

        {/* Next Class Countdown / Free Period Pill */}
        <div className="flex items-center gap-3">
          {currentClass ? (
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs sm:text-sm">
              <span className="font-semibold text-indigo-300 block">Class in session:</span>
              <span className="text-zinc-100 font-medium">{currentClass.title}</span>
              <span className="text-zinc-300 block text-xs mt-0.5">
                Ends at {formatTime12h(currentClass.endTime)} • {currentClass.room || 'Campus'}
              </span>
            </div>
          ) : nextClass && timeToNextClass !== null ? (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs sm:text-sm">
              <span className="font-semibold text-blue-300 block">Next class in {timeToNextClass} mins:</span>
              <span className="text-zinc-100 font-medium">{nextClass.title}</span>
              <span className="text-zinc-300 block text-xs mt-0.5">
                Starts at {formatTime12h(nextClass.startTime)} • {nextClass.room || 'Campus'}
              </span>
            </div>
          ) : (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs sm:text-sm">
              <span className="font-semibold text-emerald-400 block">Free Period</span>
              <span className="text-zinc-300">No further classes scheduled today</span>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsTranscriptOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 shadow-xs"
              title="View Official Semester Transcript & Grade Card"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Transcript</span>
            </button>

            <button
              onClick={() => setIsAttendanceOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 shadow-xs"
              title="Attendance & Safe Bunk Margins"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Bunk Margin</span>
            </button>

            <button
              onClick={() => onOpenQuickAdd('task')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/20 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Overall Syllabus */}
        <div
          onClick={() => onNavigate('subjects')}
          className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between text-sm text-zinc-300">
            <span className="font-medium">Syllabus Covered</span>
            <BookOpen className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100">
              {overallProgress.percentage}%
            </span>
            <span className="text-xs text-zinc-400">
              {overallProgress.completedTopics}/{overallProgress.totalTopics} topics
            </span>
          </div>
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full"
              style={{ width: `${overallProgress.percentage}%` }}
            />
          </div>
        </div>

        {/* Classes Today */}
        <div
          onClick={() => onNavigate('timetable')}
          className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between text-sm text-zinc-300">
            <span className="font-medium">Today&apos;s Lectures</span>
            <Calendar className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100">
              {todaysClasses.length}
            </span>
            <span className="text-xs text-zinc-400">classes</span>
          </div>
          <p className="text-xs text-zinc-400 truncate">
            {nextClass ? `Next: ${nextClass.title}` : 'No upcoming classes today'}
          </p>
        </div>

        {/* Deadlines Approaching */}
        <div
          onClick={() => onNavigate('assignments')}
          className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between text-sm text-zinc-300">
            <span className="font-medium">Pending Deadlines</span>
            <Clock className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100">
              {pendingAssignments.length}
            </span>
            <span className="text-xs text-zinc-400">assignments</span>
          </div>
          <p className="text-xs text-zinc-400 truncate">
            {pendingAssignments[0] ? `Due: ${pendingAssignments[0].title}` : 'No urgent deadlines'}
          </p>
        </div>

        {/* Revision Queue */}
        <div
          onClick={() => onNavigate('progress')}
          className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between text-sm text-zinc-300">
            <span className="font-medium">Revision Queue</span>
            <AlertCircle className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100">
              {needsRevisionCount}
            </span>
            <span className="text-xs text-zinc-400">flagged topics</span>
          </div>
          <p className="text-xs text-zinc-400 truncate">
            {needsRevisionCount > 0 ? 'Topics needing review' : 'All topics clear'}
          </p>
        </div>
      </div>

      {/* 3. Main Grid: Today's Classes + Today's Study Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Timetable */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-semibold text-zinc-100">Today&apos;s Class Schedule</h2>
            </div>
            <button
              onClick={() => onNavigate('timetable')}
              className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              Full Timetable <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {todaysClasses.length === 0 ? (
            <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-center space-y-2">
              <Calendar className="w-9 h-9 text-zinc-600 mx-auto" />
              <p className="text-sm font-semibold text-zinc-300">No classes scheduled for today</p>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Use your free time for self-study, lab projects, or import a timetable PDF.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={() => onOpenQuickAdd('class')}
                  className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-medium transition-colors"
                >
                  + Add Class Manually
                </button>
                <button
                  onClick={() => onOpenPdfImport('timetable')}
                  className="px-3.5 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-xl text-xs font-medium transition-colors"
                >
                  Import Timetable PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysClasses.map((cls) => {
                const sMin = timeStringToMinutes(cls.startTime);
                const eMin = timeStringToMinutes(cls.endTime);
                const isCurrent = currentMinutes >= sMin && currentMinutes <= eMin;
                const isPast = currentMinutes > eMin;
                const parentSubj = subjects.find((s) => s.id === cls.subjectId);

                return (
                  <div
                    key={cls.id}
                    className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-indigo-950/20 border-indigo-500/40 ring-1 ring-indigo-500/20'
                        : isPast
                        ? 'bg-zinc-900/40 border-zinc-800/40 opacity-60'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center font-mono w-20 shrink-0">
                        <span className="text-sm font-bold text-zinc-100 block">
                          {formatTime12h(cls.startTime)}
                        </span>
                        <span className="text-xs text-zinc-400">
                          {formatTime12h(cls.endTime)}
                        </span>
                      </div>
                      <div
                        className="w-1.5 h-10 rounded-full"
                        style={{ backgroundColor: parentSubj?.color || cls.color || '#3B82F6' }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-zinc-100">{cls.title}</h3>
                          {isCurrent && (
                            <span className="text-xs bg-indigo-500 text-white font-semibold px-2 py-0.5 rounded-full animate-pulse">
                              NOW
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-300 mt-0.5">
                          {cls.room || 'Location TBA'} {cls.faculty ? `• ${cls.faculty}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-semibold text-zinc-300 bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-700">
                        {parentSubj?.code || 'CLASS'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Today's Study Tasks */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-semibold text-zinc-100">Study Tasks for Today</h2>
              </div>
              <button
                onClick={onOpenTimer}
                className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                Launch Focus Timer
              </button>
            </div>

            {pendingStudyTasks.length === 0 ? (
              <div className="p-5 bg-zinc-900/40 border border-zinc-800/60 rounded-xl text-center text-xs text-zinc-400">
                No study tasks logged for today. Click &ldquo;New Task&rdquo; to schedule a revision topic.
              </div>
            ) : (
              <div className="space-y-2">
                {pendingStudyTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleStudyTask(task.id)}
                        className="text-zinc-500 hover:text-emerald-400 transition-colors"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{task.title}</p>
                        {task.notes && <p className="text-xs text-zinc-400">{task.notes}</p>}
                      </div>
                    </div>
                    {task.durationMinutes && (
                      <span className="text-xs text-zinc-300 font-mono bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                        {task.durationMinutes}m
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Approaching Deadlines & Exams */}
        <div className="space-y-6">
          {/* Upcoming Examinations */}
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-semibold text-zinc-100">Upcoming Exams</h2>
              </div>
              <button
                onClick={() => onNavigate('exams')}
                className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
              >
                View All
              </button>
            </div>

            {upcomingExams.length === 0 ? (
              <p className="text-xs text-zinc-400">No exams currently scheduled.</p>
            ) : (
              <div className="space-y-3">
                {upcomingExams.map((ex) => {
                  const daysLeft = calculateDaysRemaining(ex.date, now);
                  const parentSubj = subjects.find((s) => s.id === ex.subjectId);
                  const subjProgress = calculateSubjectProgress(topics, ex.subjectId);

                  return (
                    <div
                      key={ex.id}
                      onClick={() => onNavigate('exams')}
                      className="p-3.5 bg-zinc-800/40 border border-zinc-700/50 rounded-xl space-y-2 hover:border-zinc-600 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-zinc-200 truncate">
                          {ex.title}
                        </span>
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                            daysLeft <= 3
                              ? 'bg-rose-500/20 text-rose-300'
                              : daysLeft <= 7
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {daysLeft === 0 ? 'TODAY' : `${daysLeft}d left`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-zinc-300">
                        <span>{ex.date} • {ex.startTime}</span>
                        <span>{subjProgress.percentage}% syllabus</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full"
                          style={{ width: `${subjProgress.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Academic Deadlines */}
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-semibold text-zinc-100">Approaching Deadlines</h2>
              </div>
              <button
                onClick={() => onNavigate('assignments')}
                className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
              >
                View All
              </button>
            </div>

            {pendingAssignments.length === 0 ? (
              <p className="text-xs text-zinc-400">No pending assignments! You are all caught up.</p>
            ) : (
              <div className="space-y-2.5">
                {pendingAssignments.map((asg) => {
                  const daysLeft = calculateDaysRemaining(asg.dueDate, now);
                  const isOverdue = daysLeft < 0;

                  return (
                    <div
                      key={asg.id}
                      className="p-3.5 bg-zinc-800/40 border border-zinc-700/50 rounded-xl flex items-start justify-between gap-3 hover:border-zinc-600 transition-all"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-zinc-200 line-clamp-1">
                          {asg.title}
                        </p>
                        <p className="text-xs text-zinc-300">
                          {asg.type} • Due: {asg.dueDate}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`text-xs font-mono px-2 py-0.5 rounded ${
                            isOverdue
                              ? 'bg-rose-500/20 text-rose-300 font-bold'
                              : daysLeft <= 2
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {isOverdue ? 'Overdue' : `${daysLeft}d left`}
                        </span>
                        <button
                          onClick={() => setAssignmentStatus(asg.id, 'completed')}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
                        >
                          Mark Done
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Academic Performance & Test Marks */}
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-semibold text-zinc-100">Test Marks & Performance</h2>
              </div>
              <button
                onClick={() => onNavigate('marks')}
                className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Open Tracker
              </button>
            </div>

            {testMarks.length === 0 ? (
              <p className="text-xs text-zinc-400">No test marks recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {/* Aggregate Pill */}
                <div className="p-3 bg-zinc-800/50 border border-zinc-700/60 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400 block">Weighted Score</span>
                    <span className="text-xl font-black text-zinc-100">
                      {marksSummary.weightedAveragePercentage}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${marksSummary.grade.badgeBg}`}>
                      Grade {marksSummary.grade.letter}
                    </span>
                    <span className="text-xs text-zinc-400 block mt-0.5">
                      {marksSummary.totalTests} tests recorded
                    </span>
                  </div>
                </div>

                {/* Recent 3 marks */}
                <div className="space-y-2">
                  {recentMarks.map((m) => {
                    const subj = subjects.find((s) => s.id === m.subjectId);
                    const pct = m.percentage ?? Math.round((m.marksObtained / m.maxMarks) * 100);
                    return (
                      <div
                        key={m.id}
                        onClick={() => onNavigate('marks')}
                        className="p-2.5 bg-zinc-800/30 border border-zinc-800 rounded-lg flex items-center justify-between text-xs hover:border-zinc-700 transition-colors cursor-pointer"
                      >
                        <div className="space-y-0.5 truncate pr-2">
                          <p className="font-medium text-zinc-200 truncate">{m.testName}</p>
                          <p className="text-zinc-400 text-xs truncate">
                            {subj?.name || 'Subject'} • {m.date}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-zinc-100">
                            {m.marksObtained}/{m.maxMarks}
                          </span>
                          <span className="text-indigo-400 font-semibold block text-xs">
                            {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Attendance & Safe Bunk Margin Widget */}
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-semibold text-zinc-100">Attendance & Bunks</h2>
              </div>
              <button
                onClick={() => setIsAttendanceOpen(true)}
                className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Bunk Calculator
              </button>
            </div>

            <div className="p-3.5 bg-zinc-800/50 border border-zinc-700/60 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-400 block">Semester Average</span>
                  <span className="text-xl font-black font-mono text-zinc-100">
                    {overallAttendance.overallPercentage}%
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded border ${
                      overallAttendance.status === 'safe'
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : overallAttendance.status === 'warning'
                        ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                        : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                    }`}
                  >
                    {overallAttendance.status === 'safe' ? 'Good Standing' : 'At Risk'}
                  </span>
                  <span className="text-xs text-zinc-400 block mt-0.5">
                    {overallAttendance.totalAttended} / {overallAttendance.totalHeld} attended
                  </span>
                </div>
              </div>

              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    overallAttendance.status === 'safe'
                      ? 'bg-emerald-500'
                      : overallAttendance.status === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, overallAttendance.overallPercentage)}%` }}
                />
              </div>

              <p className="text-xs text-zinc-300">
                Minimum policy threshold is 75%. Click to simulate safe bunks across your courses.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Academic Modals */}
      <AcademicTranscriptModal
        isOpen={isTranscriptOpen}
        onClose={() => setIsTranscriptOpen(false)}
      />

      <AttendanceBunkModal
        isOpen={isAttendanceOpen}
        onClose={() => setIsAttendanceOpen(false)}
      />
    </div>
  );
}
