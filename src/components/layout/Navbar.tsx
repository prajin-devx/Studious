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
import { AuthModal } from '../modals/AuthModal';

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
  const {
    user,
    isCloudSyncing,
    syncStatus,
    isOnline,
    signInWithGoogle,
    signOutUser,
    notifications,
    isAuthModalOpen,
    setIsAuthModalOpen,
  } = useAcademic();

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
            title={`Sync Status: ${syncStatus.toUpperCase()} • Click for Details`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors min-h-[38px]"
          >
            <Cloud
              className={`w-3.5 h-3.5 ${
                !isOnline
                  ? 'text-amber-400'
                  : isCloudSyncing
                  ? 'text-indigo-400 animate-spin'
                  : user
                  ? 'text-emerald-400'
                  : 'text-blue-400'
              }`}
            />
            <span className="hidden lg:inline text-zinc-300">
              {!isOnline
                ? 'Offline (Queued)'
                : isCloudSyncing
                ? 'Syncing...'
                : user
                ? 'Cloud Synced'
                : 'Local Cache'}
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                !isOnline
                  ? 'bg-amber-400'
                  : isCloudSyncing
                  ? 'bg-indigo-400 animate-ping'
                  : user
                  ? 'bg-emerald-400'
                  : 'bg-blue-400'
              }`}
            />
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
                onClick={() => setIsAuthModalOpen(true)}
                title={`Signed in as ${user.displayName || user.email} • Click for Account Details`}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors min-h-[38px] group"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-5 h-5 rounded-full object-cover border border-zinc-700"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm">
                    {(user.displayName || user.email || 'U')[0]}
                  </div>
                )}
                <span className="text-xs font-medium text-zinc-200 hidden sm:inline max-w-[100px] truncate">
                  {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
              </button>
              <button
                onClick={signOutUser}
                title={`Sign out of ${user.email}`}
                aria-label="Sign Out"
                className="p-2 text-zinc-400 hover:text-rose-400 bg-zinc-900 border border-zinc-800 rounded-xl transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 border border-blue-500/30 hover:border-blue-500/50 rounded-xl text-sm font-medium text-blue-200 transition-colors min-h-[38px] shadow-sm shadow-blue-500/10"
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

      {/* Google & Academic Cloud Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
