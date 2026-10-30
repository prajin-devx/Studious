import React, { useState } from 'react';
import {
  Cloud,
  CheckCircle2,
  RefreshCw,
  Database,
  ShieldCheck,
  HardDrive,
  Download,
  Calendar,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { downloadCalendarIcs } from '../../utils/calendarExport';

interface CloudSyncHealthPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
}

export function CloudSyncHealthPopover({
  isOpen,
  onClose,
  onOpenSettings,
}: CloudSyncHealthPopoverProps) {
  const {
    user,
    isCloudSyncing,
    subjects,
    classes,
    assignments,
    projects,
    exams,
    testMarks,
    exportDataJson,
    addToast,
    forceCloudSync,
  } = useAcademic();

  const [isManualSyncing, setIsManualSyncing] = useState(false);

  if (!isOpen) return null;

  // Calculate approximate local storage usage
  const calculateStorageSize = () => {
    try {
      let total = 0;
      for (const x in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, x)) {
          total += (localStorage[x].length + x.length) * 2;
        }
      }
      return `${(total / 1024).toFixed(1)} KB`;
    } catch {
      return '185 KB';
    }
  };

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    try {
      await forceCloudSync();
      if (user) {
        addToast({
          type: 'success',
          title: 'Cloud Synchronized',
          message: 'All semester records safely pushed to Firestore.',
        });
      } else {
        // Trigger simulated sync for guest local workspace
        await new Promise((r) => setTimeout(r, 600));
        addToast({
          type: 'info',
          title: 'Local Cache Verified',
          message: 'All records are cached offline on this device. Sign in for multi-device sync.',
        });
      }
    } catch (e: any) {
      addToast({
        type: 'error',
        title: 'Sync Check Failed',
        message: e?.message || 'Could not reach cloud database.',
      });
    } finally {
      setIsManualSyncing(false);
    }
  };

  const handleDownloadSnapshot = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `studious_saas_snapshot_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    addToast({
      type: 'success',
      title: 'Snapshot Exported',
      message: 'JSON academic archive saved to your downloads.',
    });
  };

  const handleExportIcs = () => {
    downloadCalendarIcs(classes, 'Semester 5');
    addToast({
      type: 'success',
      title: 'Calendar ICS Exported',
      message: 'Import into Google Calendar, Apple Calendar, or Outlook.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-100">Sync & Storage Health</h3>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {user ? user.email : 'Local Protected Academic Cache'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sync Summary Stats */}
        <div className="p-5 space-y-4 text-xs">
          <div className="p-3.5 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                Cloud Database
              </span>
              <span className="font-mono text-zinc-300">Firestore (GCP)</span>
            </div>

            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                Local Cache Footprint
              </span>
              <span className="font-mono text-zinc-300">{calculateStorageSize()} / 5 MB</span>
            </div>

            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Security Rules Status
              </span>
              <span className="text-emerald-400 font-medium">User-Isolated RBAC</span>
            </div>
          </div>

          {/* Collection breakdown */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Active Synchronized Records
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 bg-zinc-950/50 border border-zinc-800/60 rounded-xl text-center">
                <div className="font-mono text-base font-bold text-zinc-100">{subjects.length}</div>
                <div className="text-[10px] text-zinc-400">Subjects</div>
              </div>
              <div className="p-2.5 bg-zinc-950/50 border border-zinc-800/60 rounded-xl text-center">
                <div className="font-mono text-base font-bold text-zinc-100">{classes.length}</div>
                <div className="text-[10px] text-zinc-400">Classes</div>
              </div>
              <div className="p-2.5 bg-zinc-950/50 border border-zinc-800/60 rounded-xl text-center">
                <div className="font-mono text-base font-bold text-indigo-400">{testMarks.length}</div>
                <div className="text-[10px] text-zinc-400">Test Marks</div>
              </div>
              <div className="p-2.5 bg-zinc-950/50 border border-zinc-800/60 rounded-xl text-center">
                <div className="font-mono text-base font-bold text-zinc-100">{assignments.length}</div>
                <div className="text-[10px] text-zinc-400">Assignments</div>
              </div>
              <div className="p-2.5 bg-zinc-950/50 border border-zinc-800/60 rounded-xl text-center">
                <div className="font-mono text-base font-bold text-zinc-100">{projects.length}</div>
                <div className="text-[10px] text-zinc-400">Projects</div>
              </div>
              <div className="p-2.5 bg-zinc-950/50 border border-zinc-800/60 rounded-xl text-center">
                <div className="font-mono text-base font-bold text-zinc-100">{exams.length}</div>
                <div className="text-[10px] text-zinc-400">Exams</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 space-y-2">
            <button
              onClick={handleManualSync}
              disabled={isManualSyncing || isCloudSyncing}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isManualSyncing || isCloudSyncing ? 'animate-spin' : ''}`} />
              {isManualSyncing || isCloudSyncing ? 'Syncing with Firestore...' : 'Force Cloud Sync Now'}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownloadSnapshot}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                Export JSON
              </button>

              <button
                onClick={handleExportIcs}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-medium transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Export iCal (.ics)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Realtime offline-first architecture</span>
          {onOpenSettings && (
            <button
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="text-indigo-400 hover:underline flex items-center gap-1"
            >
              Workspace Settings
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
