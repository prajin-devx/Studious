import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Calendar,
  Clock,
  BookOpen,
  GraduationCap,
  X,
  Trash2,
  Smartphone,
  Volume2,
  Sliders,
  AlertCircle,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export function NotificationDrawer({ isOpen, onClose, onNavigate }: NotificationDrawerProps) {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    deviceNotificationPermission,
    requestDeviceNotificationPermission,
    sendTestDeviceNotification,
  } = useAcademic();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.isRead : true));
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'class':
        return <Calendar className="w-4 h-4 text-blue-400" />;
      case 'exam':
        return <GraduationCap className="w-4 h-4 text-amber-400" />;
      case 'assignment':
        return <Clock className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-2xs"
    >
      <div className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 id="notification-drawer-title" className="text-base font-semibold text-zinc-100">
                Notifications & Reminders
              </h2>
              <p className="text-sm text-zinc-400">
                {unreadCount > 0 ? `${unreadCount} unread academic reminders` : 'All caught up'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close notification panel"
            className="p-2 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Device Notifications Card */}
        <div className="p-4 bg-zinc-950/70 border-b border-zinc-800/80">
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">Mobile Push Reminders</h3>
                  <p className="text-xs text-zinc-400">Classes & deadline alerts</p>
                </div>
              </div>

              {deviceNotificationPermission === 'granted' ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              ) : deviceNotificationPermission === 'denied' ? (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Blocked
                </span>
              ) : (
                <span className="text-xs font-semibold text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-full">
                  Inactive
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {deviceNotificationPermission === 'granted'
                ? 'Device notifications are active. You will receive banner and chime alerts before classes and assignment deadlines.'
                : 'Enable device notifications to receive real-time alerts before your lectures start and when assignments are due.'}
            </p>

            <div className="flex items-center gap-2 pt-1">
              {deviceNotificationPermission !== 'granted' ? (
                <button
                  onClick={requestDeviceNotificationPermission}
                  className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <Bell className="w-4 h-4" />
                  Enable Mobile Notifications
                </button>
              ) : (
                <button
                  onClick={sendTestDeviceNotification}
                  className="flex-1 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-zinc-700"
                >
                  <Volume2 className="w-4 h-4 text-indigo-400" />
                  Send Test Alert
                </button>
              )}

              <button
                onClick={() => {
                  onNavigate('settings');
                  onClose();
                }}
                className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-medium transition-colors border border-zinc-700/80 flex items-center gap-1.5"
                title="Configure timings and quiet hours"
              >
                <Sliders className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action bar & Filters */}
        <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-zinc-800 text-zinc-100 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-zinc-800 text-zinc-100 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-xs text-zinc-500 hover:text-zinc-300 font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <CheckCircle2 className="w-8 h-8 text-zinc-600 mb-2" />
              <p className="text-sm font-medium text-zinc-400">No notifications to show</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Class, exam, and assignment alerts will appear here.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  markNotificationRead(item.id);
                  if (item.category === 'class') onNavigate('timetable');
                  else if (item.category === 'exam') onNavigate('exams');
                  else if (item.category === 'assignment') onNavigate('assignments');
                  onClose();
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  item.isRead
                    ? 'bg-zinc-900/60 border-zinc-800/60 opacity-75 hover:opacity-100'
                    : 'bg-zinc-800/50 border-zinc-700/60 hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-semibold ${item.isRead ? 'text-zinc-300' : 'text-zinc-100'}`}>
                        {item.title}
                      </p>
                      {!item.isRead && (
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-300 mt-1 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                    <span className="text-xs font-mono text-zinc-400 mt-2 block">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
