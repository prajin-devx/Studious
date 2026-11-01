import React, { useState, useEffect, useRef } from 'react';
import { AcademicProvider, useAcademic } from './context/AcademicContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Modules
import { HomeDashboard } from './components/home/HomeDashboard';
import { TimetableModule } from './components/timetable/TimetableModule';
import { SubjectsModule } from './components/subjects/SubjectsModule';
import { AssignmentsModule } from './components/assignments/AssignmentsModule';
import { ProjectsModule } from './components/projects/ProjectsModule';
import { ExamsModule } from './components/exams/ExamsModule';
import { MarksModule } from './components/marks/MarksModule';
import { StudyTasksModule } from './components/study/StudyTasksModule';
import { ProgressModule } from './components/analytics/ProgressModule';
import { SettingsModule } from './components/settings/SettingsModule';

// Modals
import { QuickAddModal } from './components/modals/QuickAddModal';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { FocusTimerModal } from './components/modals/FocusTimerModal';
import { PdfImportModal } from './components/modals/PdfImportModal';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { KeyboardShortcutsModal } from './components/modals/KeyboardShortcutsModal';
import { AcademicTranscriptModal } from './components/modals/AcademicTranscriptModal';
import { AttendanceBunkModal } from './components/modals/AttendanceBunkModal';

