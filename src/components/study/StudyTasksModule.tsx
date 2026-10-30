import React, { useState } from 'react';
import {
  Timer,
  Plus,
  Play,
  CheckCircle2,
  Calendar,
  Clock,
  Trash2,
  BookOpen,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { formatTime12h } from '../../utils/academicCalculations';

interface StudyTasksModuleProps {
  onOpenQuickAdd: (type?: any) => void;
  onOpenTimer: () => void;
}

export function StudyTasksModule({ onOpenQuickAdd, onOpenTimer }: StudyTasksModuleProps) {
  const { studyTasks, subjects, topics, toggleStudyTask, deleteStudyTask } = useAcademic();
  const [filter, setFilter] = useState<'pending' | 'completed' | 'all'>('pending');

  const filteredTasks = studyTasks.filter((t) => {
    if (filter === 'pending') return t.status === 'pending';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
            Study Tasks & Revision Sessions
          </h1>
          <p className="text-sm text-zinc-400 mt-1.5">
            Personal topic revision, problem set intervals, and focused study blocks
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenTimer}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-xl text-sm font-medium transition-colors"
          >
            <Timer className="w-4 h-4" />
            <span>Open Focus Timer</span>
          </button>

          <button
            onClick={() => onOpenQuickAdd('task')}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Study Task</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="flex items-center gap-2 text-sm">
        {(['pending', 'completed', 'all'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-2 rounded-xl font-medium capitalize transition-all ${
              filter === tab
                ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab} Tasks
          </button>
        ))}
      </div>

      {/* 3. Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900 border border-zinc-800 rounded-2xl">
          <Timer className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-200">No Study Tasks</h3>
          <p className="text-sm text-zinc-400 max-w-sm mx-auto mt-1.5">
            Schedule a self-study session or link a topic needing revision.
          </p>
          <button
            onClick={() => onOpenQuickAdd('task')}
            className="mt-4 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold"
          >
            Add Study Task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isDone = task.status === 'completed';
            const parentSubj = subjects.find((s) => s.id === task.subjectId);
            const linkedTopic = topics.find((t) => t.id === task.linkedTopicId);

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                  isDone
                    ? 'bg-zinc-900/40 border-zinc-800/60 opacity-60'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <button
                    onClick={() => toggleStudyTask(task.id)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'border-zinc-700 bg-zinc-800 text-transparent hover:border-zinc-500'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="min-w-0 space-y-1">
                    <p
                      className={`text-sm sm:text-base font-semibold truncate ${
                        isDone ? 'line-through text-zinc-500' : 'text-zinc-100'
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400 flex-wrap">
                      {parentSubj && (
                        <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: parentSubj.color || '#3B82F6' }}
                          />
                          {parentSubj.name}
                        </span>
                      )}
                      {linkedTopic && <span>• Topic: {linkedTopic.title}</span>}
                      <span>• Date: {task.date}</span>
                      {task.startTime && <span>at {formatTime12h(task.startTime)}</span>}
                    </div>
                    {task.notes && (
                      <p className="text-xs text-zinc-400 italic truncate">{task.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {task.durationMinutes && (
                    <span className="text-xs font-mono font-medium text-zinc-300 bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700">
                      {task.durationMinutes}m duration
                    </span>
                  )}
                  <button
                    onClick={() => deleteStudyTask(task.id)}
                    className="p-2 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
