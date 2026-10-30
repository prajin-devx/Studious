import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Users,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Trash2,
  Edit2,
  Clock,
  Flag,
  ArrowRight,
  Check,
  Archive,
  ArchiveRestore,
  Link as LinkIcon,
  HelpCircle,
  X,
  AlertTriangle,
  BookOpen,
  Info,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { calculateDaysRemaining, calculateProjectProgress } from '../../utils/academicCalculations';
import { Project, ProjectStatus, ProjectTask, ProjectTaskStatus } from '../../types';

interface ProjectsModuleProps {
  onOpenQuickAdd: (type?: any) => void;
}

export function ProjectsModule({ onOpenQuickAdd }: ProjectsModuleProps) {
  const {
    projects,
    projectTasks,
    subjects,
    toggleProjectMilestone,
    addProjectTask,
    setProjectTaskStatus,
    deleteProjectTask,
    deleteProject,
    updateProject,
    addToast,
  } = useAcademic();

  const [activeTabFilter, setActiveTabFilter] = useState<'active' | 'archived'>('active');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [memberFilter, setMemberFilter] = useState<string>('all');

  // Modals state
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showNewMilestoneModal, setShowNewMilestoneModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewMemberModal, setShowNewMemberModal] = useState(false);

  // Form states
  // Edit Project
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editProjectType, setEditProjectType] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editStatus, setEditStatus] = useState<ProjectStatus>('in_progress');
  const [editUrl, setEditUrl] = useState('');

  // Link Modal
  const [linkInputUrl, setLinkInputUrl] = useState('');

  // Milestone Modal
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDueDate, setMilestoneDueDate] = useState('');

  // Task creation modal
  const [taskTitle, setTaskTitle] = useState('');
  const [taskMemberId, setTaskMemberId] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Member modal
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('Contributor');

  // Filter projects by active vs archived
  const activeProjects = projects.filter((p) => p.status !== 'archived');
  const archivedProjects = projects.filter((p) => p.status === 'archived');
  const visibleProjects = activeTabFilter === 'active' ? activeProjects : archivedProjects;

  // Selected project logic
  const currentProject =
    visibleProjects.find((p) => p.id === selectedProjectId) ||
    visibleProjects[0] ||
    projects.find((p) => p.id === selectedProjectId) ||
    projects[0];

  const currentProjectTasks = currentProject
    ? projectTasks.filter((t) => t.projectId === currentProject.id)
    : [];

  const taskProgress = calculateProjectProgress(currentProjectTasks);

  const completedMilestones =
    currentProject?.milestones?.filter((m) => m.isCompleted).length || 0;
  const totalMilestones = currentProject?.milestones?.length || 0;

  const filteredTasks = currentProjectTasks.filter((t) => {
    if (memberFilter === 'all') return true;
    return t.assignedMemberId === memberFilter;
  });

  // Open Edit Project modal prefilled
  const handleOpenEditProject = () => {
    if (!currentProject) return;
    setEditTitle(currentProject.title);
    setEditDescription(currentProject.description || '');
    setEditProjectType(currentProject.projectType || 'Course Project');
    setEditDeadline(currentProject.deadline);
    setEditStatus(currentProject.status || 'in_progress');
    setEditUrl(currentProject.projectUrl || '');
    setShowEditProjectModal(true);
  };

  const handleSaveEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !editTitle.trim()) return;

    let formattedUrl = editUrl.trim();
    if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    await updateProject(currentProject.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      projectType: editProjectType.trim(),
      deadline: editDeadline,
      status: editStatus,
      projectUrl: formattedUrl || undefined,
    });

    setShowEditProjectModal(false);
    addToast({ type: 'success', title: 'Project Details Updated' });
  };

  // Quick Status change directly from banner
  const handleQuickStatusChange = async (newStatus: ProjectStatus) => {
    if (!currentProject) return;
    await updateProject(currentProject.id, { status: newStatus });
    addToast({
      type: 'success',
      title: 'Status Updated',
      message: `Project marked as "${newStatus.replace('_', ' ').toUpperCase()}".`,
    });
  };

  // Toggle Completed status
  const handleToggleComplete = async () => {
    if (!currentProject) return;
    const isCompleted = currentProject.status === 'completed';
    const newStatus: ProjectStatus = isCompleted ? 'in_progress' : 'completed';
    await updateProject(currentProject.id, { status: newStatus });
    addToast({
      type: 'success',
      title: isCompleted ? 'Project Reopened' : 'Project Completed! 🎉',
      message: isCompleted
        ? 'Project moved back to in-progress.'
        : 'All milestones and requirements finalized.',
    });
  };

  // Archive / Unarchive
  const handleToggleArchive = async () => {
    if (!currentProject) return;
    const isArchived = currentProject.status === 'archived';
    const newStatus: ProjectStatus = isArchived ? 'in_progress' : 'archived';
    await updateProject(currentProject.id, { status: newStatus });
    addToast({
      type: 'info',
      title: isArchived ? 'Project Restored' : 'Project Archived',
      message: isArchived
        ? `"${currentProject.title}" restored to Active Projects.`
        : `"${currentProject.title}" moved to Archived.`,
    });
    // Switch tab if appropriate
    if (!isArchived && activeProjects.length <= 1) {
      setActiveTabFilter('archived');
    }
  };

  // Save Link
  const handleOpenLinkModal = () => {
    if (!currentProject) return;
    setLinkInputUrl(currentProject.projectUrl || '');
    setShowLinkModal(true);
  };

  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;
    let url = linkInputUrl.trim();
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    await updateProject(currentProject.id, { projectUrl: url || undefined });
    setShowLinkModal(false);
    addToast({
      type: 'success',
      title: url ? 'Project Link Saved' : 'Project Link Removed',
      message: url ? 'Repository / document link attached.' : 'Link cleared.',
    });
  };

  // Delete project
  const handleConfirmDelete = async () => {
    if (!currentProject) return;
    const projId = currentProject.id;
    await deleteProject(projId);
    setShowDeleteConfirm(false);
    setSelectedProjectId('');
  };

  // Add Milestone
  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !milestoneTitle.trim()) return;

    const newMilestone = {
      id: 'ms-' + Math.random().toString(36).substring(2, 7),
      title: milestoneTitle.trim(),
      dueDate: milestoneDueDate || currentProject.deadline,
      isCompleted: false,
    };

    const updatedMilestones = [...(currentProject.milestones || []), newMilestone];
    await updateProject(currentProject.id, { milestones: updatedMilestones });
    setMilestoneTitle('');
    setMilestoneDueDate('');
    setShowNewMilestoneModal(false);
    addToast({ type: 'success', title: 'Milestone Added' });
  };

  // Task creation
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !currentProject) return;
    await addProjectTask({
      projectId: currentProject.id,
      title: taskTitle.trim(),
      assignedMemberId: taskMemberId || undefined,
      dueDate: taskDueDate || undefined,
      priority: taskPriority,
      status: 'not_started',
    });
    setTaskTitle('');
    setShowNewTaskModal(false);
    addToast({ type: 'success', title: 'Task Created' });
  };

  // Member creation
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !currentProject) return;
    const newMembers = [
      ...currentProject.members,
      {
        id: 'm-' + Math.random().toString(36).substring(2, 7),
        name: memberName.trim(),
        role: memberRole.trim(),
      },
    ];
    await updateProject(currentProject.id, { members: newMembers });
    setMemberName('');
    setShowNewMemberModal(false);
    addToast({ type: 'success', title: 'Team Member Added' });
  };

  // Status badge styling helper
  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-500',
          label: 'Completed',
        };
      case 'in_progress':
        return {
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
          dot: 'bg-indigo-500',
          label: 'In Progress',
        };
      case 'on_hold':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-500',
          label: 'On Hold',
        };
      case 'archived':
        return {
          bg: 'bg-zinc-800 text-zinc-400 border-zinc-700',
          dot: 'bg-zinc-500',
          label: 'Archived',
        };
      case 'planned':
      default:
        return {
          bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
          dot: 'bg-sky-500',
          label: 'Planned',
        };
    }
  };

  const statusInfo = currentProject ? getStatusBadge(currentProject.status) : null;
  const isProjectCompleted = currentProject?.status === 'completed';
  const isProjectArchived = currentProject?.status === 'archived';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
              Group Projects & Capstones
            </h1>
            <button
              onClick={() => setShowGuideModal(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-semibold transition-colors"
              title="Click for full Projects Guide"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Projects Guide</span>
            </button>
          </div>
          <p className="text-sm text-zinc-400 mt-1.5">
            Organize team responsibilities, milestones, repository links, deliverables, and completion status
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onOpenQuickAdd('project')}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Guide Collapsible Teaser */}
      <div className="p-4 bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-zinc-900 border border-indigo-500/20 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100">
              Need help managing links, completion status, or archiving projects?
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Read the quick step-by-step guide on status assignment, GitHub links, archiving, and deletion.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowGuideModal(true)}
          className="self-start md:self-auto px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span>Open Guide</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. Filter Tabs (Active vs Archived) & Project Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Active / Archived Pill Filter */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTabFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTabFilter === 'active'
                  ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Active Projects ({activeProjects.length})
            </button>
            <button
              onClick={() => setActiveTabFilter('archived')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTabFilter === 'archived'
                  ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archived ({archivedProjects.length})</span>
            </button>
          </div>
        </div>

        {/* Project Selector Pills */}
        {visibleProjects.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {visibleProjects.map((proj) => {
              const isSelected = proj.id === currentProject?.id;
              const isDone = proj.status === 'completed';
              return (
                <button
                  key={proj.id}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 border flex items-center gap-2 ${
                    isSelected
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-100 font-semibold shadow-sm'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  <span>{proj.title}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Main Project Workspace */}
      {currentProject ? (
        <div className="space-y-6">
          {/* Project Details Banner */}
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-sm space-y-5 relative overflow-hidden">
            {isProjectCompleted && (
              <div className="absolute top-0 right-0 bg-emerald-500/10 border-b border-l border-emerald-500/20 px-4 py-1 rounded-bl-xl text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>PROJECT COMPLETED</span>
              </div>
            )}

            {isProjectArchived && (
              <div className="absolute top-0 right-0 bg-zinc-800 border-b border-l border-zinc-700 px-4 py-1 rounded-bl-xl text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                <Archive className="w-3.5 h-3.5" />
                <span>ARCHIVED RECORD</span>
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pt-2">
              <div className="space-y-2 max-w-3xl">
                {/* Meta pills: Type, Status, Deadline */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/20">
                    {currentProject.projectType}
                  </span>

                  {/* Status Dropdown */}
                  {statusInfo && (
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border flex items-center gap-1.5 ${statusInfo.bg}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
                        <span>{statusInfo.label}</span>
                      </span>

                      <select
                        value={currentProject.status}
                        onChange={(e) => handleQuickStatusChange(e.target.value as ProjectStatus)}
                        className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-2 py-0.5 focus:outline-hidden"
                        title="Change project status"
                      >
                        <option value="in_progress">Set: In Progress</option>
                        <option value="completed">Set: Completed</option>
                        <option value="planned">Set: Planned</option>
                        <option value="on_hold">Set: On Hold</option>
                        <option value="archived">Set: Archived</option>
                      </select>
                    </div>
                  )}

                  <span className="text-xs text-zinc-500">•</span>
                  <span className="text-sm text-zinc-300 font-medium">
                    Deadline: {currentProject.deadline} (
                    {calculateDaysRemaining(currentProject.deadline, new Date())} days left)
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100">
                  {currentProject.title}
                </h2>

                {currentProject.description && (
                  <p className="text-sm text-zinc-300 mt-1 max-w-2xl leading-relaxed">
                    {currentProject.description}
                  </p>
                )}
              </div>

              {/* Progress Gauge */}
              <div className="flex items-center gap-6 shrink-0 bg-zinc-800/40 p-4 rounded-xl border border-zinc-700/50">
                <div>
                  <div className="flex items-baseline justify-end gap-1.5">
                    <span className="text-2xl font-mono font-bold text-zinc-100">
                      {taskProgress.percentage}%
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">tasks</span>
                  </div>
                  <div className="w-32 bg-zinc-800 h-2.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${taskProgress.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-zinc-400 mt-1.5 text-right font-medium">
                    {taskProgress.completed}/{taskProgress.total} tasks completed
                  </p>
                </div>
              </div>
            </div>

            {/* Project Action Toolbar: Link, Complete, Edit, Archive, Delete */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between flex-wrap gap-3">
              {/* External Repo / Docs Link Area */}
              <div className="flex items-center gap-2">
                {currentProject.projectUrl ? (
                  <div className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-xl">
                    <a
                      href={currentProject.projectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"
                      title="Open external project link"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="max-w-xs truncate">
                        {currentProject.projectUrl.replace(/^https?:\/\//, '')}
                      </span>
                    </a>
                    <button
                      onClick={handleOpenLinkModal}
                      className="p-1 text-zinc-400 hover:text-zinc-200 ml-1 rounded hover:bg-zinc-700"
                      title="Edit Link"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleOpenLinkModal}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>+ Add Repo / Docs Link</span>
                  </button>
                )}
              </div>

              {/* Action Buttons: Status toggle, Edit, Archive, Delete */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* 1. Complete / Reopen Button */}
                <button
                  onClick={handleToggleComplete}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
                    isProjectCompleted
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isProjectCompleted ? 'Reopen Project' : 'Mark Completed'}</span>
                </button>

                {/* 2. Edit Project Details */}
                <button
                  onClick={handleOpenEditProject}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>

                {/* 3. Archive / Restore Button */}
                <button
                  onClick={handleToggleArchive}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-xl text-xs font-semibold transition-colors"
                  title={isProjectArchived ? 'Restore to active projects' : 'Move to archive'}
                >
                  {isProjectArchived ? (
                    <>
                      <ArchiveRestore className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Restore</span>
                    </>
                  ) : (
                    <>
                      <Archive className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Archive</span>
                    </>
                  )}
                </button>

                {/* 4. Delete Project Button */}
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border border-transparent hover:border-rose-500/20"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Milestones Horizontal Bar */}
            <div className="pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-sm font-semibold text-zinc-200">
                  Project Milestones ({completedMilestones}/{totalMilestones})
                </span>
                <button
                  onClick={() => setShowNewMilestoneModal(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  + Add Milestone
                </button>
              </div>

              {currentProject.milestones && currentProject.milestones.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  {currentProject.milestones.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleProjectMilestone(currentProject.id, m.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                        m.isCompleted
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                          : 'bg-zinc-800/40 border-zinc-700/60 text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                          m.isCompleted
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'border-zinc-600 text-transparent'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{m.title}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">Due: {m.dueDate}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-800 text-center">
                  <p className="text-xs text-zinc-400">
                    No milestones added yet. Add deliverables like "System Design", "Alpha Demo", or "Final Presentation".
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Team Members & Tasks Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Team Members Column */}
            <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Team Members ({currentProject.members.length})
                  </h3>
                </div>
                <button
                  onClick={() => setShowNewMemberModal(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  + Add Member
                </button>
              </div>

              <div className="space-y-2">
                {currentProject.members.map((member) => (
                  <div
                    key={member.id}
                    className="p-3 bg-zinc-800/50 border border-zinc-700/60 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-zinc-100">{member.name}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{member.role}</p>
                    </div>
                    <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                      {currentProjectTasks.filter((t) => t.assignedMemberId === member.id).length} tasks
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks Management Column (2 cols) */}
            <div className="lg:col-span-2 p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Project Work Breakdown ({currentProjectTasks.length} tasks)
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {/* Member filter */}
                  <select
                    value={memberFilter}
                    onChange={(e) => setMemberFilter(e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 rounded-xl px-2.5 py-1.5 focus:outline-hidden"
                  >
                    <option value="all">All Members</option>
                    {currentProject.members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setShowNewTaskModal(true)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                  >
                    + Add Task
                  </button>
                </div>
              </div>

              {filteredTasks.length === 0 ? (
                <div className="p-8 text-center bg-zinc-800/20 border border-zinc-800 rounded-xl">
                  <p className="text-xs text-zinc-400">No project tasks found matching filter.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTasks.map((task) => {
                    const isCompleted = task.status === 'completed';
                    const assignedMember = currentProject.members.find(
                      (m) => m.id === task.assignedMemberId
                    );

                    return (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                          isCompleted
                            ? 'bg-zinc-900/40 border-zinc-800/60 opacity-60'
                            : 'bg-zinc-800/40 border-zinc-700/60 hover:bg-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            onClick={() =>
                              setProjectTaskStatus(
                                task.id,
                                isCompleted ? 'not_started' : 'completed'
                              )
                            }
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                              isCompleted
                                ? 'bg-emerald-600 border-emerald-500 text-white'
                                : 'border-zinc-600 text-transparent'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                          </button>

                          <div className="min-w-0">
                            <p
                              className={`text-sm font-semibold truncate ${
                                isCompleted ? 'line-through text-zinc-500' : 'text-zinc-200'
                              }`}
                            >
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                              {assignedMember && <span>👤 {assignedMember.name}</span>}
                              {task.dueDate && <span>• Due: {task.dueDate}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-xs uppercase font-bold px-2 py-0.5 rounded ${
                              task.priority === 'high'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {task.priority}
                          </span>
                          <button
                            onClick={() => deleteProjectTask(task.id)}
                            className="p-1 text-zinc-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-zinc-900 border border-zinc-800 rounded-2xl">
          <FolderKanban className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-200">
            {activeTabFilter === 'archived' ? 'No Archived Projects' : 'No Active Projects Found'}
          </h3>
          <p className="text-sm text-zinc-400 max-w-sm mx-auto mt-1.5">
            {activeTabFilter === 'archived'
              ? 'Archived projects from previous semesters will appear here for reference.'
              : 'Create a course group project, laboratory team, or capstone to coordinate.'}
          </p>
          {activeTabFilter === 'active' ? (
            <button
              onClick={() => onOpenQuickAdd('project')}
              className="mt-4 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold"
            >
              Create Project
            </button>
          ) : (
            <button
              onClick={() => setActiveTabFilter('active')}
              className="mt-4 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-sm font-semibold"
            >
              Back to Active Projects
            </button>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MODALS & GUIDES */}
      {/* ======================================================== */}

      {/* Comprehensive Projects Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl p-6 sm:p-7 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-100">
                  How to Use the Projects Module
                </h2>
                <p className="text-xs text-zinc-400">
                  Step-by-step instructions for managing capstones, group projects, and deliverables
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Step 1: Status Assignment */}
              <div className="p-4 bg-zinc-800/40 border border-zinc-700/60 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs">1</span>
                  <h4>Assigning & Toggling Project Status (Completed / In Progress)</h4>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  You can assign and switch the status of any project in two ways:
                </p>
                <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-5">
                  <li>
                    <strong>Quick "Mark Completed" Button:</strong> Click the green <em>"Mark Completed"</em> button directly in the project header toolbar to instantly mark all requirements satisfied. Click <em>"Reopen Project"</em> if you need to continue work.
                  </li>
                  <li>
                    <strong>Status Dropdown:</strong> Select any status directly from the dropdown next to the project title: <code>Planned</code>, <code>In Progress</code>, <code>On Hold</code>, <code>Completed</code>, or <code>Archived</code>.
                  </li>
                </ul>
              </div>

              {/* Step 2: Adding Links */}
              <div className="p-4 bg-zinc-800/40 border border-zinc-700/60 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs">2</span>
                  <h4>Attaching External Links (GitHub, Google Drive, Notion, Figma)</h4>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Every project can hold an external repository or documentation link:
                </p>
                <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-5">
                  <li>Click the <strong>"+ Add Repo / Docs Link"</strong> button in the action bar.</li>
                  <li>Paste your link (e.g. <code>https://github.com/myteam/capstone</code> or Google Drive presentation link).</li>
                  <li>Once added, clicking the button immediately opens the repository in a new tab, and you can edit or replace it anytime via the pencil icon.</li>
                </ul>
              </div>

              {/* Step 3: Archiving */}
              <div className="p-4 bg-zinc-800/40 border border-zinc-700/60 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs">3</span>
                  <h4>Archiving vs Active Projects</h4>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  When a semester ends or a project is done:
                </p>
                <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-5">
                  <li>Click the <strong>"Archive"</strong> button in the project action toolbar.</li>
                  <li>The project moves to the <strong>"Archived"</strong> tab to keep your active workspace clean.</li>
                  <li>You can review past projects anytime by clicking <em>"Archived (X)"</em> at the top, or click <em>"Restore"</em> to move it back to Active.</li>
                </ul>
              </div>

              {/* Step 4: Deleting */}
              <div className="p-4 bg-zinc-800/40 border border-zinc-700/60 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-xs">4</span>
                  <h4>Deleting a Project Permanently</h4>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Click the <strong>Trash Can Icon</strong> on the right side of the project action bar. A confirmation prompt will ask you to verify before permanently deleting the project and its tasks.
                </p>
              </div>

              {/* Step 5: Team Members & Tasks */}
              <div className="p-4 bg-zinc-800/40 border border-zinc-700/60 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs">5</span>
                  <h4>Milestones & Team Task Allocation</h4>
                </div>
                <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-5">
                  <li>Click <strong>"+ Add Milestone"</strong> to add phases like "Literature Survey", "Hardware Assembly", or "Final Submission".</li>
                  <li>Click <strong>"+ Add Member"</strong> to add group partners with roles (e.g. Lead, Hardware, Documentation).</li>
                  <li>Click <strong>"+ Add Task"</strong> to break down work and assign each task to a specific teammate with due dates.</li>
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Got It! Back to Projects
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-base font-bold text-zinc-100">Edit Project Details</h3>
              <button
                onClick={() => setShowEditProjectModal(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Description & Scope
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Project Type
                  </label>
                  <input
                    type="text"
                    value={editProjectType}
                    onChange={(e) => setEditProjectType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Final Deadline
                  </label>
                  <input
                    type="date"
                    required
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Project Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as ProjectStatus)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="planned">Planned</option>
                    <option value="on_hold">On Hold</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Repo / Document URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://github.com/..."
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowEditProjectModal(false)}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-indigo-400" />
                <h3 className="text-base font-bold text-zinc-100">Project External Link</h3>
              </div>
              <button
                onClick={() => setShowLinkModal(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLink} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Repository, Docs, or Presentation URL
                </label>
                <input
                  type="text"
                  placeholder="https://github.com/myteam/capstone"
                  value={linkInputUrl}
                  onChange={(e) => setLinkInputUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                />
                <p className="text-xs text-zinc-500 mt-1.5">
                  Attach your GitHub repository, Google Docs, Drive folder, Figma board, or Notion page.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-800">
                {currentProject?.projectUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setLinkInputUrl('');
                    }}
                    className="mr-auto px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300"
                  >
                    Clear Link
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Save Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Project Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-100">Delete Project?</h3>
                <p className="text-xs text-zinc-400 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-zinc-300">
              Are you sure you want to permanently delete <strong>"{currentProject?.title}"</strong>?
              All associated tasks and milestones will be removed.
            </p>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-rose-600/20"
              >
                Yes, Delete Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {showNewMilestoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-base font-bold text-zinc-100">Add Milestone</h3>
              <button
                onClick={() => setShowNewMilestoneModal(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMilestone} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Milestone Deliverable
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Software Requirements Specification (SRS)"
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Due Date
                </label>
                <input
                  type="date"
                  required
                  value={milestoneDueDate}
                  onChange={(e) => setMilestoneDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowNewMilestoneModal(false)}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Creation Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-semibold text-zinc-100">Add Project Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement API route"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Assign Member
                  </label>
                  <select
                    value={taskMemberId}
                    onChange={(e) => setTaskMemberId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="">Unassigned</option>
                    {currentProject?.members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Priority
                </label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Creation Modal */}
      {showNewMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-semibold text-zinc-100">Add Team Member</h3>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Member Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Lee"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Role / Responsibility
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Frontend & UI Architecture"
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowNewMemberModal(false)}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
