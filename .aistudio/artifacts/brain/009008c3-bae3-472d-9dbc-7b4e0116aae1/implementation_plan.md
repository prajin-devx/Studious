# Studious Academic Suite: Printable Semester Transcript & Bunk Calculator

Implementation blueprint to introduce an official Printable Semester Transcript & PDF Grade Report Card, an intelligent Attendance Threshold & Bunk Calculator, and a refined Studio Dark visual theme with subtle indigo and violet glow.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following directions were confirmed during interactive clarification and form the foundation of this plan:
> - **Primary Deliverable**: Printable semester transcript and PDF grade report card with executive GPA breakdown, course credits, and test history.
> - **Visual Identity**: Studio Dark theme with subtle indigo/violet ambient glow, sharp contrast, and zero AI-slop pill clutter.
> - **Productivity Utility**: Subject-wise attendance threshold tracker (e.g. 75% or 80% university minimum) paired with an interactive "Safe Bunk / Must Attend" calculator.

- **Confirmed Decision 1**: Report card printing will leverage standard high-resolution browser print styles (`@media print`) and clean vector styling so students can save a crisp, high-DPI PDF or print physical paper transcripts without external heavy dependencies.
- **Confirmed Decision 2**: Attendance threshold calculator will support custom university criteria (75%, 80%, or custom target) and immediately display either:
  1. *Safe Bunks Available*: How many upcoming lectures a student can skip without falling below the policy.
  2. *Lectures Needed*: Exactly how many consecutive classes must be attended to recover if currently in the warning zone.

---

## 1. Overview & Core Concept

### What It Does
1. **Printable Semester Transcript & Grade Report**: A dedicated, audit-ready transcript modal and print-ready report card page with student identity, institution seal, semester SGPA/CGPA estimate, subject credits, assessment marks breakdown, letter grades, and attendance summary.
2. **Attendance Threshold & Bunk Calculator**: Integrated into both the Home Dashboard, Subjects list, and Timetable. Automatically computes the exact buffer of classes a student can safely skip, warns if falling below mandatory university regulations (e.g., 75%), and simulates recovery schedules.
3. **Studio Dark Atmosphere**: Elevates the dark UI with an ambient indigo/violet canvas glow (`#09090b` zinc base with subtle radial gradient mesh), refined 1px borders (`border-zinc-800/80`), and high-legibility tabular figures (`font-variant-numeric: tabular-nums`).

### Target Audience & Persona
University undergraduate and graduate students managing academic rigor, attendance minimums, examination targets, and portfolio/scholarship applications needing formal grade reports.

---

## 2. User Experience & Visual Design

### Key User Flows

#### Flow 1: Generating & Printing the Semester Grade Transcript
```
Home / Marks Module ──> Click "Generate Transcript" ──> View Formatted Preview Modal
                                                                  │
                                   ┌──────────────────────────────┴──────────────────────────────┐
                                   ▼                                                             ▼
                        Toggle Inclusions:                                           Click "Print / Save PDF"
                   • Subject Credits & GPA                                                       │
                   • Internal Assessments & Quizzes                                              ▼
                   • Milestone Attendance Records                                      Native Browser Print Dialog
                   • Official University Header                                        (@media print stylesheet)
```

#### Flow 2: Evaluating Attendance & Bunk Margin
```
Timetable / Subjects ──> Subject Attendance Card ──> Live Badge: "82% (4 Safe Bunks)"
                                                               │
                                                               ▼
                                                  Click "Bunk Calculator"
                                                               │
                              ┌────────────────────────────────┴────────────────────────────────┐
                              ▼                                                                 ▼
                   Target: 75% University Min                                        Simulate Next 10 Classes
                   • Attended: 24 / 29                                               • Attend 2: 83.8%
                   • Margin: Can miss 3 classes safely                               • Skip 1: 80.0%
```

### Visual Identity & Theme Tokens
- **Canvas Base**: `#09090b` (Zinc 950) with subtle ambient radial gradients in indigo/violet:
  ```css
  background: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 70%), #09090b;
  ```
- **Accent Hierarchy**:
  - Primary Accent: Indigo 500 (`#6366f1`) and Violet 500 (`#8b5cf6`) for primary actions and highlights.
  - Success / Safe: Emerald 400 (`#34d399`) for above-threshold attendance and high grades.
  - Warning / Danger: Amber 400 (`#fbbf24`) and Rose 400 (`#f87171`) for attendance debarment risk and low marks.
