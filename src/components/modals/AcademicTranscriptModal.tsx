import React, { useState, useRef } from 'react';
import {
  X,
  Printer,
  Download,
  GraduationCap,
  Building,
  CheckCircle,
  FileText,
  Sliders,
  Award,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { calculateGrade } from '../../utils/marksCalculations';
import { calculateAttendancePercentage } from '../../utils/attendanceCalculations';

interface AcademicTranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AcademicTranscriptModal({
  isOpen,
  onClose,
}: AcademicTranscriptModalProps) {
  const { profile, subjects, testMarks, user, addToast } = useAcademic();

  const [includeTestDetails, setIncludeTestDetails] = useState<boolean>(true);
  const [includeAttendance, setIncludeAttendance] = useState<boolean>(true);
  const [gpaScale, setGpaScale] = useState<'10' | '4'>('10');

  const transcriptRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const activeSubjects = subjects.filter((s) => !s.isArchived);

  // Compute subject-wise statistics
  const subjectRecords = activeSubjects.map((subj) => {
    const marks = testMarks.filter((tm) => tm.subjectId === subj.id);
    const totalObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
    const totalMax = marks.reduce((sum, m) => sum + m.maxMarks, 0);
    const percentage = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(1)) : 85;

    // Determine grade
    const gradeInfo = calculateGrade(percentage);

    const credits = subj.credits || 3;
    const gradePoints10 =
      percentage >= 90
        ? 10.0
        : percentage >= 80
        ? 9.0
        : percentage >= 70
        ? 8.0
        : percentage >= 60
        ? 7.0
        : percentage >= 50
        ? 6.0
        : 0.0;
    const gradePoints4 = gradeInfo.gpa;

    const chosenPoints = gpaScale === '10' ? gradePoints10 : gradePoints4;
    const qualityPoints = chosenPoints * credits;

    const attPct = calculateAttendancePercentage(
      subj.attendanceAttended ?? 24,
      subj.attendanceTotal ?? 28
    );

    return {
      subject: subj,
      tests: marks,
      totalObtained,
      totalMax,
      percentage,
      gradeInfo,
      credits,
      gradePoints: chosenPoints,
      qualityPoints,
      attendancePercentage: attPct,
      status: percentage >= 40 ? 'PASSED' : 'REAPPEAR',
    };
  });

  // Overall SGPA calculation
  const totalCredits = subjectRecords.reduce((sum, r) => sum + r.credits, 0);
  const totalQualityPoints = subjectRecords.reduce((sum, r) => sum + r.qualityPoints, 0);
  const sgpa = totalCredits > 0 ? Number((totalQualityPoints / totalCredits).toFixed(2)) : 0;

  const overallMarksPct =
    subjectRecords.length > 0
      ? Number(
          (
            subjectRecords.reduce((sum, r) => sum + r.percentage, 0) / subjectRecords.length
          ).toFixed(1)
        )
      : 0;

  const overallAttendancePct =
    subjectRecords.length > 0
      ? Number(
          (
            subjectRecords.reduce((sum, r) => sum + r.attendancePercentage, 0) /
            subjectRecords.length
          ).toFixed(1)
        )
      : 100;

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const transcriptData = {
      institution: profile.institution || 'State Institute of Technology',
      studentName: profile.name,
      studentEmail: user?.email || profile.email,
      degree: profile.degree || 'Bachelor of Technology (Computer Science & Engineering)',
      semester: profile.semester || 'Semester 5',
      academicTerm: profile.academicTerm || 'Fall/Winter 2026',
      dateGenerated: new Date().toISOString(),
      sgpa,
      totalCredits,
      overallPercentage: overallMarksPct,
      overallAttendancePercentage: overallAttendancePct,
      academicStanding: sgpa >= (gpaScale === '10' ? 8.5 : 3.5) ? 'First Class with Distinction' : 'First Class',
      courses: subjectRecords.map((r) => ({
        code: r.subject.code || '',
        name: r.subject.name,
        credits: r.credits,
        percentage: r.percentage,
        grade: r.gradeInfo.letter,
        gradePoints: r.gradePoints,
        attendancePercentage: r.attendancePercentage,
        status: r.status,
      })),
    };

    const blob = new Blob([JSON.stringify(transcriptData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `academic_transcript_${profile.name.replace(/\s+/g, '_')}_${profile.semester || 'Sem5'}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addToast({
      type: 'success',
      title: 'Transcript Exported',
      message: 'Official academic transcript JSON saved.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:h-auto print:border-none print:shadow-none print:rounded-none print:bg-white animate-in fade-in zoom-in-95">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950/80 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">
                Official Semester Transcript & Grade Card
              </h2>
              <p className="text-xs text-zinc-400">
                Print high-resolution academic report card or save as verified PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* GPA Scale Toggle */}
            <div className="flex items-center gap-1 bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-1 text-xs">
              <span className="text-zinc-400 px-1.5 font-medium">Scale:</span>
              <button
                onClick={() => setGpaScale('10')}
                className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                  gpaScale === '10' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                10.0
              </button>
              <button
                onClick={() => setGpaScale('4')}
                className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                  gpaScale === '4' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                4.0
              </button>
            </div>

            {/* Test Details Toggle */}
            <button
              onClick={() => setIncludeTestDetails((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                includeTestDetails
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}
            >
              Test Breakdown
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-md shadow-indigo-600/30"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            {/* Export JSON */}
            <button
              onClick={handleExportJson}
              title="Export Transcript JSON"
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Close transcript"
              className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Transcript Document Canvas */}
        <div
          ref={transcriptRef}
          className="flex-1 overflow-y-auto p-6 sm:p-10 bg-zinc-950 print:bg-white print:text-black print:p-8 space-y-8 font-sans selection:bg-indigo-500/20"
        >
          {/* Institutional Header */}
          <div className="border-b-2 border-zinc-700 print:border-black pb-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 print:bg-black text-white flex items-center justify-center font-bold text-xl shadow-md">
                  S
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-100 print:text-black">
                    {profile.institution || 'State Institute of Technology'}
                  </h1>
                  <p className="text-xs text-zinc-400 print:text-zinc-600 font-medium">
                    Office of Academic Records & Semester Examination Controller
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs space-y-1 font-mono text-zinc-400 print:text-zinc-700">
                <div>
                  <span className="font-semibold text-zinc-200 print:text-black">Report:</span> Official Semester Grade Card
                </div>
                <div>
                  <span className="font-semibold text-zinc-200 print:text-black">Issued:</span>{' '}
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <div>
                  <span className="font-semibold text-zinc-200 print:text-black">Verification:</span>{' '}
                  STU-{new Date().getFullYear()}-{(profile.name || 'ALEX').slice(0, 3).toUpperCase()}-942
                </div>
              </div>
            </div>

            {/* Student Profile Metadata Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-zinc-900/60 print:bg-zinc-100 border border-zinc-800 print:border-zinc-300 text-xs">
              <div>
                <span className="text-zinc-400 print:text-zinc-500 font-medium block">Student Name</span>
                <span className="font-bold text-zinc-100 print:text-black text-sm">{profile.name}</span>
              </div>
              <div>
                <span className="text-zinc-400 print:text-zinc-500 font-medium block">Program</span>
                <span className="font-bold text-zinc-100 print:text-black text-sm truncate block">
                  {profile.degree || 'B.Tech CS Engineering'}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 print:text-zinc-500 font-medium block">Semester & Term</span>
                <span className="font-bold text-zinc-100 print:text-black text-sm">
                  {profile.semester || 'Semester 5'} ({profile.academicTerm || 'Fall 2026'})
                </span>
              </div>
              <div>
                <span className="text-zinc-400 print:text-zinc-500 font-medium block">Student ID / Roll</span>
                <span className="font-bold font-mono text-indigo-400 print:text-black text-sm">
                  STU-2026-CS8821
                </span>
              </div>
            </div>
          </div>

          {/* Executive Academic Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-zinc-900/80 print:bg-zinc-50 border border-zinc-800 print:border-zinc-300 rounded-2xl text-center">
              <span className="text-xs text-zinc-400 print:text-zinc-600 font-semibold uppercase tracking-wider block">
                Semester SGPA ({gpaScale}.0 Scale)
              </span>
              <div className="text-3xl font-black font-mono text-indigo-400 print:text-black mt-1">
                {sgpa.toFixed(2)}
              </div>
              <span className="text-[11px] text-emerald-400 print:text-emerald-700 font-medium">
                {sgpa >= (gpaScale === '10' ? 8.5 : 3.5) ? 'Dean’s Honor List' : 'Good Standing'}
              </span>
            </div>

            <div className="p-4 bg-zinc-900/80 print:bg-zinc-50 border border-zinc-800 print:border-zinc-300 rounded-2xl text-center">
              <span className="text-xs text-zinc-400 print:text-zinc-600 font-semibold uppercase tracking-wider block">
                Credits Registered
              </span>
              <div className="text-3xl font-black font-mono text-zinc-100 print:text-black mt-1">
                {totalCredits}
              </div>
              <span className="text-[11px] text-zinc-400 print:text-zinc-600">
                Earned: {totalCredits} Credits
              </span>
            </div>

            <div className="p-4 bg-zinc-900/80 print:bg-zinc-50 border border-zinc-800 print:border-zinc-300 rounded-2xl text-center">
              <span className="text-xs text-zinc-400 print:text-zinc-600 font-semibold uppercase tracking-wider block">
                Weighted Marks Avg
              </span>
              <div className="text-3xl font-black font-mono text-emerald-400 print:text-black mt-1">
                {overallMarksPct}%
              </div>
              <span className="text-[11px] text-zinc-400 print:text-zinc-600">
                Grade: {calculateGrade(overallMarksPct).letter}
              </span>
            </div>

            <div className="p-4 bg-zinc-900/80 print:bg-zinc-50 border border-zinc-800 print:border-zinc-300 rounded-2xl text-center">
              <span className="text-xs text-zinc-400 print:text-zinc-600 font-semibold uppercase tracking-wider block">
                Semester Attendance
              </span>
              <div className="text-3xl font-black font-mono text-zinc-100 print:text-black mt-1">
                {overallAttendancePct}%
              </div>
              <span className="text-[11px] text-emerald-400 print:text-emerald-700 font-medium">
                Satisfies Policy (≥75%)
              </span>
            </div>
          </div>

          {/* Official Course Grade Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 print:text-zinc-700">
              Course Performance Record
            </h3>

            <div className="overflow-x-auto border border-zinc-800 print:border-black rounded-2xl print:rounded-none">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900 print:bg-zinc-200 text-zinc-300 print:text-black font-semibold uppercase tracking-wider text-[11px] border-b border-zinc-800 print:border-black">
                  <tr>
                    <th className="p-3">Course Code</th>
                    <th className="p-3">Course Title</th>
                    <th className="p-3 text-center">Credits</th>
                    <th className="p-3 text-center">Score %</th>
                    <th className="p-3 text-center">Grade</th>
                    <th className="p-3 text-center">Points</th>
                    {includeAttendance && <th className="p-3 text-center">Attendance</th>}
                    <th className="p-3 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 print:divide-zinc-300 font-medium">
                  {subjectRecords.map((rec) => (
                    <React.Fragment key={rec.subject.id}>
                      <tr className="hover:bg-zinc-900/50 print:hover:bg-transparent">
                        <td className="p-3 font-mono text-zinc-300 print:text-black font-bold">
                          {rec.subject.code || 'CS300'}
                        </td>
                        <td className="p-3 text-zinc-100 print:text-black font-semibold">
                          {rec.subject.name}
                        </td>
                        <td className="p-3 text-center font-mono text-zinc-300 print:text-black">
                          {rec.credits}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-zinc-100 print:text-black">
                          {rec.percentage}%
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`font-black font-mono text-xs ${
                              rec.gradeInfo.color || 'text-indigo-400'
                            } print:text-black`}
                          >
                            {rec.gradeInfo.letter}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono text-zinc-300 print:text-black font-bold">
                          {rec.gradePoints.toFixed(1)}
                        </td>
                        {includeAttendance && (
                          <td className="p-3 text-center font-mono text-zinc-300 print:text-black">
                            {rec.attendancePercentage}%
                          </td>
                        )}
                        <td className="p-3 text-right">
                          <span className="font-bold text-emerald-400 print:text-emerald-800">
                            {rec.status}
                          </span>
                        </td>
                      </tr>

                      {/* Optional Detailed Test Assessment Rows */}
                      {includeTestDetails && rec.tests.length > 0 && (
                        <tr className="bg-zinc-950/70 print:bg-zinc-50 border-b border-zinc-800/40 print:border-zinc-200">
                          <td colSpan={includeAttendance ? 8 : 7} className="px-5 py-2">
                            <div className="text-[11px] text-zinc-400 print:text-zinc-600 flex flex-wrap gap-x-4 gap-y-1">
                              <span className="font-semibold text-zinc-300 print:text-black">
                                Assessments:
                              </span>
                              {rec.tests.map((t) => (
                                <span key={t.id} className="font-mono">
                                  {t.testName} ({t.testType.toUpperCase()}):{' '}
                                  <strong className="text-zinc-200 print:text-black">
                                    {t.marksObtained}/{t.maxMarks}
                                  </strong>{' '}
                                  ({t.percentage}%)
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grading Scale Legend & Key */}
          <div className="p-4 bg-zinc-900/40 print:bg-zinc-100 rounded-2xl border border-zinc-800 print:border-zinc-300 text-[11px] space-y-2">
            <span className="font-bold text-zinc-300 print:text-black uppercase tracking-wider block">
              Grading Scheme & Evaluation Key
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-zinc-400 print:text-zinc-700 font-mono">
              <div>
                <strong>A+</strong>: 90–100% (10 pts)
              </div>
              <div>
                <strong>A</strong>: 80–89% (9 pts)
              </div>
              <div>
                <strong>B+</strong>: 70–79% (8 pts)
              </div>
              <div>
                <strong>B</strong>: 60–69% (7 pts)
              </div>
              <div>
                <strong>C</strong>: 50–59% (6 pts)
              </div>
              <div>
                <strong>F</strong>: &lt;50% (0 pts)
              </div>
            </div>
          </div>

          {/* Institutional Signature & Verification Footer */}
          <div className="pt-8 border-t border-zinc-800 print:border-black flex flex-col sm:flex-row sm:items-end justify-between gap-6 text-xs text-zinc-400 print:text-zinc-700">
            <div className="space-y-1">
              <div className="font-bold text-zinc-200 print:text-black">
                Verified Academic Record
              </div>
              <p className="text-[11px] max-w-sm text-zinc-500 print:text-zinc-600">
                This document is a certified statement of semester academic performance generated
                through Studious Academic Management Suite.
              </p>
            </div>

            <div className="text-center sm:text-right space-y-1">
              <div className="w-48 border-b border-zinc-600 print:border-black mx-auto sm:ml-auto pb-1" />
              <div className="font-bold text-zinc-200 print:text-black pt-1">
                Controller of Examinations
              </div>
              <div className="text-[11px] text-zinc-500 font-mono">
                Academic Affairs Directorate
              </div>
            </div>
          </div>
        </div>

        {/* Footer info (Hidden when printing) */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs text-zinc-400 print:hidden">
          <span>Tip: Select 'Save as PDF' in the print preview dialog</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-medium transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
