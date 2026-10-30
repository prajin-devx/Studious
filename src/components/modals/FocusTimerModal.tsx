import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, CheckCircle2, X } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FocusTimerModal({ isOpen, onClose }: FocusTimerModalProps) {
  const { topics, addStudyTask, addToast } = useAcademic();
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);
  const [reflection, setReflection] = useState<string>('');

  useEffect(() => {
    setSecondsRemaining(durationMinutes * 60);
    setIsActive(false);
    setSessionCompleted(false);
  }, [durationMinutes]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((sec) => sec - 1);
      }, 1000);
    } else if (isActive && secondsRemaining === 0) {
      setIsActive(false);
      setSessionCompleted(true);
      addToast({
        type: 'success',
        title: 'Focus Session Complete!',
        message: 'Great job maintaining focus. Record your reflection below.',
      });
    }
    return () => clearInterval(interval);
  }, [isActive, secondsRemaining]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const progressPercent = Math.round(
    ((durationMinutes * 60 - secondsRemaining) / (durationMinutes * 60)) * 100
  );

  const handleReset = () => {
    setIsActive(false);
    setSecondsRemaining(durationMinutes * 60);
    setSessionCompleted(false);
  };

  const handleSaveSession = async () => {
    const selectedTopic = topics.find((t) => t.id === selectedTopicId);
    await addStudyTask({
      title: selectedTopic
        ? `Focus Study: ${selectedTopic.title}`
        : 'Completed Study Session',
      subjectId: selectedTopic?.subjectId,
      linkedTopicId: selectedTopicId || undefined,
      date: new Date().toISOString().split('T')[0],
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      durationMinutes,
      status: 'completed',
      notes: reflection || 'Completed deep work focus interval.',
      completedAt: new Date().toISOString(),
    });
    setSessionCompleted(false);
    setReflection('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="timer-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
    >
      <div className="bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          aria-label="Close Focus Timer"
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Timer className="w-6 h-6" />
          </div>
          <div>
            <h2 id="timer-modal-title" className="text-xl font-bold text-zinc-100">
              Academic Focus Timer
            </h2>
            <p className="text-sm text-zinc-400 mt-0.5">Pomodoro & deliberate study intervals</p>
          </div>
        </div>

        {/* Preset selector */}
        <div className="flex gap-2 mb-6">
          {[15, 25, 45, 60].map((mins) => (
            <button
              key={mins}
              onClick={() => {
                setDurationMinutes(mins);
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl border transition-all ${
                durationMinutes === mins
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                  : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>

        {/* Circular Display */}
        <div className="flex flex-col items-center justify-center py-6 relative">
          <div className="relative w-52 h-52 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-zinc-800"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-indigo-500 transition-all duration-500"
                strokeWidth="6"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * progressPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-5xl font-mono font-bold tracking-tight text-zinc-100">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span className="text-xs sm:text-sm text-zinc-400 mt-1.5 uppercase tracking-wider font-semibold">
                {isActive ? 'In Progress' : sessionCompleted ? 'Completed' : 'Ready'}
              </span>
            </div>
          </div>
        </div>

        {/* Topic Association */}
        <div className="mb-5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Link to Syllabus Topic (Optional)
          </label>
          <select
            value={selectedTopicId}
            onChange={(e) => setSelectedTopicId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-zinc-800/70 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="">No specific topic</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Controls */}
        {!sessionCompleted ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsActive(!isActive)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-base font-semibold transition-colors shadow-lg shadow-indigo-600/20"
            >
              {isActive ? (
                <>
                  <Pause className="w-5 h-5" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" /> Start Focus
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              title="Reset Timer"
              aria-label="Reset Timer"
              className="p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors border border-zinc-700"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1.5">
                Reflection & Study Notes
              </label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="What did you accomplish during this session?"
                rows={2}
                className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <button
              onClick={handleSaveSession}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-base font-semibold transition-colors"
            >
              <CheckCircle2 className="w-5 h-5" /> Log Completed Study Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
