import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  Calendar,
  AlertTriangle,
  ExternalLink,
  Trash2,
  Edit2,
  CheckCircle2,
  Send,
  Filter,
  Check,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { calculateDaysRemaining, formatTime12h } from '../../utils/academicCalculations';
import { Assignment, AssignmentStatus, AssignmentPriority } from '../../types';

interface AssignmentsModuleProps {
  onOpenQuickAdd: (type?: any) => void;
}

export function AssignmentsModule({ onOpenQuickAdd }: AssignmentsModuleProps) {
  const {
    assignments,
    subjects,
    setAssignmentStatus,
    toggleSubtask,
    deleteAssignment,
    updateAssignment,
    addToast,
  } = useAcademic();

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Editing assignment state
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [submissionUrlInput, setSubmissionUrlInput] = useState<string>('');

  const now = new Date();

  // Filtered and sorted
  const filteredAssignments = assignments
    .filter((a) => {
      if (selectedSubjectFilter !== 'all' && a.subjectId !== selectedSubjectFilter) return false;
      if (selectedStatusFilter !== 'all' && a.status !== selectedStatusFilter) return false;
      if (selectedPriorityFilter !== 'all' && a.priority !== selectedPriorityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  // Check for clustered deadlines (multiple assignments due within 2 days of each other)
  const clusteredDeadlines = (() => {
    const dates = assignments.map((a) => a.dueDate);
    const counts: Record<string, number> = {};
    dates.forEach((d) => {
      counts[d] = (counts[d] || 0) + 1;
    });
    return Object.entries(counts).filter(([_, count]) => count >= 2);
  })();

  const handleSaveSubmissionUrl = async (asgId: string) => {
    if (!submissionUrlInput.trim()) return;
    await updateAssignment(asgId, { submissionUrl: submissionUrlInput.trim() });
    setEditingAssignment(null);
    setSubmissionUrlInput('');
    addToast({ type: 'success', title: 'Submission Link Recorded' });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Assignments & Homework
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Track lab reports, presentations, problem sets, subtasks, and submission links
          </p>
        </div>

        <button
          onClick={() => onOpenQuickAdd('assignment')}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-lg shadow-indigo-600/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Assignment</span>
        </button>
      </div>

      {/* 2. Clustered Deadlines Alert */}
      {clusteredDeadlines.length > 0 && (
        <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center gap-3 text-xs text-zinc-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Workload Notice:</strong> You have multiple deadlines due on{' '}
            {clusteredDeadlines.map(([d, count]) => `${d} (${count} tasks)`).join(', ')}. Plan ahead to balance your time.
          </span>
        </div>
      )}

      {/* 3. Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {/* Subject Filter */}
        <select
          value={selectedSubjectFilter}
          onChange={(e) => setSelectedSubjectFilter(e.target.value)}
          className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300"
        >
          <option value="all">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatusFilter}
          onChange={(e) => setSelectedStatusFilter(e.target.value)}
          className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300"
        >
          <option value="all">All Statuses</option>
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="submitted">Submitted</option>
        </select>

        {/* Priority Filter */}
        <select
          value={selectedPriorityFilter}
          onChange={(e) => setSelectedPriorityFilter(e.target.value)}
          className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Search */}
        <input
          type="text"
          placeholder="Search assignments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 sm:max-w-xs px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-500"
        />
      </div>

      {/* 4. Assignments Grid / List */}
      {filteredAssignments.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900 border border-zinc-800 rounded-2xl">
          <CheckSquare className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-200">No Assignments Found</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
            No assignments match your filter criteria or none have been recorded yet.
          </p>
          <button
            onClick={() => onOpenQuickAdd('assignment')}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
          >
            Create Assignment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAssignments.map((asg) => {
            const parentSubj = subjects.find((s) => s.id === asg.subjectId);
            const daysLeft = calculateDaysRemaining(asg.dueDate, now);
            const isOverdue = daysLeft < 0 && asg.status !== 'completed' && asg.status !== 'submitted';
            const isFinished = asg.status === 'completed' || asg.status === 'submitted';

            return (
              <div
                key={asg.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  isFinished
                    ? 'bg-zinc-900/50 border-zinc-800/60 opacity-80'
                    : isOverdue
                    ? 'bg-rose-950/10 border-rose-500/30 ring-1 ring-rose-500/20'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Top Section */}
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: parentSubj?.color || '#3B82F6' }}
                      />
                      <span className="text-xs font-mono text-zinc-300 font-semibold">
                        {parentSubj?.code || parentSubj?.name || 'COURSE'}
                      </span>
                      <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                        {asg.type}
                      </span>
                    </div>

                    {/* Priority Badge */}
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        asg.priority === 'urgent'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : asg.priority === 'high'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {asg.priority}
                    </span>
                  </div>

                  <h3
                    className={`text-base font-semibold leading-snug ${
                      isFinished ? 'line-through text-zinc-400' : 'text-zinc-100'
                    }`}
                  >
                    {asg.title}
                  </h3>

                  {asg.description && (
                    <p className="text-sm text-zinc-300 line-clamp-2 leading-relaxed">
                      {asg.description}
                    </p>
                  )}

                  {/* Subtasks Checklist */}
                  {asg.subtasks && asg.subtasks.length > 0 && (
                    <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
                      <p className="text-xs font-semibold text-zinc-300">
                        Checklist ({asg.subtasks.filter((s) => s.isCompleted).length}/
                        {asg.subtasks.length})
                      </p>
                      <div className="space-y-1">
                        {asg.subtasks.map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => toggleSubtask(asg.id, st.id)}
                            className="w-full flex items-center gap-2 text-left text-xs sm:text-sm py-1 group"
                          >
                            <span
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                st.isCompleted
                                  ? 'bg-emerald-600 border-emerald-500 text-white'
                                  : 'border-zinc-700 bg-zinc-800 text-transparent'
                              }`}
                            >
                              <Check className="w-3 h-3" />
                            </span>
                            <span
                              className={`truncate text-xs sm:text-sm ${
                                st.isCompleted
                                  ? 'text-zinc-500 line-through'
                                  : 'text-zinc-200 group-hover:text-zinc-100'
                              }`}
                            >
                              {st.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submission link if recorded */}
                  {asg.submissionUrl && (
                    <div className="pt-1">
                      <a
                        href={asg.submissionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Submission URL
                      </a>
                    </div>
                  )}
                </div>

                {/* Bottom Section: Due date & Status change */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    <span>
                      {asg.dueDate} {asg.dueTime ? `at ${asg.dueTime}` : ''}
                    </span>
                    <span
                      className={`ml-1 font-mono font-medium px-2 py-0.5 rounded text-xs ${
                        isOverdue
                          ? 'bg-rose-500/20 text-rose-300 font-bold'
                          : daysLeft <= 2 && !isFinished
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {isOverdue ? 'OVERDUE' : isFinished ? 'DONE' : `${daysLeft}d left`}
                    </span>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <select
                      value={asg.status}
                      onChange={(e) =>
                        setAssignmentStatus(asg.id, e.target.value as AssignmentStatus)
                      }
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${
                        asg.status === 'submitted'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : asg.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : asg.status === 'in_progress'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="submitted">Submitted</option>
                    </select>

                    <button
                      onClick={() => deleteAssignment(asg.id)}
                      className="p-1 text-zinc-500 hover:text-rose-400 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
