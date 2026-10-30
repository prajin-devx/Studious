import React, { useState } from 'react';
import {
  Search,
  Plus,
  Timer,
  Bell,
  Cloud,
  LogIn,
  LogOut,
  FileUp,
  HelpCircle,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { CloudSyncHealthPopover } from './CloudSyncHealthPopover';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenQuickAdd: () => void;
  onOpenTimer: () => void;
  onOpenNotifications: () => void;
  onOpenPdfImport: () => void;
  onOpenShortcuts?: () => void;
  onOpenSettings?: () => void;
}

export function Navbar({
  onOpenSearch,
  onOpenQuickAdd,
  onOpenTimer,
  onOpenNotifications,
  onOpenPdfImport,
  onOpenShortcuts,
  onOpenSettings,
}: NavbarProps) {
  const { user, isCloudSyncing, signInWithGoogle, signOutUser, notifications } =
    useAcademic();

  const [isSyncHealthOpen, setIsSyncHealthOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <header className="h-14 md:h-16 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-30 px-3 md:px-6 flex items-center justify-between gap-2">
        {/* Mobile Brand Logo */}
        <div className="flex items-center gap-2 md:hidden shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-600/30">
            S
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-base tracking-tight text-zinc-100 block leading-tight">
                Studious
              </span>
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20">
                PRO
              </span>
            </div>
            <span className="text-xs text-zinc-400 font-medium leading-none">Semester 5</span>
          </div>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-md">
          <button
            onClick={onOpenSearch}
            aria-label="Search academic workspace (Cmd+K)"
            className="w-full flex items-center justify-between px-3.5 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-xl text-sm transition-all shadow-inner"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-zinc-500" />
              <span>Search subjects, topics, assignments...</span>
            </div>
            <kbd className="inline-flex items-center gap-0.5 text-xs font-mono font-medium text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
          {/* Mobile Search Button */}
          <button
            onClick={onOpenSearch}
            aria-label="Search"
            className="md:hidden p-2 text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-xl min-w-[38px] min-h-[38px] flex items-center justify-center"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* PDF Import Button */}
          <button
            onClick={onOpenPdfImport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors min-h-[38px]"
            title="Import Timetable, Syllabus, or Hall Ticket PDF"
          >
            <FileUp className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="hidden sm:inline">Import</span>
          </button>

          {/* Focus Timer */}
          <button
            onClick={onOpenTimer}
            aria-label="Academic Focus Timer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors min-h-[38px]"
            title="Start Focus Timer (T)"
          >
            <Timer className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="hidden md:inline">Focus</span>
          </button>

          {/* Quick Add Button */}
          <button
            onClick={onOpenQuickAdd}
            aria-label="Quick Add Record"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-sm shadow-indigo-600/30 min-h-[38px]"
          >
            <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
            <span className="hidden sm:inline">Add</span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            aria-label="View notifications"
            className="relative p-2 text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-xl transition-colors hover:bg-zinc-800 min-w-[38px] min-h-[38px] flex items-center justify-center"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-xs font-bold text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Cloud Sync Health Button */}
          <button
            onClick={() => setIsSyncHealthOpen(true)}
            aria-label="Cloud Sync & Health Status"
            title="Cloud Sync & Storage Health"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors min-h-[38px]"
          >
            <Cloud
              className={`w-3.5 h-3.5 ${
                isCloudSyncing ? 'text-indigo-400 animate-spin' : user ? 'text-emerald-400' : 'text-blue-400'
              }`}
            />
            <span className="hidden lg:inline text-zinc-300">
              {isCloudSyncing ? 'Syncing...' : user ? 'Cloud Synced' : 'Local Cache'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          </button>

          {/* Keyboard Shortcuts Trigger Button */}
          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              aria-label="Keyboard Shortcuts"
              title="Keyboard Shortcuts (?)"
              className="hidden lg:flex p-2 text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 min-w-[38px] min-h-[38px] items-center justify-center transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}

          {/* Auth status on mobile / desktop */}
          {user ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={signOutUser}
                title={`Signed in as ${user.email} • Click to Sign Out`}
                aria-label="Sign Out"
                className="p-2 text-zinc-400 hover:text-rose-400 bg-zinc-900 border border-zinc-800 rounded-xl transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-sm font-medium text-zinc-200 transition-colors min-h-[38px]"
            >
              <LogIn className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Cloud Sync Health Modal Popover */}
      <CloudSyncHealthPopover
        isOpen={isSyncHealthOpen}
        onClose={() => setIsSyncHealthOpen(false)}
        onOpenSettings={onOpenSettings}
      />
    </>
  );
}
