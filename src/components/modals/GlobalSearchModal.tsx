import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  BookOpen,
  Calendar,
  CheckSquare,
  FolderKanban,
  GraduationCap,
  Award,
  Timer,
  X,
  ArrowRight,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export function GlobalSearchModal({ isOpen, onClose, onNavigate }: GlobalSearchModalProps) {
  const { subjects, chapters, topics, classes, assignments, projects, exams, testMarks, studyTasks } =
    useAcademic();
  const [query, setQuery] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  // Search aggregations
  const results: Array<{
    id: string;
    type: 'subject' | 'topic' | 'class' | 'assignment' | 'project' | 'exam' | 'mark' | 'studyTask';
    title: string;
    subtitle: string;
    navTab: string;
    icon: any;
  }> = [];

  if (q.length > 0) {
    // Subjects
    subjects
      .filter((s) => s.name.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q))
      .forEach((s) => {
        results.push({
          id: s.id,
          type: 'subject',
          title: s.name,
          subtitle: `Subject (${s.code || 'No code'}) • ${s.semester || 'Current Semester'}`,
          navTab: 'subjects',
          icon: BookOpen,
        });
      });

    // Topics
    topics
      .filter((t) => t.title.toLowerCase().includes(q) || t.notes?.toLowerCase().includes(q))
      .slice(0, 5)
      .forEach((t) => {
        const parentSubj = subjects.find((s) => s.id === t.subjectId);
        results.push({
          id: t.id,
          type: 'topic',
          title: t.title,
          subtitle: `Topic in ${parentSubj?.name || 'Syllabus'} • Status: ${t.status.replace('_', ' ')}`,
          navTab: 'subjects',
          icon: BookOpen,
        });
      });

    // Classes
    classes
      .filter((c) => c.title.toLowerCase().includes(q) || c.room?.toLowerCase().includes(q))
      .forEach((c) => {
        results.push({
          id: c.id,
          type: 'class',
          title: c.title,
          subtitle: `Timetable • ${c.startTime} - ${c.endTime} (${c.room || 'TBA'})`,
          navTab: 'timetable',
          icon: Calendar,
        });
      });

    // Assignments
    assignments
      .filter((a) => a.title.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q))
      .forEach((a) => {
        results.push({
          id: a.id,
          type: 'assignment',
          title: a.title,
          subtitle: `Assignment • Due: ${a.dueDate} (${a.status.replace('_', ' ')})`,
          navTab: 'assignments',
          icon: CheckSquare,
        });
      });

    // Projects
    projects
      .filter((p) => p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
      .forEach((p) => {
        results.push({
          id: p.id,
          type: 'project',
          title: p.title,
          subtitle: `Project • ${p.projectType} • Deadline: ${p.deadline}`,
          navTab: 'projects',
          icon: FolderKanban,
        });
      });

    // Exams
    exams
      .filter((e) => e.title.toLowerCase().includes(q) || e.center?.toLowerCase().includes(q))
      .forEach((e) => {
        results.push({
          id: e.id,
          type: 'exam',
          title: e.title,
          subtitle: `Examination • Date: ${e.date} at ${e.startTime}`,
          navTab: 'exams',
          icon: GraduationCap,
        });
      });

    // Test Marks & Grades
    testMarks
      .filter((m) => m.testName.toLowerCase().includes(q) || m.remarks?.toLowerCase().includes(q) || m.topicsCovered?.toLowerCase().includes(q))
      .forEach((m) => {
        const parentSubj = subjects.find((s) => s.id === m.subjectId);
        results.push({
          id: m.id,
          type: 'mark',
          title: m.testName,
          subtitle: `Test Mark in ${parentSubj?.name || 'Subject'} • Score: ${m.marksObtained}/${m.maxMarks} (${m.grade ? `Grade ${m.grade}` : `${m.percentage}%`})`,
          navTab: 'marks',
          icon: Award,
        });
      });

    // Study tasks
    studyTasks
      .filter((st) => st.title.toLowerCase().includes(q))
      .forEach((st) => {
        results.push({
          id: st.id,
          type: 'studyTask',
          title: st.title,
          subtitle: `Study Task • Date: ${st.date} • ${st.status}`,
          navTab: 'home',
          icon: Timer,
        });
      });
  }

  const handleSelect = (navTab: string) => {
    onNavigate(navTab);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="global-search-title"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/70 backdrop-blur-xs p-4"
    >
      <div className="bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            id="global-search-title"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects, topics, assignments, classes, exams..."
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear query"
              className="text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
            ESC
          </span>
        </div>

        {/* Results Body */}
        <div className="max-h-80 overflow-y-auto p-2">
          {query.trim().length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-400">
              Type keywords to search across your whole semester syllabus, timetable, and deadlines.
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-400">
              No matching academic records found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelect(item.navTab)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/80 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-zinc-800 text-zinc-400 group-hover:text-zinc-100 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-100 truncate">{item.title}</p>
                        <p className="text-xs text-zinc-400 truncate">{item.subtitle}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
