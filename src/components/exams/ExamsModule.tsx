import React, { useState } from 'react';
import {
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  FileUp,
  Plus,
  BookOpen,
  Trash2,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import {
  calculateDaysRemaining,
  calculateSubjectProgress,
  formatTime12h,
} from '../../utils/academicCalculations';

interface ExamsModuleProps {
  onOpenPdfImport: (type?: any) => void;
  onOpenQuickAdd: (type?: any) => void;
  onNavigate: (tab: string) => void;
}

export function ExamsModule({ onOpenPdfImport, onOpenQuickAdd, onNavigate }: ExamsModuleProps) {
  const { exams, subjects, topics, deleteExam } = useAcademic();
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');

  const now = new Date();

  // Sort exams chronologically
  const sortedExams = [...exams].sort((a, b) => a.date.localeCompare(b.date));
  const currentExam = exams.find((e) => e.id === selectedExamId) || sortedExams[0];

  // Linked subject and syllabus topics for the selected exam
  const linkedSubject = currentExam ? subjects.find((s) => s.id === currentExam.subjectId) : null;
  const linkedTopics = linkedSubject ? topics.filter((t) => t.subjectId === linkedSubject.id) : [];
  const subjectProgress = linkedSubject
    ? calculateSubjectProgress(topics, linkedSubject.id)
    : { total: 0, completed: 0, inProgress: 0, needsRevision: 0, percentage: 0 };

  const incompleteTopics = linkedTopics.filter((t) => t.status !== 'completed');
  const revisionTopics = linkedTopics.filter((t) => t.status === 'needs_revision');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
            Examinations & Hall Ticket Schedule
          </h1>
          <p className="text-sm text-zinc-400 mt-1.5">
            Exam dates, reporting times, centers, countdowns, and linked syllabus readiness
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenPdfImport('hallticket')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-xl text-sm font-medium transition-colors"
          >
            <FileUp className="w-4 h-4" />
            <span>Upload Hall Ticket PDF</span>
          </button>

          <button
            onClick={() => onOpenQuickAdd('exam')}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Exam</span>
          </button>
        </div>
      </div>

      {/* 2. Exams Grid & Detailed Workspace */}
      {sortedExams.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900 border border-zinc-800 rounded-2xl">
          <GraduationCap className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-200">No Examinations Scheduled</h3>
          <p className="text-sm text-zinc-400 max-w-sm mx-auto mt-1.5">
            Upload your official examination hall ticket / admit card or schedule an exam manually.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={() => onOpenPdfImport('hallticket')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold"
            >
              Upload Hall Ticket PDF
            </button>
            <button
              onClick={() => onOpenQuickAdd('exam')}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-sm font-semibold"
            >
              Add Manually
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Exam List Cards */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Scheduled Exams ({sortedExams.length})
            </p>
            {sortedExams.map((ex) => {
              const isSelected = ex.id === currentExam?.id;
              const daysLeft = calculateDaysRemaining(ex.date, now);
              const parentSubj = subjects.find((s) => s.id === ex.subjectId);

              return (
                <div
                  key={ex.id}
                  onClick={() => setSelectedExamId(ex.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-zinc-800 border-zinc-700 shadow-md ring-1 ring-zinc-700'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                      {ex.examType}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md ${
                        daysLeft < 0
                          ? 'bg-zinc-800 text-zinc-500'
                          : daysLeft <= 3
                          ? 'bg-rose-500/20 text-rose-300'
                          : daysLeft <= 7
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {daysLeft < 0 ? 'COMPLETED' : daysLeft === 0 ? 'TODAY' : `${daysLeft}d left`}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-zinc-100">{ex.title}</h3>

                  <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      {ex.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      {formatTime12h(ex.startTime)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right 2 Columns: Detailed Exam Hub */}
          {currentExam && (
            <div className="lg:col-span-2 space-y-6">
              {/* Exam Info Card */}
              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="text-indigo-400 font-bold uppercase tracking-wider">
                        {currentExam.examType} Exam
                      </span>
                      <span>•</span>
                      <span>Paper Code: {currentExam.courseCode || linkedSubject?.code || 'N/A'}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 mt-1.5">{currentExam.title}</h2>
                  </div>

                  <button
                    onClick={() => deleteExam(currentExam.id)}
                    className="p-2.5 text-zinc-500 hover:text-rose-400 bg-zinc-800 rounded-xl"
                    title="Delete Exam"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Exam Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3.5 bg-zinc-800/40 rounded-xl border border-zinc-700/50">
                    <span className="text-xs uppercase font-bold text-zinc-400 block">Exam Date</span>
                    <span className="text-sm font-mono font-bold text-zinc-200 mt-1 block">
                      {currentExam.date}
                    </span>
                  </div>
                  <div className="p-3.5 bg-zinc-800/40 rounded-xl border border-zinc-700/50">
                    <span className="text-xs uppercase font-bold text-zinc-400 block">Exam Time</span>
                    <span className="text-sm font-mono font-bold text-zinc-200 mt-1 block">
                      {formatTime12h(currentExam.startTime)} {currentExam.endTime ? `- ${formatTime12h(currentExam.endTime)}` : ''}
                    </span>
                  </div>
                  <div className="p-3.5 bg-zinc-800/40 rounded-xl border border-zinc-700/50">
                    <span className="text-xs uppercase font-bold text-zinc-400 block">Reporting Time</span>
                    <span className="text-sm font-mono font-bold text-amber-400 mt-1 block">
                      {currentExam.reportingTime ? formatTime12h(currentExam.reportingTime) : '30 mins before'}
                    </span>
                  </div>
                  <div className="p-3.5 bg-zinc-800/40 rounded-xl border border-zinc-700/50">
                    <span className="text-xs uppercase font-bold text-zinc-400 block">Seat / Room</span>
                    <span className="text-sm font-bold text-zinc-200 mt-1 block truncate">
                      {currentExam.room || 'Campus Center'}
                    </span>
                  </div>
                </div>

                {/* Center & Instructions */}
                {(currentExam.center || currentExam.instructions) && (
                  <div className="p-4 bg-zinc-800/30 border border-zinc-700/40 rounded-xl text-sm space-y-1.5">
                    {currentExam.center && (
                      <p className="text-zinc-200">
                        <strong className="text-zinc-100">Examination Center:</strong> {currentExam.center}
                      </p>
                    )}
                    {currentExam.instructions && (
                      <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                        <strong className="text-zinc-100">Instructions:</strong> {currentExam.instructions}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Linked Syllabus Preparation Card */}
              {linkedSubject && (
                <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-sm font-semibold text-zinc-100">
                        Syllabus Readiness for {linkedSubject.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => onNavigate('subjects')}
                      className="text-xs sm:text-sm text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                    >
                      Open Subject Syllabus <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-zinc-400">Preparation Progress</span>
                      <span className="font-mono font-bold text-zinc-100">
                        {subjectProgress.percentage}% ({subjectProgress.completed}/{subjectProgress.total} topics)
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${subjectProgress.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Incomplete topics needing attention */}
                  {incompleteTopics.length > 0 && (
                    <div className="pt-2">
                      <p className="text-sm font-semibold text-zinc-200 mb-2">
                        Topics to Complete Before Exam ({incompleteTopics.length})
                      </p>
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {incompleteTopics.map((top) => (
                          <div
                            key={top.id}
                            className="p-3 bg-zinc-800/40 border border-zinc-700/50 rounded-xl flex items-center justify-between text-sm"
                          >
                            <span className="text-zinc-200 truncate font-medium">{top.title}</span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded font-mono font-semibold ${
                                top.status === 'needs_revision'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {top.status.replace('_', ' ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
