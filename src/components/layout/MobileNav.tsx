import React, { useState } from 'react';
import {
  LayoutDashboard,
  CalendarClock,
  BookOpen,
  CheckSquare,
  FolderKanban,
  GraduationCap,
  Award,
  MoreHorizontal,
  BarChart3,
  Timer,
  Settings,
  X,
  Cloud,
  LogIn,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { calculateOverallSyllabusProgress } from '../../utils/academicCalculations';

interface MobileNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export function MobileNav({ currentTab, onSelectTab }: MobileNavProps) {
  const { user, profile, subjects, topics, assignments, exams, testMarks, signInWithGoogle, signOutUser } =
    useAcademic();
  const [showMore, setShowMore] = useState(false);

  const pendingAssignments = assignments.filter(
    (a) => a.status !== 'completed' && a.status !== 'submitted'
  ).length;
  const overallProgress = calculateOverallSyllabusProgress(subjects, topics);

  const primaryItems = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'timetable', label: 'Timetable', icon: CalendarClock },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'assignments', label: 'Tasks', icon: CheckSquare, badge: pendingAssignments },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
  ];

  const moreItems = [
    {
      id: 'marks',
      label: 'Test Marks & Grades',
      desc: 'Subject tests, internal marks & grade calculator',
      icon: Award,
      badge: `${testMarks.length} tests`,
      badgeColor: 'text-amber-400 bg-amber-400/10',
    },
    {
      id: 'exams',
      label: 'Examinations',
      desc: 'Hall ticket & countdown',
      icon: GraduationCap,
      badge: `${exams.length} exams`,
      badgeColor: 'text-amber-400 bg-amber-400/10',
    },
    {
      id: 'progress',
      label: 'Academic Progress',
      desc: `${overallProgress.percentage}% syllabus completed`,
      icon: BarChart3,
      badge: `${overallProgress.percentage}%`,
      badgeColor: 'text-indigo-400 bg-indigo-500/10',
    },
    {
      id: 'study',
      label: 'Study Tasks & Timer',
      desc: 'Pomodoro & revision blocks',
      icon: Timer,
    },
    {
      id: 'settings',
      label: 'Settings & Data Backup',
      desc: 'Profile, JSON export & cloud sync',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Bottom Sheet Drawer */}
      {showMore && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="More navigation options"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex flex-col justify-end md:hidden animate-in fade-in duration-200"
          onClick={() => setShowMore(false)}
        >
          <div
            className="bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab Handle */}
            <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm">
                  S
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-100">Academic Workspace</h3>
                  <p className="text-xs text-zinc-400">All tools and settings</p>
                </div>
              </div>
              <button
                onClick={() => setShowMore(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* More navigation options list */}
            <div className="space-y-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      setShowMore(false);
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                      isActive
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                        : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-indigo-400 shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-100">{item.label}</p>
                        <p className="text-xs text-zinc-400">{item.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span
                          className={`text-xs font-mono px-2.5 py-0.5 rounded-full font-bold ${
                            item.badgeColor || 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-zinc-500" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* User Profile & Auth in bottom sheet */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-200 truncate max-w-[200px]">
                  {profile.name}
                </p>
                <p className="text-xs text-zinc-400 truncate max-w-[200px]">
                  {user ? user.email : 'Guest Mode (Local Storage)'}
                </p>
              </div>

              {user ? (
                <button
                  onClick={signOutUser}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold hover:text-rose-400"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Tab Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 h-16 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800/80 flex items-center justify-around px-1 z-30 md:hidden"
      >
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl transition-all relative ${
                isActive ? 'text-indigo-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2.5 min-w-4.5 h-4.5 px-1 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center leading-none shadow-xs">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-xs font-medium tracking-tight">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0.5 w-5 h-0.5 rounded-full bg-indigo-500" />
              )}
            </button>
          );
        })}

        {/* More Tab Button */}
        <button
          onClick={() => setShowMore(true)}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl transition-all relative ${
            ['exams', 'progress', 'study', 'settings'].includes(currentTab)
              ? 'text-indigo-400 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <MoreHorizontal className="w-5 h-5 stroke-2" />
          <span className="text-xs font-medium tracking-tight">More</span>
          {['exams', 'progress', 'study', 'settings'].includes(currentTab) && (
            <span className="absolute bottom-0.5 w-5 h-0.5 rounded-full bg-indigo-500" />
          )}
        </button>
      </nav>
    </>
  );
}
