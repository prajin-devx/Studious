import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Plus,
  Minus,
  Sparkles,
  Settings2,
  Calendar,
  BookOpen,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import {
  calculateAttendancePercentage,
  calculateBunkMargin,
  calculateOverallAttendance,
  BunkCalculationResult,
} from '../../utils/attendanceCalculations';

interface AttendanceBunkModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSubjectId?: string;
}

export function AttendanceBunkModal({
  isOpen,
  onClose,
  initialSubjectId,
}: AttendanceBunkModalProps) {
  const { subjects, updateSubjectAttendance, quickMarkAttendance, addToast } = useAcademic();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || (subjects[0]?.id ?? '')
  );

  // Global threshold preference
  const [globalTarget, setGlobalTarget] = useState<number>(75);

  // What-if simulator states
  const [simulateAttendCount, setSimulateAttendCount] = useState<number>(0);
  const [simulateMissCount, setSimulateMissCount] = useState<number>(0);

  // Manual editor state
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editAttended, setEditAttended] = useState<number>(0);
  const [editTotal, setEditTotal] = useState<number>(0);
  const [editMinReq, setEditMinReq] = useState<number>(75);

  if (!isOpen) return null;

  const activeSubjects = subjects.filter((s) => !s.isArchived);
  const currentSubject = activeSubjects.find((s) => s.id === selectedSubjectId) || activeSubjects[0];

  const overall = calculateOverallAttendance(activeSubjects);

  // Current selected subject calculations
  const currentAttended = currentSubject?.attendanceAttended ?? 0;
  const currentTotal = currentSubject?.attendanceTotal ?? 0;
  const currentMinReq = currentSubject?.minAttendanceRequired || globalTarget;

  const currentResult: BunkCalculationResult = calculateBunkMargin(
    currentAttended,
    currentTotal,
    currentMinReq
  );

  // What-if projection
  const simulatedAttended = Math.max(0, currentAttended + simulateAttendCount);
  const simulatedTotal = Math.max(1, currentTotal + simulateAttendCount + simulateMissCount);
  const simulatedResult = calculateBunkMargin(simulatedAttended, simulatedTotal, currentMinReq);

  const startEdit = (subj: any) => {
    setEditingSubjectId(subj.id);
    setEditAttended(subj.attendanceAttended ?? 0);
    setEditTotal(subj.attendanceTotal ?? 0);
    setEditMinReq(subj.minAttendanceRequired || globalTarget);
  };

  const handleSaveEdit = async () => {
    if (!editingSubjectId) return;
    if (editAttended > editTotal) {
      addToast({
        type: 'error',
        title: 'Invalid Attendance',
        message: 'Attended classes cannot be greater than total classes held.',
      });
      return;
    }
    await updateSubjectAttendance(editingSubjectId, editAttended, editTotal, editMinReq);
    addToast({
      type: 'success',
      title: 'Attendance Updated',
      message: 'Subject attendance records synchronized.',
    });
    setEditingSubjectId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-100">
                  Attendance Tracker & Bunk Margin
                </h2>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    overall.status === 'safe'
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : overall.status === 'warning'
                      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                      : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                  }`}
                >
                  {overall.overallPercentage}% Overall
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Calculate safe bunks, attendance debarment thresholds, and recovery requirements
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-xs">
              <span className="text-zinc-400">Policy:</span>
              <select
                value={globalTarget}
                onChange={(e) => setGlobalTarget(Number(e.target.value))}
                className="bg-transparent text-zinc-200 font-bold focus:outline-hidden cursor-pointer"
              >
                <option value={75} className="bg-zinc-800">75% (Standard)</option>
                <option value={80} className="bg-zinc-800">80% (Strict)</option>
                <option value={85} className="bg-zinc-800">85% (Honors)</option>
                <option value={70} className="bg-zinc-800">70% (Relaxed)</option>
              </select>
            </div>

            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-400 block font-medium">Semester Attendance</span>
                <div className="text-2xl font-bold font-mono text-zinc-100 mt-0.5">
                  {overall.overallPercentage}%
                </div>
                <span className="text-[11px] text-zinc-500">
                  {overall.totalAttended} of {overall.totalHeld} total lectures
                </span>
              </div>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  overall.status === 'safe'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : overall.status === 'warning'
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'bg-rose-500/10 text-rose-400'
                }`}
              >
                {overall.status === 'safe' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
            </div>

            <div className="p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-400 block font-medium">Safe Bunks Buffer</span>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
                  {activeSubjects.reduce((acc, s) => {
                    const res = calculateBunkMargin(
                      s.attendanceAttended ?? 0,
                      s.attendanceTotal ?? 0,
                      s.minAttendanceRequired || globalTarget
                    );
                    return acc + res.safeBunksAvailable;
                  }, 0)}{' '}
                  <span className="text-sm font-sans font-normal text-zinc-400">classes</span>
                </div>
                <span className="text-[11px] text-zinc-500">Total buffer across all courses</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-400 block font-medium">Subjects at Risk</span>
                <div className="text-2xl font-bold font-mono text-rose-400 mt-0.5">
                  {
                    activeSubjects.filter((s) => {
                      const res = calculateBunkMargin(
                        s.attendanceAttended ?? 0,
                        s.attendanceTotal ?? 0,
                        s.minAttendanceRequired || globalTarget
                      );
                      return res.status === 'critical';
                    }).length
                  }{' '}
                  <span className="text-sm font-sans font-normal text-zinc-400">subjects</span>
                </div>
                <span className="text-[11px] text-zinc-500">Below {globalTarget}% policy minimum</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Subject-Wise Attendance & Bunk Margin Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Courses & Safe Bunk Margins
              </h3>
              <span className="text-xs text-zinc-500">
                Tap + / - to record attendance or simulate
              </span>
            </div>

            <div className="space-y-2.5">
              {activeSubjects.map((subj) => {
                const attended = subj.attendanceAttended ?? 0;
                const total = subj.attendanceTotal ?? 0;
                const minReq = subj.minAttendanceRequired || globalTarget;
                const result = calculateBunkMargin(attended, total, minReq);
                const isSelected = subj.id === selectedSubjectId;

                return (
                  <div
                    key={subj.id}
                    onClick={() => setSelectedSubjectId(subj.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-800/80 border-indigo-500/50 shadow-md shadow-indigo-500/5'
                        : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left info */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className="w-3.5 h-3.5 rounded-full shrink-0 mt-1"
                          style={{ backgroundColor: subj.color }}
                        />
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-zinc-100 truncate">
                              {subj.name}
                            </span>
                            {subj.code && (
                              <span className="text-xs font-mono text-zinc-400">
                                {subj.code}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                            <span className="font-mono text-zinc-300">
                              {attended} / {total} attended
                            </span>
                            <span>•</span>
                            <span>Target: {minReq}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Percentage & Bunk Status */}
                      <div className="flex items-center gap-4 ml-auto sm:ml-0">
                        <div className="text-right">
                          <div
                            className={`text-lg font-bold font-mono ${
                              result.status === 'safe'
                                ? 'text-emerald-400'
                                : result.status === 'warning'
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {result.currentPercentage}%
                          </div>
                          <div className="text-xs text-zinc-400">
                            {result.status === 'safe' ? (
                              <span className="text-emerald-400 font-medium">
                                {result.safeBunksAvailable} safe bunks left
                              </span>
                            ) : result.status === 'warning' ? (
                              <span className="text-amber-400 font-medium">
                                0 safe bunks (Borderline)
                              </span>
                            ) : (
                              <span className="text-rose-400 font-medium">
                                Must attend next {result.classesNeededToRecover}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick increment buttons */}
                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => quickMarkAttendance(subj.id, true)}
                            title="Attended Class Today (+1 Attended, +1 Total)"
                            className="p-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1 px-2.5 min-h-[34px]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Present</span>
                          </button>

                          <button
                            onClick={() => quickMarkAttendance(subj.id, false)}
                            title="Bunked/Missed Class Today (+1 Total, +0 Attended)"
                            className="p-1.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1 px-2.5 min-h-[34px]"
                          >
                            <Minus className="w-3.5 h-3.5" />
                            <span>Bunk</span>
                          </button>

                          <button
                            onClick={() => startEdit(subj)}
                            title="Edit Custom Attendance Numbers"
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 border border-zinc-700 rounded-xl transition-colors min-h-[34px] min-w-[34px] flex items-center justify-center"
                          >
                            <Settings2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden mt-3">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          result.status === 'safe'
                            ? 'bg-emerald-500'
                            : result.status === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, result.currentPercentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive What-If Simulator for Selected Subject */}
          {currentSubject && (
            <div className="p-5 bg-gradient-to-br from-indigo-950/30 via-zinc-950 to-zinc-900 border border-indigo-500/20 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>What-If Bunk & Attendance Simulator: {currentSubject.name}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Simulator controls */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-zinc-300 font-medium block mb-1">
                      If I attend next classes: <span className="font-bold font-mono text-emerald-400">+{simulateAttendCount}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={simulateAttendCount}
                        onChange={(e) => setSimulateAttendCount(Number(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                      <span className="font-mono text-xs w-6 text-right text-zinc-400">{simulateAttendCount}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-300 font-medium block mb-1">
                      If I bunk/skip next classes: <span className="font-bold font-mono text-rose-400">+{simulateMissCount}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="15"
                        value={simulateMissCount}
                        onChange={(e) => setSimulateMissCount(Number(e.target.value))}
                        className="w-full accent-rose-500 cursor-pointer"
                      />
                      <span className="font-mono text-xs w-6 text-right text-zinc-400">{simulateMissCount}</span>
                    </div>
                  </div>

                  {(simulateAttendCount > 0 || simulateMissCount > 0) && (
                    <button
                      onClick={() => {
                        setSimulateAttendCount(0);
                        setSimulateMissCount(0);
                      }}
                      className="text-xs text-indigo-400 hover:underline"
                    >
                      Reset simulation
                    </button>
                  )}
                </div>

                {/* Simulated Outcome Display */}
                <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Projected Attendance</span>
                    <span
                      className={`font-mono text-xl font-bold ${
                        simulatedResult.status === 'safe'
                          ? 'text-emerald-400'
                          : simulatedResult.status === 'warning'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {simulatedResult.currentPercentage}%
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {simulatedResult.summaryMessage}
                  </p>

                  <div className="pt-1 text-[11px] text-zinc-500 flex items-center justify-between">
                    <span>
                      Classes: {simulatedAttended} / {simulatedTotal}
                    </span>
                    <span>Target: {currentMinReq}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Record Modal Popover */}
          {editingSubjectId && (
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
              <h4 className="text-sm font-bold text-zinc-200">
                Edit Attendance Record
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Attended Classes</label>
                  <input
                    type="number"
                    min="0"
                    value={editAttended}
                    onChange={(e) => setEditAttended(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm font-mono text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Total Classes Held</label>
                  <input
                    type="number"
                    min="1"
                    value={editTotal}
                    onChange={(e) => setEditTotal(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm font-mono text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Required Minimum %</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={editMinReq}
                    onChange={(e) => setEditMinReq(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm font-mono text-zinc-100"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 justify-end pt-1">
                <button
                  onClick={() => setEditingSubjectId(null)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs text-zinc-400">
          <span>Formula: Attended ≥ (Target % × Total Held)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