function AppContent() {
  const { toasts, removeToast } = useAcademic();

  const [currentTab, setCurrentTab] = useState<string>('home');

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddTab, setQuickAddTab] = useState<any>('task');
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isPdfImportOpen, setIsPdfImportOpen] = useState(false);
  const [pdfImportDocType, setPdfImportDocType] = useState<any>('timetable');
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);

  // Key sequence buffer for two-stroke shortcuts (e.g. 'g' then 'h')
  const gSequenceRef = useRef<boolean>(false);
  const gTimeoutRef = useRef<any>(null);

  // Global SaaS Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing inside an input, textarea, or contentEditable element
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      // Cmd/Ctrl+K for search (works even inside inputs if requested, but standard is everywhere)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }

      // Close all modals on Escape
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsQuickAddOpen(false);
        setIsTimerOpen(false);
        setIsNotificationsOpen(false);
        setIsPdfImportOpen(false);
        setIsShortcutsOpen(false);
        setIsTranscriptOpen(false);
        setIsAttendanceOpen(false);
        gSequenceRef.current = false;
        return;
      }

      if (isInput) return;

      // '?' or Shift+/ opens shortcuts modal
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      // 'p' or Cmd+P opens Official Semester Transcript
      if ((e.key.toLowerCase() === 'p' && !e.altKey) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p')) {
        e.preventDefault();
        setIsTranscriptOpen(true);
        return;
      }

      // 'b' opens Attendance & Bunk Margin Calculator
      if (e.key.toLowerCase() === 'b' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setIsAttendanceOpen(true);
        return;
      }

      // 'c' opens Quick Add
      if (e.key.toLowerCase() === 'c' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        openQuickAdd('task');
        return;
      }

      // 't' opens Focus Timer
      if (e.key.toLowerCase() === 't' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setIsTimerOpen(true);
        return;
      }

      // 'i' opens PDF Import
      if (e.key.toLowerCase() === 'i' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        openPdfImport('timetable');
        return;
      }

      // Two-stroke navigation: 'g' then key
      if (e.key.toLowerCase() === 'g' && !e.metaKey && !e.ctrlKey) {
        gSequenceRef.current = true;
        clearTimeout(gTimeoutRef.current);
        gTimeoutRef.current = setTimeout(() => {
          gSequenceRef.current = false;
        }, 1200);
        return;
      }

      if (gSequenceRef.current) {
        gSequenceRef.current = false;
        clearTimeout(gTimeoutRef.current);
        const k = e.key.toLowerCase();
        switch (k) {
          case 'h':
            setCurrentTab('home');
            break;
          case 't':
            setCurrentTab('timetable');
            break;
          case 's':
            setCurrentTab('subjects');
            break;
          case 'm':
            setCurrentTab('marks');
            break;
          case 'a':
            setCurrentTab('assignments');
            break;
          case 'p':
            setCurrentTab('projects');
            break;
          case 'e':
            setCurrentTab('exams');
            break;
          case 'r':
            setCurrentTab('progress');
            break;
          case 'f':
            setCurrentTab('study');
            break;
          case 'n':
            setCurrentTab('settings');
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(gTimeoutRef.current);
    };
  }, []);

  const openQuickAdd = (tab?: any) => {
    if (tab) setQuickAddTab(tab);
    setIsQuickAddOpen(true);
  };

  const openPdfImport = (docType?: any) => {
    if (docType) setPdfImportDocType(docType);
    setIsPdfImportOpen(true);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans antialiased">
      {/* Desktop Persistent Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenQuickAdd={() => openQuickAdd('task')}
          onOpenTimer={() => setIsTimerOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenPdfImport={() => openPdfImport('timetable')}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          onOpenSettings={() => setCurrentTab('settings')}
        />

        {/* Scrollable Main View */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-12 bg-zinc-950">
          {currentTab === 'home' && (
            <HomeDashboard
              onNavigate={setCurrentTab}
              onOpenQuickAdd={openQuickAdd}
              onOpenTimer={() => setIsTimerOpen(true)}
              onOpenPdfImport={openPdfImport}
            />
          )}
          {currentTab === 'timetable' && (
            <TimetableModule
              onOpenPdfImport={openPdfImport}
              onOpenQuickAdd={openQuickAdd}
            />
          )}
          {currentTab === 'subjects' && (
            <SubjectsModule
              onOpenPdfImport={openPdfImport}
              onOpenQuickAdd={openQuickAdd}
            />
          )}
          {currentTab === 'assignments' && (
            <AssignmentsModule onOpenQuickAdd={openQuickAdd} />
          )}
          {currentTab === 'projects' && (
            <ProjectsModule onOpenQuickAdd={openQuickAdd} />
          )}
          {currentTab === 'exams' && (
            <ExamsModule
              onOpenPdfImport={openPdfImport}
              onOpenQuickAdd={openQuickAdd}
              onNavigate={setCurrentTab}
            />
          )}
          {currentTab === 'marks' && (
            <MarksModule onNavigate={setCurrentTab} />
          )}
          {currentTab === 'study' && (
            <StudyTasksModule
              onOpenQuickAdd={openQuickAdd}
              onOpenTimer={() => setIsTimerOpen(true)}
            />
          )}
          {currentTab === 'progress' && (
            <ProgressModule onNavigate={setCurrentTab} />
          )}
          {currentTab === 'settings' && <SettingsModule />}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav currentTab={currentTab} onSelectTab={setCurrentTab} />
      </div>

      {/* Global Modals & Drawers */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={setCurrentTab}
      />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        initialTab={quickAddTab}
      />

      <FocusTimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
      />

      <PdfImportModal
        isOpen={isPdfImportOpen}
        onClose={() => setIsPdfImportOpen(false)}
        defaultDocType={pdfImportDocType}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigate={setCurrentTab}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        onNavigate={setCurrentTab}
      />

      <AcademicTranscriptModal
        isOpen={isTranscriptOpen}
        onClose={() => setIsTranscriptOpen(false)}
      />

      <AttendanceBunkModal
        isOpen={isAttendanceOpen}
        onClose={() => setIsAttendanceOpen(false)}
      />

      {/* Floating Toast Alerts */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 space-y-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-xl flex items-start gap-3 text-xs transition-all animate-in slide-in-from-bottom-2 ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                : toast.type === 'success'
                ? 'bg-zinc-900/95 border-emerald-500/40 text-zinc-100'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/40 text-amber-200'
                : 'bg-zinc-900/95 border-zinc-700 text-zinc-200'
            }`}
          >
            <div className="flex-1">
              <p className="font-semibold text-zinc-100 text-sm">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-500 hover:text-zinc-300"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AcademicProvider>
        <AppContent />
      </AcademicProvider>
    </ErrorBoundary>
  );
}
