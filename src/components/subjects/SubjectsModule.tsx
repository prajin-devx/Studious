import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  FileUp,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Trash2,
  Archive,
  RefreshCw,
  Printer,
  X,
  FileText,
  Calendar,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import {
  calculateSubjectProgress,
  calculateChapterProgress,
} from '../../utils/academicCalculations';
import { calculateBunkMargin } from '../../utils/attendanceCalculations';
import { AttendanceBunkModal } from '../modals/AttendanceBunkModal';
import { Subject, TopicStatus } from '../../types';

interface SubjectsModuleProps {
  onOpenPdfImport: (type?: any) => void;
  onOpenQuickAdd: (type?: any) => void;
}

export function SubjectsModule({ onOpenPdfImport, onOpenQuickAdd }: SubjectsModuleProps) {
  const {
    subjects,
    chapters,
    topics,
    addSubject,
    updateSubject,
    deleteSubject,
    archiveSubject,
    addChapter,
    deleteChapter,
    addTopic,
    setTopicStatus,
    bulkAddTopics,
    deleteTopic,
    addToast,
  } = useAcademic();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects.find((s) => !s.isArchived)?.id || subjects[0]?.id || ''
  );
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});
  const [topicSearch, setTopicSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'incomplete' | 'needs_revision'>('all');
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState<boolean>(false);
  const [attendanceModalSubjId, setAttendanceModalSubjId] = useState<string>('');

  // Modals for subject/chapter/topic creation
  const [showNewChapterModal, setShowNewChapterModal] = useState<boolean>(false);
  const [newChapterTitle, setNewChapterTitle] = useState<string>('');
  const [newChapterUnit, setNewChapterUnit] = useState<string>('Unit I');

  const [bulkTopicChapterId, setBulkTopicChapterId] = useState<string | null>(null);
  const [bulkTopicText, setBulkTopicText] = useState<string>('');

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const activeSubjects = subjects.filter((s) => (showArchived ? true : !s.isArchived));

  const subjectProgress = currentSubject
    ? calculateSubjectProgress(topics, currentSubject.id)
    : { total: 0, completed: 0, inProgress: 0, needsRevision: 0, percentage: 0 };

  const currentChapters = chapters.filter((c) => c.subjectId === currentSubject?.id);

  // Toggle chapter collapse
  const toggleChapter = (chapterId: string) => {
    setCollapsedChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const expandAll = () => setCollapsedChapters({});
  const collapseAll = () => {
    const next: Record<string, boolean> = {};
    currentChapters.forEach((c) => {
      next[c.id] = true;
    });
    setCollapsedChapters(next);
  };

  // Bulk add topics handler
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkTopicChapterId || !bulkTopicText.trim()) return;
    const lines = bulkTopicText.split('\n');
    await bulkAddTopics(bulkTopicChapterId, currentSubject.id, lines);
    setBulkTopicChapterId(null);
    setBulkTopicText('');
  };

  // Add chapter handler
  const handleAddChapterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterTitle.trim() || !currentSubject) return;
    await addChapter({
      subjectId: currentSubject.id,
      unitNumber: newChapterUnit,
      title: newChapterTitle.trim(),
      order: currentChapters.length + 1,
    });
    setNewChapterTitle('');
    setShowNewChapterModal(false);
  };

  // Printable checklist
  const handlePrintChecklist = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Syllabus & Topic Tracker
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Track units, chapters, revision queues, and deterministic completion metrics
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onOpenPdfImport('syllabus')}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-medium transition-colors"
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Import Syllabus PDF</span>
          </button>

          <button
            onClick={handlePrintChecklist}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl transition-colors"
            title="Print Syllabus Checklist"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={() => onOpenQuickAdd('subject')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Subject</span>
          </button>
        </div>
      </div>

      {/* 2. Subjects Horizontal Strip / Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {activeSubjects.map((s) => {
          const isSelected = s.id === currentSubject?.id;
          const progress = calculateSubjectProgress(topics, s.id);

          return (
            <button
              key={s.id}
              onClick={() => setSelectedSubjectId(s.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all shrink-0 ${
                isSelected
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-100 shadow-sm'
                  : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: s.color || '#3B82F6' }}
              />
              <div className="text-left">
                <span className="font-semibold block truncate max-w-[150px] text-sm">{s.name}</span>
                <span className="text-xs text-zinc-400 font-mono">
                  {s.code || 'NO-CODE'} • {progress.percentage}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Selected Subject Detail Card */}
      {currentSubject ? (
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-sm space-y-6">
          {/* Subject Metadata Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: currentSubject.color || '#3B82F6' }}
                />
                <h2 className="text-2xl font-bold text-zinc-100">{currentSubject.name}</h2>
                {currentSubject.code && (
                  <span className="text-xs font-mono font-medium text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                    {currentSubject.code}
                  </span>
                )}
                {currentSubject.isArchived && (
                  <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                    Archived
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-300 mt-1">
                {currentSubject.instructor ? `Instructor: ${currentSubject.instructor} • ` : ''}
                {currentSubject.credits ? `${currentSubject.credits} Credits • ` : ''}
                {currentChapters.length} Chapters total
              </p>
              {(() => {
                const attRes = calculateBunkMargin(
                  currentSubject.attendanceAttended ?? 24,
                  currentSubject.attendanceTotal ?? 28,
                  currentSubject.minAttendanceRequired || 75
                );
                return (
                  <button
                    onClick={() => {
                      setAttendanceModalSubjId(currentSubject.id);
                      setIsAttendanceModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-3 py-1 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/80 rounded-xl text-xs font-medium text-zinc-200 transition-colors mt-2"
                  >
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      Attendance: <strong className="font-mono text-zinc-100">{attRes.currentPercentage}%</strong> (
                      {attRes.status === 'safe'
                        ? `${attRes.safeBunksAvailable} Safe Bunks`
                        : attRes.status === 'warning'
                        ? '0 Bunks (Borderline)'
                        : `Shortage: Must attend ${attRes.classesNeededToRecover}`}
                      )
                    </span>
                  </button>
                );
              })()}
            </div>

            {/* Subject Level Progress */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="flex items-baseline justify-end gap-1.5">
                  <span className="text-3xl font-mono font-bold text-zinc-100">
                    {subjectProgress.percentage}%
                  </span>
                  <span className="text-xs text-zinc-400">completed</span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {subjectProgress.completed} of {subjectProgress.total} topics marked done
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-28 bg-zinc-800 h-2 rounded-full overflow-hidden shrink-0">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${subjectProgress.percentage}%` }}
                />
              </div>

              {/* Action dropdown or delete */}
              <button
                onClick={() => archiveSubject(currentSubject.id, !currentSubject.isArchived)}
                title={currentSubject.isArchived ? 'Restore' : 'Archive'}
                className="p-2 text-zinc-400 hover:text-zinc-200 bg-zinc-800 rounded-xl"
              >
                <Archive className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Bar & Chapter Expansion */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter topics..."
                  value={topicSearch}
                  onChange={(e) => setTopicSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-zinc-300"
              >
                <option value="all">All Topics</option>
                <option value="incomplete">Incomplete Only</option>
                <option value="needs_revision">Needs Revision Only</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={expandAll}
                className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded"
              >
                Expand all
              </button>
              <span className="text-zinc-700">•</span>
              <button
                onClick={collapseAll}
                className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded"
              >
                Collapse all
              </button>
              <button
                onClick={() => setShowNewChapterModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Chapter</span>
              </button>
            </div>
          </div>

          {/* Chapters and Topics Tree */}
          {currentChapters.length === 0 ? (
            <div className="p-8 text-center bg-zinc-950/40 rounded-2xl border border-zinc-800 space-y-3">
              <BookOpen className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-xs font-semibold text-zinc-300">No chapters in this syllabus</p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Add units and chapters manually or import the official syllabus PDF.
              </p>
              <button
                onClick={() => setShowNewChapterModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
              >
                Create Chapter
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {currentChapters.map((chapter) => {
                const isCollapsed = collapsedChapters[chapter.id];
                const chapterTopics = topics.filter((t) => t.chapterId === chapter.id);
                const chapterProgress = calculateChapterProgress(topics, chapter.id);

                const filteredTopics = chapterTopics.filter((t) => {
                  const matchSearch =
                    t.title.toLowerCase().includes(topicSearch.toLowerCase()) ||
                    t.notes?.toLowerCase().includes(topicSearch.toLowerCase());
                  if (!matchSearch) return false;
                  if (statusFilter === 'incomplete') return t.status !== 'completed';
                  if (statusFilter === 'needs_revision') return t.status === 'needs_revision';
                  return true;
                });

                return (
                  <div
                    key={chapter.id}
                    className="border border-zinc-800 bg-zinc-950/40 rounded-xl overflow-hidden transition-all"
                  >
                    {/* Chapter Header */}
                    <div className="p-3.5 bg-zinc-900/80 flex items-center justify-between border-b border-zinc-800/80">
                      <div
                        onClick={() => toggleChapter(chapter.id)}
                        className="flex items-center gap-2.5 cursor-pointer flex-1"
                      >
                        {isCollapsed ? (
                          <ChevronRight className="w-4 h-4 text-zinc-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-zinc-500" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            {chapter.unitNumber && (
                              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded">
                                {chapter.unitNumber}
                              </span>
                            )}
                            <h3 className="text-sm sm:text-base font-bold text-zinc-100">{chapter.title}</h3>
                          </div>
                        </div>
                      </div>

                      {/* Chapter Progress and Quick Actions */}
                      <div className="flex items-center gap-4 text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-zinc-300 font-medium">
                            {chapterProgress.completed}/{chapterProgress.total} ({chapterProgress.percentage}%)
                          </span>
                          <div className="w-16 bg-zinc-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${chapterProgress.percentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Bulk add topics button */}
                        <button
                          onClick={() => setBulkTopicChapterId(chapter.id)}
                          className="text-xs text-zinc-300 hover:text-indigo-400 font-medium px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                        >
                          + Paste Topics
                        </button>

                        <button
                          onClick={() => deleteChapter(chapter.id)}
                          title="Delete Chapter"
                          className="p-1.5 text-zinc-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Topics Checklist */}
                    {!isCollapsed && (
                      <div className="p-3 divide-y divide-zinc-800/50">
                        {filteredTopics.length === 0 ? (
                          <p className="text-sm text-zinc-500 py-3 text-center">
                            No topics matching filters in this chapter.
                          </p>
                        ) : (
                          filteredTopics.map((topic) => {
                            const isCompleted = topic.status === 'completed';
                            const isRevision = topic.status === 'needs_revision';
                            const isInProgress = topic.status === 'in_progress';

                            return (
                              <div
                                key={topic.id}
                                className="py-3 flex items-center justify-between gap-3 group"
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  {/* Checkbox status toggle */}
                                  <button
                                    onClick={() =>
                                      setTopicStatus(
                                        topic.id,
                                        isCompleted ? 'not_started' : 'completed'
                                      )
                                    }
                                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                      isCompleted
                                        ? 'bg-emerald-600 border-emerald-500 text-white'
                                        : isInProgress
                                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                                        : 'border-zinc-700 bg-zinc-800/40 text-transparent hover:border-zinc-500'
                                    }`}
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>

                                  <div className="min-w-0">
                                    <p
                                      className={`text-sm font-medium truncate ${
                                        isCompleted
                                          ? 'text-zinc-500 line-through'
                                          : 'text-zinc-100'
                                      }`}
                                    >
                                      {topic.title}
                                    </p>
                                    {topic.notes && (
                                      <p className="text-xs text-zinc-400 truncate mt-0.5">{topic.notes}</p>
                                    )}
                                  </div>
                                </div>

                                {/* Status Selector & Metadata */}
                                <div className="flex items-center gap-2 shrink-0">
                                  {topic.difficulty && (
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                                        topic.difficulty === 'hard'
                                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                          : topic.difficulty === 'medium'
                                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      }`}
                                    >
                                      {topic.difficulty}
                                    </span>
                                  )}

                                  {topic.revisionCount && topic.revisionCount > 0 ? (
                                    <span className="text-xs font-mono text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                                      Rev: {topic.revisionCount}
                                    </span>
                                  ) : null}

                                  {/* Status Select dropdown */}
                                  <select
                                    value={topic.status}
                                    onChange={(e) =>
                                      setTopicStatus(topic.id, e.target.value as TopicStatus)
                                    }
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border ${
                                      isCompleted
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : isRevision
                                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                        : isInProgress
                                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                        : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                                    }`}
                                  >
                                    <option value="not_started">Not Started</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="needs_revision">Needs Revision</option>
                                  </select>

                                  <button
                                    onClick={() => deleteTopic(topic.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-rose-400 transition-opacity"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center bg-zinc-900 border border-zinc-800 rounded-2xl">
          <BookOpen className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-200">No Subjects Created Yet</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
            Create your subjects to track chapters, topics, and syllabus readiness.
          </p>
          <button
            onClick={() => onOpenQuickAdd('subject')}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
          >
            Create Subject
          </button>
        </div>
      )}

      {/* 4. New Chapter Modal */}
      {showNewChapterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-2xl w-full max-w-md p-5 shadow-2xl relative">
            <h3 className="text-sm font-semibold mb-4">Add Chapter to Syllabus</h3>
            <form onSubmit={handleAddChapterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Unit Number</label>
                <input
                  type="text"
                  placeholder="e.g. Unit I"
                  value={newChapterUnit}
                  onChange={(e) => setNewChapterUnit(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Chapter Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Concurrency & Deadlocks"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-zinc-200"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewChapterModal(false)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                >
                  Add Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Bulk Topic Paste Modal */}
      {bulkTopicChapterId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-2xl w-full max-w-lg p-5 shadow-2xl relative">
            <h3 className="text-sm font-semibold mb-1">Bulk Create Topics</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Paste topic titles below (one per line). They will be added to this chapter.
            </p>
            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <textarea
                required
                rows={6}
                value={bulkTopicText}
                onChange={(e) => setBulkTopicText(e.target.value)}
                placeholder="Topic 1: Introduction to Kernels&#10;Topic 2: System Calls&#10;Topic 3: Monolithic vs Microkernel"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-zinc-200 placeholder-zinc-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBulkTopicChapterId(null)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                >
                  Create Topics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <AttendanceBunkModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        initialSubjectId={attendanceModalSubjId}
      />
    </div>
  );
}
