import React from 'react';
import {
  LayoutDashboard,
  CalendarClock,
  BookOpen,
  CheckSquare,
  FolderKanban,
  GraduationCap,
  Award,
  BarChart3,
  Timer,
  Settings,
  HelpCircle,
  Building,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { calculateOverallSyllabusProgress } from '../../utils/academicCalculations';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenShortcuts?: () => void;
}

export function Sidebar({ currentTab, onSelectTab, onOpenShortcuts }: SidebarProps) {
  const { subjects, topics, assignments, classes, exams, projects, testMarks, profile } =
    useAcademic();

  const syllabusProgress = calculateOverallSyllabusProgress(subjects, topics);
  const pendingAssignments = assignments.filter(
    (a) => a.status !== 'completed' && a.status !== 'submitted'
  ).length;
  const activeExams = exams.length;

  const primaryItems = [
    { id: 'home', label: 'Home', icon: LayoutDashboard, badge: null },
    {
      id: 'timetable',
      label: 'Timetable',
      icon: CalendarClock,
      badge: classes.length > 0 ? `${classes.length}` : null,
    },
    {
      id: 'subjects',
      label: 'Subjects',
      icon: BookOpen,
      badge: subjects.length > 0 ? `${subjects.length}` : null,
    },
    {
      id: 'marks',
      label: 'Test Marks',
      icon: Award,
      badge: testMarks.length > 0 ? `${testMarks.length}` : null,
      badgeColor: 'text-amber-400 bg-amber-400/10',
    },
    {
      id: 'assignments',
      label: 'Assignments',
      icon: CheckSquare,
      badge: pendingAssignments > 0 ? `${pendingAssignments}` : null,
      badgeColor: 'text-amber-400 bg-amber-400/10',
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FolderKanban,
      badge: projects.length > 0 ? `${projects.length}` : null,
    },
    {
      id: 'exams',
      label: 'Exams',
      icon: GraduationCap,
      badge: activeExams > 0 ? `${activeExams}` : null,
      badgeColor: 'text-rose-400 bg-rose-400/10',
    },
  ];

  const secondaryItems = [
    { id: 'progress', label: 'Academic Progress', icon: BarChart3 },
    { id: 'study', label: 'Study & Revision', icon: Timer },
    { id: 'settings', label: 'Settings & Cloud', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col h-screen select-none shrink-0 hidden md:flex">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md shadow-indigo-600/30">
            S
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-zinc-100">Studious</span>
              <span className="text-xs font-bold tracking-wider uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                PRO
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium truncate max-w-[140px]">
              {profile.institution || 'Structure Your Semester'}
            </p>
          </div>
        </div>
      </div>

      {/* Active Academic Workspace Pill */}
      <div className="px-4 pt-3 pb-1">
        <div className="p-2.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Building className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <div className="truncate">
              <span className="font-semibold text-zinc-200 block truncate">
                {profile.degree || 'B.Tech CS Engineering'}
              </span>
              <span className="text-[11px] text-zinc-400">
                {profile.semester || 'Semester 5'} • {profile.academicTerm || 'Fall 2026'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {/* Core Navigation */}
        <div className="space-y-1">
          <p className="px-3 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Academic Modules
          </p>
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-medium ${
                      item.badgeColor || 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary Navigation */}
        <div className="space-y-1">
          <p className="px-3 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Tools & Management
          </p>
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Syllabus Completion Summary Card & Keyboard Shortcut Hint */}
      <div className="p-3.5 border-t border-zinc-800/80 bg-zinc-950 space-y-2.5">
        <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Syllabus Progress</span>
            <span className="font-mono font-bold text-zinc-100">{syllabusProgress.percentage}%</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${syllabusProgress.percentage}%` }}
            />
          </div>
          <p className="text-[11px] text-zinc-400">
            {syllabusProgress.completedTopics} of {syllabusProgress.totalTopics} topics completed
          </p>
        </div>

        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
              Keyboard Shortcuts
            </span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 border border-zinc-700 rounded text-zinc-400">
              ?
            </kbd>
          </button>
        )}
      </div>
    </aside>
  );
}
