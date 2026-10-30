import React, { useState } from 'react';
import {
  Settings,
  User,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Cloud,
  CheckCircle2,
  Shield,
  LogIn,
  LogOut,
  Moon,
  Sun,
  AlertTriangle,
  Bell,
  Smartphone,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  Type,
  Calendar,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { downloadCalendarIcs } from '../../utils/calendarExport';

export function SettingsModule() {
  const {
    user,
    profile,
    settings,
    updateProfile,
    updateSettings,
    signInWithGoogle,
    signOutUser,
    exportDataJson,
    importDataJson,
    resetToSampleData,
    clearAllData,
    addToast,
    classes,
    deviceNotificationPermission,
    requestDeviceNotificationPermission,
    sendTestDeviceNotification,
  } = useAcademic();

  // Profile local form state
  const [name, setName] = useState(profile.name);
  const [institution, setInstitution] = useState(profile.institution || '');
  const [degree, setDegree] = useState(profile.degree || '');
  const [semester, setSemester] = useState(profile.semester || '');
  const [academicTerm, setAcademicTerm] = useState(profile.academicTerm || '');

  // Confirm delete state
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name,
      institution,
      degree,
      semester,
      academicTerm,
    });
    addToast({ type: 'success', title: 'Profile Updated', message: 'Your student profile details have been saved.' });
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `studious_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    addToast({ type: 'success', title: 'Backup Downloaded', message: 'Structured academic JSON exported.' });
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        await importDataJson(text);
      };
      reader.readAsText(e.target.files[0]);
    }
  };

  const currentFontSize = settings.fontSize || 'large';

  const fontOptions: Array<{
    id: 'normal' | 'large' | 'extra-large' | 'huge';
    label: string;
    description: string;
    pixelBadge: string;
  }> = [
    {
      id: 'normal',
      label: 'Standard',
      description: 'Default compact web sizing (16px base)',
      pixelBadge: '16px',
    },
    {
      id: 'large',
      label: 'Large (Default)',
      description: 'Generous, relaxed readability across laptops & phones (18px base)',
      pixelBadge: '18px',
    },
    {
      id: 'extra-large',
      label: 'Extra Large',
      description: 'Comfortable large typography for high readability (20px base)',
      pixelBadge: '20px',
    },
    {
      id: 'huge',
      label: 'Huge',
      description: 'Maximum legibility and accessibility (22px base)',
      pixelBadge: '22px',
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* 1. Header Toolbar */}
      <div className="pb-4 border-b border-zinc-800">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100">
          Settings & Preferences
        </h1>
        <p className="text-sm text-zinc-300 mt-1">
          Adjust font sizing, student profile, mobile notifications, cloud sync, and backup exports
        </p>
      </div>

      {/* 2. Appearance & Typography Sizing */}
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-5 shadow-sm">
        <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Type className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-100">Text Size & Typography</h2>
            <p className="text-sm text-zinc-400">
              Increase font scale across the entire application for easier, fatigue-free reading
            </p>
          </div>
        </div>

        {/* Font size choice cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {fontOptions.map((opt) => {
            const isSelected = currentFontSize === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateSettings({ fontSize: opt.id })}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'bg-indigo-600/15 border-indigo-500 text-zinc-100 shadow-md ring-1 ring-indigo-500/30'
                    : 'bg-zinc-800/40 border-zinc-700/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-base font-bold ${isSelected ? 'text-indigo-400' : 'text-zinc-200'}`}>
                      {opt.label}
                    </span>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
                      {opt.pixelBadge}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{opt.description}</p>
                </div>

                <div className="pt-3 mt-2 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className={`text-xs font-semibold ${isSelected ? 'text-indigo-400' : 'text-zinc-500'}`}>
                    {isSelected ? 'Active Selection' : 'Click to Apply'}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : 'border-zinc-700'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Typography Preview Pill */}
        <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 block mb-0.5">
              Live Readability Preview
            </span>
            <p className="text-sm text-zinc-200 font-medium">
              Data Structures: Binary Search Trees &amp; Graph Traversals
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              Lecture at 10:00 AM • Hall B-204 • Professor Chen • 3 Credits
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              High Priority
            </span>
            <span className="text-xs font-mono text-zinc-300 bg-zinc-800 px-2 py-1 rounded-lg border border-zinc-700">
              Active Scale: {currentFontSize.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Authentication & Cloud Sync */}
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">Cloud Sync & Persistence</h2>
              <p className="text-sm text-zinc-400">
                Synchronize your academic records across devices using Google Firebase
              </p>
            </div>
          </div>

          {user ? (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Connected
            </span>
          ) : (
            <span className="text-xs text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full font-medium">
              Local Guest Mode
            </span>
          )}
        </div>

        {user ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="space-y-1 text-sm">
              <p className="text-zinc-200">
                Signed in as: <strong>{user.email}</strong>
              </p>
              <p className="text-zinc-500 font-mono text-xs">User ID: {user.uid}</p>
            </div>
            <button
              onClick={signOutUser}
              className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-sm font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out to Guest Mode
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <p className="text-sm text-zinc-400 max-w-md">
              Sign in with your Google account to automatically persist your syllabus, timetable, and assignments to Firebase Firestore.
            </p>
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/20 shrink-0"
            >
              <LogIn className="w-4 h-4" />
              Sign In with Google
            </button>
          </div>
        )}
      </div>

      {/* 4. Student Profile Form */}
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-100">Academic Profile</h2>
            <p className="text-sm text-zinc-400">Personalize greetings and term information</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Student Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Institution / University</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Degree / Major</label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Current Semester</label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/20"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* 5. Mobile & Device Notifications */}
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                Mobile & Device Notifications
              </h2>
              <p className="text-sm text-zinc-400">
                Receive proactive advance alerts before upcoming classes and assignment deadlines
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {deviceNotificationPermission === 'granted' ? (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Browser Alerts Enabled
              </span>
            ) : (
              <button
                type="button"
                onClick={requestDeviceNotificationPermission}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                <Bell className="w-4 h-4" />
                Enable Device Alerts
              </button>
            )}

            <button
              type="button"
              onClick={sendTestDeviceNotification}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-semibold transition-colors"
              title="Test push notification banner and audio chime"
            >
              <Volume2 className="w-4 h-4 text-indigo-400" />
              Test Alert
            </button>
          </div>
        </div>

        {/* Timings and rules grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Class Reminders Card */}
          <div className="p-4 bg-zinc-800/40 border border-zinc-700/60 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-zinc-200">Class Lecture Reminders</h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.classReminders !== false}
                  onChange={(e) => updateSettings({ classReminders: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Sends an advance notification showing the subject name, start time, and classroom / hall.
            </p>

            <div className="pt-1">
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Advance Notice Timing
              </label>
              <select
                value={settings.classReminderAdvanceMinutes || 15}
                onChange={(e) =>
                  updateSettings({ classReminderAdvanceMinutes: Number(e.target.value) })
                }
                disabled={settings.classReminders === false}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500 disabled:opacity-50"
              >
                <option value={5}>5 minutes before class</option>
                <option value={10}>10 minutes before class</option>
                <option value={15}>15 minutes before class (Recommended)</option>
                <option value={30}>30 minutes before class</option>
                <option value={45}>45 minutes before class</option>
              </select>
            </div>
          </div>

          {/* Assignment Deadlines Card */}
          <div className="p-4 bg-zinc-800/40 border border-zinc-700/60 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-zinc-200">Assignment Deadlines</h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.assignmentReminders !== false}
                  onChange={(e) => updateSettings({ assignmentReminders: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Alerts for upcoming homework, reports, labs, and deliverables before they are due.
            </p>

            <div className="pt-1">
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Advance Deadline Warning
              </label>
              <select
                value={settings.assignmentReminderAdvanceHours || 24}
                onChange={(e) =>
                  updateSettings({ assignmentReminderAdvanceHours: Number(e.target.value) })
                }
                disabled={settings.assignmentReminders === false}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500 disabled:opacity-50"
              >
                <option value={2}>2 hours before deadline</option>
                <option value={6}>6 hours before deadline</option>
                <option value={12}>12 hours before deadline</option>
                <option value={24}>24 hours before deadline (1 day)</option>
                <option value={48}>48 hours before deadline (2 days)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quiet Hours & Sound Toggles */}
        <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-200">Audio Chime & Sound</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Play a pleasant harmonic 2-tone melodic chime when notifications arrive
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={settings.soundEnabled !== false}
                onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="pt-3 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-200">Quiet Hours (Do Not Disturb)</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Suppress audible chimes and push popups during rest hours (alerts still recorded in drawer)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div>
                <label className="block text-xs text-zinc-400 mb-0.5">From</label>
                <input
                  type="time"
                  value={settings.quietHoursStart || '22:00'}
                  onChange={(e) => updateSettings({ quietHoursStart: e.target.value })}
                  className="px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100"
                />
              </div>
              <span className="text-zinc-500 text-sm mt-4">to</span>
              <div>
                <label className="block text-xs text-zinc-400 mb-0.5">Until</label>
                <input
                  type="time"
                  value={settings.quietHoursEnd || '07:00'}
                  onChange={(e) => updateSettings({ quietHoursEnd: e.target.value })}
                  className="px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Backup & Restore Data */}
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-100">Data Backup & Export</h2>
            <p className="text-sm text-zinc-400">
              Export your full syllabus and schedule to JSON or restore from a backup file
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Export JSON */}
          <div className="p-4 bg-zinc-800/40 border border-zinc-700/60 rounded-xl space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-200">Export Backup</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Save all subjects, chapters, timetable events, and assignments to a JSON file.
              </p>
            </div>
            <button
              onClick={handleDownloadBackup}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-sm font-semibold transition-colors border border-zinc-700"
            >
              <Download className="w-4 h-4" />
              Download JSON
            </button>
          </div>

          {/* Export iCalendar */}
          <div className="p-4 bg-zinc-800/40 border border-zinc-700/60 rounded-xl space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-200">Export iCal (.ics)</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Sync your weekly class timetable directly with Google Calendar, Apple Calendar, or Outlook.
              </p>
            </div>
            <button
              onClick={() => {
                downloadCalendarIcs(classes, profile.semester || 'Semester 5');
                addToast({
                  type: 'success',
                  title: 'Calendar Exported',
                  message: 'iCalendar (.ics) file generated and downloaded.',
                });
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-sm font-semibold transition-colors border border-zinc-700"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              Download iCal
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-4 bg-zinc-800/40 border border-zinc-700/60 rounded-xl space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-200">Restore Backup</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Upload a previously saved JSON backup to restore your semester records.
              </p>
            </div>
            <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-sm font-semibold transition-colors border border-zinc-700 cursor-pointer">
              <Upload className="w-4 h-4" />
              Upload Backup File
              <input
                type="file"
                accept=".json"
                onChange={handleFileRestore}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset to Sample */}
          <div className="p-4 bg-zinc-800/40 border border-zinc-700/60 rounded-xl space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-200">Load Demo Data</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Populate your workspace with a complete undergraduate CS engineering semester.
              </p>
            </div>
            <button
              onClick={resetToSampleData}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-sm font-semibold transition-colors border border-zinc-700"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Demo
            </button>
          </div>
        </div>
      </div>

      {/* 7. Danger Zone / Clear Workspace */}
      <div className="p-6 bg-rose-950/10 border border-rose-500/20 rounded-2xl space-y-3">
        <h2 className="text-base font-semibold text-rose-400">Clear Workspace Data</h2>
        <p className="text-sm text-zinc-400">
          Permanently delete all subjects, timetable events, assignments, and exams from this device.
        </p>

        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 rounded-xl text-sm font-semibold transition-colors"
          >
            Clear All Academic Data
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                await clearAllData();
                setShowClearConfirm(false);
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Confirm & Wipe Data
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