- **Typography & Data Layout**:
  - Unboxed metadata (zero-pill discipline) separated with clean typographic dots (`·`).
  - Monospace tabular numerals (`font-mono font-medium`) for percentages, GPAs, and class counts.
  - Clean `@media print` CSS rules: switches to white background, pure black high-contrast text, borders, and hides application navigation during printing.

---

## 3. Key Product Decisions & Trade-Offs

| Decision | Chosen Approach | Rationale | Alternatives Considered |
| :--- | :--- | :--- | :--- |
| **PDF Generation Engine** | High-fidelity `@media print` stylesheet + `window.print()` trigger | Pixel-perfect vector rendering, zero bloated canvas dependencies, crisp typography, and mobile/desktop cross-compatibility. | `html2canvas` / `jsPDF` (often blurry raster text, huge bundle overhead). |
| **Attendance Tracking Model** | Total lectures held vs. attended per subject + future projection schedule | Provides instant mathematical clarity on bunk margins while supporting ad-hoc class cancellations. | Simple static percentage input (lacks future projection capability). |
| **Bunk Margin Algorithm** | Closed-form formula: $\lfloor (A - T \cdot H) / T \rfloor$ for safe bunks, and $\lceil (T \cdot H - A) / (1 - T) \rceil$ for required attendances | Guaranteed deterministic, instantaneous calculations without performance overhead. | Iterative step simulator only. |

---

## 4. Technical Architecture & Data Strategy

### System Component Diagram

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                STUDIOUS ACADEMIC SUITE                                 │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                            │
               ┌────────────────────────────┼────────────────────────────┐
               ▼                            ▼                            ▼
   ┌───────────────────────┐   ┌───────────────────────────┐   ┌──────────────────────────┐
   │  Printable Transcript │   │   Attendance Threshold    │   │     Studio Dark CSS      │
   │      & Grade Card     │   │     & Bunk Calculator     │   │      Theme Engine        │
   │                       │   │                           │   │                          │
   │ • AcademicTranscript  │   │ • AttendanceCalculator    │   │ • Radial ambient glow    │
   │ • Print Media CSS     │   │ • Safe Bunk Projection    │   │ • Tabular figures        │
   │ • University Seal/Meta│   │ • Debarment Warning Alert │   │ • High-contrast borders  │
   └───────────────────────┘   └───────────────────────────┘   └──────────────────────────┘
               │                            │                            │
               └────────────────────────────┼────────────────────────────┘
                                            ▼
                       ┌──────────────────────────────────────────┐
                       │        AcademicContext & State           │
                       │                                          │
                       │ • subjects (with credits & attendance)   │
                       │ • testMarks & weighted grades            │
                       │ • userProfile & institution metadata     │
                       │ • attendanceThresholdSettings (75% min)  │
                       └──────────────────────────────────────────┘
                                            │
                                            ▼
                       ┌──────────────────────────────────────────┐
                       │     Firebase Firestore & Local Cache     │
                       │                                          │
                       │ • Offline LocalStorage replication       │
                       │ • Multi-device cloud sync                │
                       └──────────────────────────────────────────┘
```

### Data Model Additions
```typescript
export interface SubjectAttendance {
  attended: number;
  totalHeld: number;
  minimumRequirementPercent: number; // default 75
}

export interface BunkCalculationResult {
  currentPercentage: number;
  status: 'safe' | 'warning' | 'critical';
  safeBunksAvailable: number; // How many classes can be missed without dipping below min
  classesNeededToRecover: number; // How many consecutive classes needed if below min
  projectedPercentageIfMissNext: number;
  projectedPercentageIfAttendNext: number;
}
```

### Interactive Verification Plan
1. **Unit Tests**:
   - `src/utils/attendanceCalculations.test.ts`: Verify safe bunk formula, recovery attendance calculations, zero-division edge cases, and 100% attendance bounds.
   - Run tests with `npx tsx --test`.
2. **Browser Validation**:
   - Test transcript preview modal, toggle options, and print trigger.
   - Test bunk calculator sliders and attendance adjustments.
   - Verify layout, contrast, and visual glow on desktop (1440px) and mobile viewport (390x844).
3. **Compilation & Build**:
   - Run `lint_applet` and `compile_applet`.
   - Confirm zero TypeScript errors and clean production build.
