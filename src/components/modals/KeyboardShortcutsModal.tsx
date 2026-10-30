import React, { useState } from 'react';
import { X, Command, Search, Navigation, Zap, HelpCircle } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

interface ShortcutItem {
  keys: string[];
  label: string;
  description?: string;
  target?: string;
}

interface ShortcutSection {
  category: string;
  icon: any;
  items: ShortcutItem[];
}

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
  onNavigate,
}: KeyboardShortcutsModalProps) {
  const [filterQuery, setFilterQuery] = useState('');

  if (!isOpen) return null;

  const shortcutSections: ShortcutSection[] = [
    {
      category: 'Global Command & Quick Actions',
      icon: Zap,
      items: [
        { keys: ['⌘', 'K'], label: 'Open Global Search & Command Palette', description: 'Search all subjects, topics, assignments, exams' },
        { keys: ['C'], label: 'Quick Add Record', description: 'Open Quick-Add dialog for marks, tasks, notes, or assignments' },
        { keys: ['T'], label: 'Focus Timer', description: 'Open Pomodoro revision focus timer' },
        { keys: ['I'], label: 'Import Academic PDF', description: 'Import syllabus, timetable, or exam hall ticket' },
        { keys: ['?'], label: 'Shortcuts Cheat Sheet', description: 'Show this keyboard guide' },
        { keys: ['Esc'], label: 'Dismiss / Close Modal', description: 'Close any active drawer or modal' },
      ],
    },
    {
      category: 'Workspace Navigation (Press G then Key)',
      icon: Navigation,
      items: [
        { keys: ['G', 'H'], label: 'Go to Home Dashboard', target: 'home' },
        { keys: ['G', 'T'], label: 'Go to Timetable Schedule', target: 'timetable' },
        { keys: ['G', 'S'], label: 'Go to Subjects & Syllabus Tracker', target: 'subjects' },
        { keys: ['G', 'M'], label: 'Go to Test Marks & Performance', target: 'marks' },
        { keys: ['G', 'A'], label: 'Go to Assignments & Submissions', target: 'assignments' },
        { keys: ['G', 'P'], label: 'Go to Projects & Milestones', target: 'projects' },
        { keys: ['G', 'E'], label: 'Go to Exams & Schedule', target: 'exams' },
        { keys: ['G', 'R'], label: 'Go to Academic Progress Analytics', target: 'progress' },
        { keys: ['G', 'F'], label: 'Go to Study & Revision Tasks', target: 'study' },
        { keys: ['G', 'N'], label: 'Go to Settings & Cloud Backup', target: 'settings' },
      ],
    },
  ];

  const filteredSections = shortcutSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.label.toLowerCase().includes(filterQuery.toLowerCase()) ||
          item.keys.join(' ').toLowerCase().includes(filterQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(filterQuery.toLowerCase()))
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Command className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">Keyboard Shortcuts</h2>
              <p className="text-xs text-zinc-400">
                Speed through your semester with pro keyboard navigation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close shortcuts modal"
            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Input */}
        <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-950/40">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter shortcuts (e.g., marks, timer, search)..."
              className="w-full pl-9 pr-3 py-2 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {filteredSections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.category} className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  <Icon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{section.category}</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {section.items.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        if (item.target) {
                          onNavigate(item.target);
                          onClose();
                        }
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 transition-all ${
                        item.target ? 'cursor-pointer hover:bg-zinc-800/40' : ''
                      }`}
                    >
                      <div>
                        <div className="text-sm font-medium text-zinc-200">
                          {item.label}
                        </div>
                        {item.description && (
                          <div className="text-xs text-zinc-500 mt-0.5">
                            {item.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-3">
                        {item.keys.map((k, kIdx) => (
                          <kbd
                            key={kIdx}
                            className="px-2.5 py-1 text-xs font-mono font-semibold text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-lg shadow-inner min-w-[28px] text-center"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredSections.length === 0 && (
            <div className="text-center py-8 text-zinc-500 text-sm">
              No shortcuts found matching "{filterQuery}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
            <span>Shortcuts are active across all modules</span>
          </div>
          <span className="font-mono text-zinc-500">Studious v2.4 SaaS</span>
        </div>
      </div>
    </div>
  );
}
