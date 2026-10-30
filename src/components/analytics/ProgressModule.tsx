import React from 'react';
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import {
  calculateOverallSyllabusProgress,
  calculateSubjectProgress,
} from '../../utils/academicCalculations';

interface ProgressModuleProps {
  onNavigate: (tab: string) => void;
}

export function ProgressModule({ onNavigate }: ProgressModuleProps) {
  const { subjects, chapters, topics, assignments, exams, studyTasks } = useAcademic();

  const activeSubjects = subjects.filter((s) => !s.isArchived);
  const overallProgress = calculateOverallSyllabusProgress(subjects, topics);

  const completedTopics = topics.filter((t) => t.status === 'completed').length;
  const inProgressTopics = topics.filter((t) => t.status === 'in_progress').length;
  const notStartedTopics = topics.filter((t) => t.status === 'not_started').length;
  const revisionTopics = topics.filter((t) => t.status === 'needs_revision');

  const completedAssignments = assignments.filter(
    (a) => a.status === 'completed' || a.status === 'submitted'
  ).length;
  const pendingAssignments = assignments.length - completedAssignments;

  const completedStudyTasks = studyTasks.filter((st) => st.status === 'completed').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Toolbar */}
      <div className="pb-4 border-b border-zinc-800">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
          Academic Progress & Syllabus Analytics
        </h1>
        <p className="text-sm text-zinc-400 mt-1.5">
          Deterministic syllabus completion metrics, subject breakdowns, and revision queues
        </p>
      </div>

      {/* 2. Primary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2.5">
          <span className="text-xs sm:text-sm font-semibold text-zinc-400">Total Syllabus Covered</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-mono font-bold text-zinc-100">
              {overallProgress.percentage}%
            </span>
          </div>
          <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallProgress.percentage}%` }}
            />
          </div>
          <p className="text-xs text-zinc-400">
            {overallProgress.completedTopics} of {overallProgress.totalTopics} active topics
          </p>
        </div>

        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2.5">
          <span className="text-xs sm:text-sm font-semibold text-zinc-400">Assignments Completed</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-mono font-bold text-emerald-400">
              {completedAssignments}
            </span>
            <span className="text-xs sm:text-sm text-zinc-400">/ {assignments.length} total</span>
          </div>
          <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{
                width: assignments.length > 0 ? `${(completedAssignments / assignments.length) * 100}%` : '0%',
              }}
            />
          </div>
          <p className="text-xs text-zinc-400">{pendingAssignments} pending deadlines</p>
        </div>

        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2.5">
          <span className="text-xs sm:text-sm font-semibold text-zinc-400">Revision Backlog</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-mono font-bold text-amber-400">
              {revisionTopics.length}
            </span>
            <span className="text-xs sm:text-sm text-zinc-400">topics</span>
          </div>
          <p className="text-xs text-zinc-400">Flagged by student as needing review</p>
        </div>

        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-2.5">
          <span className="text-xs sm:text-sm font-semibold text-zinc-400">Study Sessions Logged</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-mono font-bold text-blue-400">
              {completedStudyTasks}
            </span>
            <span className="text-xs sm:text-sm text-zinc-400">sessions</span>
          </div>
          <p className="text-xs text-zinc-400">Pomodoro and problem sets completed</p>
        </div>
      </div>

      {/* 3. Subject-by-Subject Progress Breakdown */}
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-6">
        <h2 className="text-sm sm:text-base font-bold text-zinc-100 uppercase tracking-wider">
          Subject-Level Syllabus Readiness
        </h2>

        <div className="space-y-4">
          {activeSubjects.map((s) => {
            const prog = calculateSubjectProgress(topics, s.id);
            return (
              <div
                key={s.id}
                onClick={() => onNavigate('subjects')}
                className="p-4 bg-zinc-800/40 border border-zinc-700/50 rounded-xl space-y-2.5 hover:border-zinc-600 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: s.color || '#3B82F6' }}
                    />
                    <h3 className="text-sm sm:text-base font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors">
                      {s.name}
                    </h3>
                    {s.code && (
                      <span className="text-xs font-mono text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                        {s.code}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-mono font-bold text-zinc-100">
                      {prog.percentage}%
                    </span>
                    <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-200" />
                  </div>
                </div>

                <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${prog.percentage}%`,
                      backgroundColor: s.color || '#3B82F6',
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-400 flex-wrap gap-2">
                  <span>
                    {prog.completed} completed • {prog.inProgress} in progress • {prog.needsRevision} revision
                  </span>
                  <span className="font-medium text-zinc-300">{prog.total} topics total</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Revision Backlog List */}
      {revisionTopics.length > 0 && (
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm sm:text-base font-bold text-zinc-100 uppercase tracking-wider">
                Topics Requiring Revision ({revisionTopics.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigate('subjects')}
              className="text-xs sm:text-sm text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Open Syllabus
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {revisionTopics.map((top) => {
              const subj = subjects.find((s) => s.id === top.subjectId);
              return (
                <div
                  key={top.id}
                  className="p-3.5 bg-zinc-800/40 border border-zinc-700/60 rounded-xl flex items-center justify-between text-sm"
                >
                  <div>
                    <p className="font-semibold text-zinc-200">{top.title}</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {subj?.name} {top.revisionCount ? `• Reviewed ${top.revisionCount} times` : ''}
                    </p>
                  </div>
                  {top.difficulty && (
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {top.difficulty}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
