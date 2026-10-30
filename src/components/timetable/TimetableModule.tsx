import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Plus,
  FileUp,
  Download,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Ban,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import {
  findTimetableConflicts,
  formatTime12h,
  timeStringToMinutes,
} from '../../utils/academicCalculations';
import { ClassEvent } from '../../types';

interface TimetableModuleProps {
  onOpenPdfImport: (type?: any) => void;
  onOpenQuickAdd: (type?: any) => void;
}

export function TimetableModule({ onOpenPdfImport, onOpenQuickAdd }: TimetableModuleProps) {
  const { classes, subjects, deleteClassEvent, updateClassEvent, addToast } = useAcademic();

  const currentDayOfWeek = new Date().getDay();
  // Default to today's day of week (or 1 for Monday if Sunday)
  const [selectedDay, setSelectedDay] = useState<number>(currentDayOfWeek === 0 ? 1 : currentDayOfWeek);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'list'>('day');

  const conflicts = findTimetableConflicts(classes);

  const weekdays = [
    { id: 1, name: 'Monday', short: 'Mon' },
    { id: 2, name: 'Tuesday', short: 'Tue' },
    { id: 3, name: 'Wednesday', short: 'Wed' },
    { id: 4, name: 'Thursday', short: 'Thu' },
    { id: 5, name: 'Friday', short: 'Fri' },
    { id: 6, name: 'Saturday', short: 'Sat' },
    { id: 0, name: 'Sunday', short: 'Sun' },
  ];

  // Export timetable to ICS
  const handleExportIcs = () => {
    let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Studious//Semester Timetable//EN\n`;
    for (const c of classes) {
      if (c.isCancelled) continue;
      const subj = subjects.find((s) => s.id === c.subjectId);
      icsContent += `BEGIN:VEVENT\nSUMMARY:${c.title} (${subj?.code || 'CLASS'})\n`;
      icsContent += `LOCATION:${c.room || 'Campus'}\n`;
      icsContent += `DESCRIPTION:${c.faculty ? `Faculty: ${c.faculty}` : ''}\n`;
      icsContent += `RRULE:FREQ=WEEKLY\n`;
      icsContent += `END:VEVENT\n`;
    }
    icsContent += `END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `studious_timetable_${new Date().toISOString().split('T')[0]}.ics`;
    link.click();
    addToast({ type: 'success', title: 'Timetable Exported', message: 'Saved as .ics calendar file.' });
  };

  const selectedDayClasses = classes
    .filter((c) => c.dayOfWeek === selectedDay)
    .sort((a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime));

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">Class Timetable</h1>
          <p className="text-sm text-zinc-300 mt-0.5">
            Weekly class schedule, rooms, faculty, and clash detection
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View switcher */}
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-sm">
            {(['day', 'week', 'list'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3.5 py-1.5 rounded-lg font-medium capitalize transition-all ${
                  viewMode === mode
                    ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {mode === 'day' ? 'Daily' : mode === 'week' ? 'Weekly' : 'List'}
              </button>
            ))}
          </div>

          <button
            onClick={() => onOpenPdfImport('timetable')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-xl text-sm font-medium transition-colors"
          >
            <FileUp className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span> PDF
          </button>

          <button
            onClick={handleExportIcs}
            className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl transition-colors"
            title="Export to Calendar (.ICS)"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => onOpenQuickAdd('class')}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Class</span>
          </button>
        </div>
      </div>

      {/* 2. Conflict Warnings Banner */}
      {conflicts.length > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <h3 className="font-bold text-amber-300">
              Timetable Conflict Detected ({conflicts.length})
            </h3>
            <p className="text-zinc-300 mt-0.5">
              Overlapping classes scheduled at the same time:
            </p>
            <ul className="mt-1 space-y-0.5 text-amber-200/90 list-disc list-inside">
              {conflicts.map(([a, b], idx) => (
                <li key={idx}>
                  &ldquo;{a.title}&rdquo; ({a.startTime}-{a.endTime}) and &ldquo;{b.title}&rdquo; (
                  {b.startTime}-{b.endTime}) on {weekdays.find((w) => w.id === a.dayOfWeek)?.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 3. Mobile-First Day Selector Carousel */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
        {weekdays.map((day) => {
          const isSelected = selectedDay === day.id;
          const dayClassesCount = classes.filter((c) => c.dayOfWeek === day.id && !c.isCancelled).length;
          const isToday = currentDayOfWeek === day.id;

          return (
            <button
              key={day.id}
              onClick={() => {
                setSelectedDay(day.id);
                if (viewMode === 'week') setViewMode('day');
              }}
              className={`flex-1 min-w-[70px] sm:min-w-[85px] py-2 sm:py-2.5 px-2 rounded-xl text-center border transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md font-bold'
                  : isToday
                  ? 'bg-zinc-900 border-indigo-500/50 text-indigo-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="text-xs uppercase font-bold tracking-wider opacity-90">
                {day.short}
              </div>
              <div className="text-xs sm:text-sm font-semibold mt-0.5">
                {dayClassesCount} {dayClassesCount === 1 ? 'class' : 'classes'}
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. Day View (Clean, touch-friendly chronological cards) */}
      {viewMode === 'day' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold text-zinc-200">
              {weekdays.find((w) => w.id === selectedDay)?.name}&apos;s Classes
            </h2>
            <span className="text-sm text-zinc-400">
              {selectedDayClasses.length} {selectedDayClasses.length === 1 ? 'class' : 'classes'}
            </span>
          </div>

          {selectedDayClasses.length === 0 ? (
            <div className="p-10 text-center bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-2">
              <CalendarIcon className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-sm font-semibold text-zinc-300">No classes on this day</p>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Enjoy your free time or schedule a study task for this slot.
              </p>
              <button
                onClick={() => onOpenQuickAdd('class')}
                className="mt-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold"
              >
                + Add Class
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {selectedDayClasses.map((cls) => {
                const parentSubj = subjects.find((s) => s.id === cls.subjectId);
                const color = parentSubj?.color || cls.color || '#3B82F6';

                return (
                  <div
                    key={cls.id}
                    className={`p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between gap-3 shadow-xs transition-all ${
                      cls.isCancelled ? 'opacity-60 line-through' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Time pill */}
                      <div className="w-20 shrink-0 font-mono text-center">
                        <span className="text-sm font-bold text-zinc-100 block">
                          {formatTime12h(cls.startTime)}
                        </span>
                        <span className="text-xs text-zinc-400 block font-mono">
                          {formatTime12h(cls.endTime)}
                        </span>
                      </div>

                      {/* Color Bar */}
                      <div
                        className="w-1.5 h-11 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />

                      {/* Details */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-semibold text-zinc-100 truncate">
                            {cls.title}
                          </h3>
                          {parentSubj?.code && (
                            <span className="text-xs font-mono font-medium text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 shrink-0">
                              {parentSubj.code}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-zinc-300 mt-1">
                          {cls.room && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                              {cls.room}
                            </span>
                          )}
                          {cls.faculty && (
                            <span className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-zinc-400" />
                              {cls.faculty}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() =>
                          updateClassEvent(cls.id, { isCancelled: !cls.isCancelled })
                        }
                        title={cls.isCancelled ? 'Restore Class' : 'Mark Cancelled'}
                        className="p-2 text-zinc-400 hover:text-amber-400 rounded-lg hover:bg-zinc-800 min-w-[38px] min-h-[38px] flex items-center justify-center"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteClassEvent(cls.id)}
                        title="Delete Class"
                        className="p-2 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-zinc-800 min-w-[38px] min-h-[38px] flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. Week Grid View */}
      {viewMode === 'week' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 overflow-x-auto shadow-sm">
          <div className="min-w-[760px]">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-2 pb-3 border-b border-zinc-800">
              {weekdays.slice(0, 6).map((day) => {
                const dayClasses = classes.filter((c) => c.dayOfWeek === day.id && !c.isCancelled);
                const isToday = currentDayOfWeek === day.id;

                return (
                  <div
                    key={day.id}
                    className={`p-2.5 rounded-xl text-center ${
                      isToday
                        ? 'bg-indigo-600/10 border border-indigo-500/30 text-indigo-400'
                        : 'bg-zinc-800/40 text-zinc-300'
                    }`}
                  >
                    <p className="text-sm font-bold">{day.name}</p>
                    <span className="text-xs text-zinc-400">{dayClasses.length} classes</span>
                  </div>
                );
              })}
              {/* Sunday */}
              {(() => {
                const sunClasses = classes.filter((c) => c.dayOfWeek === 0 && !c.isCancelled);
                const isToday = currentDayOfWeek === 0;
                return (
                  <div
                    className={`p-2.5 rounded-xl text-center ${
                      isToday
                        ? 'bg-indigo-600/10 border border-indigo-500/30 text-indigo-400'
                        : 'bg-zinc-800/40 text-zinc-400'
                    }`}
                  >
                    <p className="text-sm font-bold">Sunday</p>
                    <span className="text-xs text-zinc-400">{sunClasses.length} classes</span>
                  </div>
                );
              })()}
            </div>

            {/* Daily Columns */}
            <div className="grid grid-cols-7 gap-2 pt-3 min-h-[400px]">
              {[1, 2, 3, 4, 5, 6, 0].map((dayId) => {
                const dayClasses = classes
                  .filter((c) => c.dayOfWeek === dayId)
                  .sort((a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime));

                return (
                  <div key={dayId} className="space-y-2 min-h-[250px] bg-zinc-950/40 rounded-xl p-2">
                    {dayClasses.length === 0 ? (
                      <div className="h-full flex items-center justify-center p-3 text-center">
                        <span className="text-xs text-zinc-500">Free Day</span>
                      </div>
                    ) : (
                      dayClasses.map((cls) => {
                        const parentSubj = subjects.find((s) => s.id === cls.subjectId);
                        const color = parentSubj?.color || cls.color || '#3B82F6';

                        return (
                          <div
                            key={cls.id}
                            className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                              cls.isCancelled
                                ? 'bg-zinc-900/40 border-zinc-800 text-zinc-500 line-through'
                                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 shadow-xs'
                            }`}
                            style={{
                              borderLeftColor: color,
                              borderLeftWidth: '3px',
                            }}
                          >
                            <span className="font-semibold text-zinc-100 block truncate text-xs sm:text-sm">
                              {cls.title}
                            </span>
                            <div className="text-xs text-zinc-300 font-mono">
                              {formatTime12h(cls.startTime)} - {formatTime12h(cls.endTime)}
                            </div>
                            {cls.room && (
                              <div className="text-xs text-zinc-400 truncate">
                                {cls.room}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 6. List View */}
      {viewMode === 'list' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 space-y-2.5">
          {classes
            .sort(
            (a, b) =>
              a.dayOfWeek - b.dayOfWeek ||
              timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime)
          )
          .map((cls) => {
            const parentSubj = subjects.find((s) => s.id === cls.subjectId);
            const dayName = weekdays.find((w) => w.id === cls.dayOfWeek)?.name;

            return (
              <div
                key={cls.id}
                className="p-3.5 bg-zinc-800/40 border border-zinc-700/60 rounded-xl flex items-center justify-between text-xs sm:text-sm gap-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-semibold text-indigo-400 w-18 sm:w-24 shrink-0">
                    {dayName}
                  </span>
                  <span className="font-mono text-zinc-300 w-28 sm:w-32 shrink-0 text-xs sm:text-sm">
                    {formatTime12h(cls.startTime)} - {formatTime12h(cls.endTime)}
                  </span>
                  <span className="font-bold text-zinc-100 truncate">{cls.title}</span>
                </div>

                <button
                  onClick={() => deleteClassEvent(cls.id)}
                  className="p-2 text-zinc-400 hover:text-rose-400 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
