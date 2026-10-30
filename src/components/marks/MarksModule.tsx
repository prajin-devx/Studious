import React, { useState, useMemo } from 'react';
import {
  Award,
  Plus,
  Filter,
  Calculator,
  Download,
  Trash2,
  Edit2,
  TrendingUp,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  Sparkles,
  BarChart3,
  Percent,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { TestMark, TestType } from '../../types';
import {
  calculatePercentage,
  calculateGrade,
  calculateMarksSummary,
  calculateTargetNeeded,
  GradeInfo,
} from '../../utils/marksCalculations';

interface MarksModuleProps {
  onNavigate?: (tab: string) => void;
}

export function MarksModule({ onNavigate }: MarksModuleProps) {
  const { subjects, testMarks, addTestMark, updateTestMark, deleteTestMark, addToast } =
    useAcademic();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingMark, setEditingMark] = useState<TestMark | null>(null);
  const [deletingMarkId, setDeletingMarkId] = useState<string | null>(null);
  const [showTargetCalculator, setShowTargetCalculator] = useState<boolean>(false);

  // Form State for Add / Edit
  const [formSubjectId, setFormSubjectId] = useState<string>(subjects[0]?.id || '');
  const [formTestName, setFormTestName] = useState<string>('');
  const [formTestType, setFormTestType] = useState<TestType>('internal');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formMarksObtained, setFormMarksObtained] = useState<string>('');
  const [formMaxMarks, setFormMaxMarks] = useState<string>('50');
  const [formWeightage, setFormWeightage] = useState<string>('');
  const [formTargetMarks, setFormTargetMarks] = useState<string>('');
  const [formTopicsCovered, setFormTopicsCovered] = useState<string>('');
  const [formRemarks, setFormRemarks] = useState<string>('');

  // Target Calculator Simulator State
  const [desiredTargetPercent, setDesiredTargetPercent] = useState<number>(85);
  const [remainingWeightage, setRemainingWeightage] = useState<number>(40);

  // Filtered marks
  const filteredMarks = useMemo(() => {
    return testMarks
      .filter((m) => {
        if (selectedSubjectId !== 'all' && m.subjectId !== selectedSubjectId) return false;
        if (selectedType !== 'all' && m.testType !== selectedType) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [testMarks, selectedSubjectId, selectedType]);

  // Summary statistics for current filter
  const marksSummary = useMemo(() => {
    return calculateMarksSummary(filteredMarks);
  }, [filteredMarks]);

  // Overall performance across all tests
  const overallSummary = useMemo(() => {
    return calculateMarksSummary(testMarks);
  }, [testMarks]);

  // Real-time calculation for modal preview
  const liveObtained = parseFloat(formMarksObtained) || 0;
  const liveMax = parseFloat(formMaxMarks) || 0;
  const livePercentage = liveMax > 0 ? calculatePercentage(liveObtained, liveMax) : 0;
  const liveGrade: GradeInfo = calculateGrade(livePercentage);

  // Target Simulator result
  const targetResult = useMemo(() => {
    const marksForCalc =
      selectedSubjectId !== 'all'
        ? testMarks.filter((m) => m.subjectId === selectedSubjectId)
        : testMarks;
    return calculateTargetNeeded(marksForCalc, desiredTargetPercent, remainingWeightage);
  }, [testMarks, selectedSubjectId, desiredTargetPercent, remainingWeightage]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingMark(null);
    setFormSubjectId(selectedSubjectId !== 'all' ? selectedSubjectId : subjects[0]?.id || '');
    setFormTestName('');
    setFormTestType('internal');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormMarksObtained('');
    setFormMaxMarks('50');
    setFormWeightage('15');
    setFormTargetMarks('');
    setFormTopicsCovered('');
    setFormRemarks('');
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (m: TestMark) => {
    setEditingMark(m);
    setFormSubjectId(m.subjectId);
    setFormTestName(m.testName);
    setFormTestType(m.testType);
    setFormDate(m.date);
    setFormMarksObtained(m.marksObtained.toString());
    setFormMaxMarks(m.maxMarks.toString());
    setFormWeightage(m.weightage !== undefined ? m.weightage.toString() : '');
    setFormTargetMarks(m.targetMarks !== undefined ? m.targetMarks.toString() : '');
    setFormTopicsCovered(m.topicsCovered || '');
    setFormRemarks(m.remarks || '');
    setShowAddModal(true);
  };

  // Submit Add / Edit
  const handleSaveMark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTestName.trim()) {
      addToast({ type: 'warning', title: 'Missing Test Name', message: 'Please enter a test title.' });
      return;
    }
    const obtained = parseFloat(formMarksObtained);
    const max = parseFloat(formMaxMarks);
    if (isNaN(obtained) || isNaN(max) || max <= 0) {
      addToast({
        type: 'warning',
        title: 'Invalid Marks',
        message: 'Marks obtained and max marks must be valid numbers.',
      });
      return;
    }

    const percentage = calculatePercentage(obtained, max);
    const grade = calculateGrade(percentage).letter;
    const weightage = formWeightage ? parseFloat(formWeightage) : undefined;
    const targetMarks = formTargetMarks ? parseFloat(formTargetMarks) : undefined;

    if (editingMark) {
      await updateTestMark(editingMark.id, {
        subjectId: formSubjectId,
        testName: formTestName.trim(),
        testType: formTestType,
        date: formDate,
        marksObtained: obtained,
        maxMarks: max,
        percentage,
        weightage,
        targetMarks,
        grade,
        topicsCovered: formTopicsCovered.trim() || undefined,
        remarks: formRemarks.trim() || undefined,
      });
      addToast({ type: 'success', title: 'Test Mark Updated' });
    } else {
      await addTestMark({
        subjectId: formSubjectId,
        testName: formTestName.trim(),
        testType: formTestType,
        date: formDate,
        marksObtained: obtained,
        maxMarks: max,
        percentage,
        weightage,
        targetMarks,
        grade,
        topicsCovered: formTopicsCovered.trim() || undefined,
        remarks: formRemarks.trim() || undefined,
      });
      addToast({ type: 'success', title: 'Test Mark Recorded' });
    }

    setShowAddModal(false);
    setEditingMark(null);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredMarks.length === 0) {
      addToast({ type: 'info', title: 'No Data to Export' });
      return;
    }
    const headers = ['Subject', 'Test Name', 'Type', 'Date', 'Marks Obtained', 'Max Marks', 'Percentage', 'Grade', 'Weightage %', 'Topics Covered', 'Remarks'];
    const rows = filteredMarks.map((m) => {
      const subj = subjects.find((s) => s.id === m.subjectId)?.name || 'Unknown';
      return [
        `"${subj.replace(/"/g, '""')}"`,
        `"${m.testName.replace(/"/g, '""')}"`,
        m.testType,
        m.date,
        m.marksObtained,
        m.maxMarks,
        `${m.percentage ?? calculatePercentage(m.marksObtained, m.maxMarks)}%`,
        m.grade || calculateGrade(m.percentage ?? 0).letter,
        m.weightage || '',
        `"${(m.topicsCovered || '').replace(/"/g, '""')}"`,
        `"${(m.remarks || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Studious_Marks_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({ type: 'success', title: 'Marks CSV Exported' });
  };

  const currentSubjectObj = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
              Test Marks & Performance
            </h1>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold rounded-full">
              Grade Tracker
            </span>
          </div>
          <p className="text-sm sm:text-base text-zinc-400 mt-1.5">
            Track test scores, internal assessments, quizzes, and calculate cumulative grades per subject.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowTargetCalculator(!showTargetCalculator)}
            className={`flex items-center gap-2 px-3.5 py-2.5 border rounded-xl text-sm font-medium transition-colors ${
              showTargetCalculator
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
            }`}
          >
            <Calculator className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Target Simulator</span>
            <span className="sm:hidden">Target</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl text-sm font-medium transition-colors"
            title="Download Marks as CSV"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Record Test Mark</span>
          </button>
        </div>
      </div>

      {/* 2. Executive Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Weighted Average & Letter Grade */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs sm:text-sm font-medium">Weighted Score</span>
            <Award className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
              {marksSummary.totalTests > 0 ? `${marksSummary.weightedAveragePercentage}%` : '—'}
            </span>
            {marksSummary.totalTests > 0 && (
              <span
                className={`text-xs sm:text-sm font-bold px-2 py-0.5 rounded-md ${marksSummary.grade.badgeBg}`}
              >
                {marksSummary.grade.letter}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400">
            {marksSummary.totalTests > 0
              ? `GPA Equivalent: ${marksSummary.grade.gpa.toFixed(1)} / 4.0 (${marksSummary.grade.label})`
              : 'Record your first test to see stats'}
          </p>
        </div>

        {/* Metric 2: Total Tests Evaluated */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs sm:text-sm font-medium">Tests Evaluated</span>
            <BarChart3 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
              {marksSummary.totalTests}
            </span>
            <span className="text-xs text-zinc-400">assessments</span>
          </div>
          <p className="text-xs text-zinc-400">
            Marks: {marksSummary.totalMarksObtained} / {marksSummary.totalMaxMarks} total points
          </p>
        </div>

        {/* Metric 3: Weightage Covered */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs sm:text-sm font-medium">Syllabus Weightage</span>
            <Percent className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
              {marksSummary.totalWeightageEvaluated}%
            </span>
            <span className="text-xs text-zinc-400">of 100%</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, marksSummary.totalWeightageEvaluated)}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Top Performance */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs sm:text-sm font-medium">Best Score</span>
            <TrendingUp className="w-5 h-5 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
              {marksSummary.highestMark
                ? `${marksSummary.highestMark.percentage ?? calculatePercentage(marksSummary.highestMark.marksObtained, marksSummary.highestMark.maxMarks)}%`
                : '—'}
            </span>
            {marksSummary.highestMark && (
              <span className="text-xs text-zinc-400 truncate max-w-[100px]">
                {marksSummary.highestMark.testName}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 truncate">
            {marksSummary.highestMark
              ? `${marksSummary.highestMark.marksObtained}/${marksSummary.highestMark.maxMarks} marks`
              : 'No test scores yet'}
          </p>
        </div>
      </div>

      {/* 3. Target Calculator Simulator Drawer / Card */}
      {showTargetCalculator && (
        <div className="p-5 sm:p-6 bg-gradient-to-br from-indigo-950/40 via-zinc-900 to-zinc-900 border border-indigo-500/30 rounded-2xl space-y-4 transition-all">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-100">
                  Target Grade & Marks Simulator
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Simulate what marks you must score in remaining tests or semester finals to achieve your desired target grade.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowTargetCalculator(false)}
              className="text-zinc-400 hover:text-zinc-200 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Target Desired Overall %
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="1"
                  value={desiredTargetPercent}
                  onChange={(e) => setDesiredTargetPercent(Number(e.target.value))}
                  className="flex-1 accent-indigo-500"
                />
                <span className="text-base font-bold text-zinc-100 w-12 text-right">
                  {desiredTargetPercent}%
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Grade: {calculateGrade(desiredTargetPercent).letter} ({calculateGrade(desiredTargetPercent).label})
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Remaining Exam Weightage %
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="5"
                  max="80"
                  step="5"
                  value={remainingWeightage}
                  onChange={(e) => setRemainingWeightage(Number(e.target.value))}
                  className="flex-1 accent-indigo-500"
                />
                <span className="text-base font-bold text-zinc-100 w-12 text-right">
                  {remainingWeightage}%
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                e.g. End Semester Finals weightage
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 flex flex-col justify-center">
              <span className="text-xs font-medium text-zinc-400">Required in Remaining Tests:</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span
                  className={`text-2xl font-black ${
                    targetResult.achievable ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {targetResult.requiredPercentage}%
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    targetResult.achievable
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {targetResult.achievable ? 'Achievable' : 'Unrealistic (>100%)'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {targetResult.achievable
                  ? `Maintain ≥ ${targetResult.requiredPercentage}% in final evaluations to lock in your goal!`
                  : 'Target exceeds remaining marks. Consider lowering target by 5%.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Filter Toolbar: Subject Pills & Test Types */}
      <div className="space-y-3">
        {/* Subject Pills (Scrollable horizontally on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedSubjectId('all')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              selectedSubjectId === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
            }`}
          >
            All Subjects ({testMarks.length})
          </button>
          {subjects.map((subj) => {
            const count = testMarks.filter((m) => m.subjectId === subj.id).length;
            const isSelected = selectedSubjectId === subj.id;
            return (
              <button
                key={subj.id}
                onClick={() => setSelectedSubjectId(subj.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-zinc-800 border-zinc-600 text-white shadow-md'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: subj.color || '#6366f1' }}
                />
                <span>{subj.name}</span>
                <span className="text-xs px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filter: Test Type Tabs */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 text-xs sm:text-sm overflow-x-auto">
            {(
              [
                { id: 'all', label: 'All Tests' },
                { id: 'internal', label: 'Internals' },
                { id: 'midterm', label: 'Midterms' },
                { id: 'quiz', label: 'Quizzes' },
                { id: 'lab', label: 'Lab Viva' },
                { id: 'assignment', label: 'Assignments' },
                { id: 'final', label: 'Finals' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  selectedType === t.id
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-zinc-400">
            Showing {filteredMarks.length} of {testMarks.length} records
          </span>
        </div>
      </div>

      {/* 5. Marks Records List / Cards */}
      {filteredMarks.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-3">
          <Award className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-base sm:text-lg font-semibold text-zinc-200">
            No Test Marks Found
          </h3>
          <p className="text-sm text-zinc-400 max-w-sm mx-auto">
            {selectedSubjectId !== 'all' || selectedType !== 'all'
              ? 'No tests match your active subject or type filter. Clear filters or record a test mark.'
              : 'Start tracking test scores, internal assessments, and lab grades for your semester.'}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            {(selectedSubjectId !== 'all' || selectedType !== 'all') && (
              <button
                onClick={() => {
                  setSelectedSubjectId('all');
                  setSelectedType('all');
                }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-sm font-medium"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold"
            >
              + Record Test Mark
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMarks.map((mark) => {
            const subj = subjects.find((s) => s.id === mark.subjectId);
            const percentage =
              mark.percentage ?? calculatePercentage(mark.marksObtained, mark.maxMarks);
            const gradeInfo = calculateGrade(percentage);

            return (
              <div
                key={mark.id}
                className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  {/* Subject Badge & Grade Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: subj?.color || '#6366f1' }}
                      />
                      <span className="text-xs font-semibold text-zinc-300 truncate max-w-[150px]">
                        {subj?.name || 'General'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md border ${gradeInfo.badgeBg}`}
                      >
                        Grade {mark.grade || gradeInfo.letter}
                      </span>
                    </div>
                  </div>

                  {/* Title and Type */}
                  <div className="mt-2.5">
                    <h3 className="text-base sm:text-lg font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors">
                      {mark.testName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                      <span className="capitalize px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">
                        {mark.testType}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        {mark.date}
                      </span>
                      {mark.weightage && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400 font-medium">
                            {mark.weightage}% weight
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Score & Percentage Bar */}
                  <div className="mt-4 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-zinc-400">Score Obtained</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl sm:text-2xl font-black text-zinc-100">
                          {mark.marksObtained}
                        </span>
                        <span className="text-xs text-zinc-400">/ {mark.maxMarks}</span>
                        <span className="text-sm font-bold text-indigo-400 ml-1.5">
                          ({percentage}%)
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          percentage >= 80
                            ? 'bg-emerald-500'
                            : percentage >= 60
                            ? 'bg-blue-500'
                            : percentage >= 40
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Topics Covered */}
                  {mark.topicsCovered && (
                    <div className="mt-3 text-xs text-zinc-300 bg-zinc-800/40 p-2.5 rounded-lg border border-zinc-800">
                      <span className="text-zinc-400 font-medium block mb-0.5">Syllabus / Topics:</span>
                      <span className="line-clamp-2">{mark.topicsCovered}</span>
                    </div>
                  )}

                  {/* Remarks / Feedback */}
                  {mark.remarks && (
                    <div className="mt-2 text-xs text-zinc-400 italic">
                      "{mark.remarks}"
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">
                    {mark.targetMarks
                      ? `Target was: ${mark.targetMarks} pts`
                      : `Status: Recorded`}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(mark)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
                      title="Edit Test Mark"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingMarkId(mark.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                      title="Delete Test Mark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Add / Edit Test Mark Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-md p-5 border-b border-zinc-800 flex items-center justify-between z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-zinc-100">
                    {editingMark ? 'Edit Test Mark' : 'Record Test Mark'}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Enter the score and weightage for this assessment
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-zinc-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMark} className="p-5 space-y-4">
              {/* Subject Select */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Subject *
                </label>
                <select
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                  required
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code || 'Course'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Test Name & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Test / Exam Title *
                  </label>
                  <input
                    type="text"
                    value={formTestName}
                    onChange={(e) => setFormTestName(e.target.value)}
                    placeholder="e.g. Midterm 1, Quiz 2"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Assessment Type
                  </label>
                  <select
                    value={formTestType}
                    onChange={(e) => setFormTestType(e.target.value as TestType)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 capitalize"
                  >
                    <option value="internal">Internal Assessment</option>
                    <option value="midterm">Midterm Exam</option>
                    <option value="quiz">Quiz / Class Test</option>
                    <option value="lab">Lab Viva / Practical</option>
                    <option value="assignment">Assignment / Project</option>
                    <option value="final">Final / Semester Exam</option>
                    <option value="other">Other Assessment</option>
                  </select>
                </div>
              </div>

              {/* Date & Weightage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Date of Test
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Semester Weightage %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={formWeightage}
                    onChange={(e) => setFormWeightage(e.target.value)}
                    placeholder="e.g. 20 (optional)"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Marks Obtained & Max Marks */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Marks Obtained *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formMarksObtained}
                    onChange={(e) => setFormMarksObtained(e.target.value)}
                    placeholder="e.g. 42.5"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Maximum Marks *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formMaxMarks}
                    onChange={(e) => setFormMaxMarks(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Live Preview Box */}
              {liveMax > 0 && formMarksObtained !== '' && (
                <div className="p-3.5 bg-zinc-950/70 border border-zinc-800 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400 block">Calculated Result</span>
                    <span className="text-lg font-black text-indigo-400">
                      {livePercentage}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${liveGrade.badgeBg}`}>
                      Grade {liveGrade.letter} ({liveGrade.label})
                    </span>
                  </div>
                </div>
              )}

              {/* Target Marks (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Target Score (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formTargetMarks}
                  onChange={(e) => setFormTargetMarks(e.target.value)}
                  placeholder="e.g. 45 (for goal tracking)"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Topics Covered */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Syllabus Modules / Topics Covered
                </label>
                <textarea
                  rows={2}
                  value={formTopicsCovered}
                  onChange={(e) => setFormTopicsCovered(e.target.value)}
                  placeholder="e.g. Chapters 1-3, Process Scheduling, Semaphore synchronization"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Remarks / Teacher Feedback */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Teacher Feedback & Remarks
                </label>
                <input
                  type="text"
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  placeholder="e.g. Well answered question 3; revise deadlocks algorithm"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/20"
                >
                  {editingMark ? 'Save Changes' : 'Record Mark'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Delete Confirmation Modal */}
      {deletingMarkId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-100">Delete Test Record?</h3>
            </div>
            <p className="text-sm text-zinc-400">
              Are you sure you want to delete this test mark record? This action will remove it from cumulative grade calculations.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingMarkId(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteTestMark(deletingMarkId);
                  setDeletingMarkId(null);
                  addToast({ type: 'info', title: 'Test Mark Deleted' });
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
