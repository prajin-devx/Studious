import React, { useState } from 'react';
import {
  X,
  LogIn,
  LogOut,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  User as UserIcon,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { user, signInWithGoogle, signInAsStudent, signOutUser, authLoading, addToast } =
    useAcademic();

  const [studentEmail, setStudentEmail] = useState('kevinpinto242008@gmail.com');
  const [studentName, setStudentName] = useState('Kevin Pinto');
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);

  if (!isOpen) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  const handleCopyDomain = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      addToast({
        type: 'info',
        title: 'Domain Copied',
        message: `Copied "${currentHostname}" to clipboard. Add to Firebase Console > Authorized Domains.`,
      });
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const handleGoogleClick = async () => {
    try {
      await signInWithGoogle();
      // If sign in completes or sets user, close modal
      if (user) {
        onClose();
      }
    } catch {
      // Error is handled inside context with toast and banner display
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentEmail.trim()) {
      addToast({
        type: 'warning',
        title: 'Missing Email',
        message: 'Please enter a valid student email address.',
      });
      return;
    }
    setIsSubmittingStudent(true);
    try {
      await signInAsStudent(studentEmail.trim(), studentName.trim() || 'Kevin Pinto');
      onClose();
    } finally {
      setIsSubmittingStudent(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 bg-zinc-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">
                {user ? 'Academic Account Profile' : 'Sign In to Studious'}
              </h2>
              <p className="text-xs text-zinc-400">
                {user ? 'Manage cloud session and synced device status' : 'Connect your Google account or student identity'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close auth dialog"
            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {user ? (
            /* Already Signed In View */
            <div className="space-y-4">
              <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(user.displayName || user.email || 'S')[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="truncate flex-1">
                  <span className="font-bold text-sm text-zinc-100 block truncate">
                    {user.displayName || 'Enrolled Student'}
                  </span>
                  <span className="text-xs text-zinc-400 block truncate font-mono">
                    {user.email || 'No email associated'}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Cloud Session Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={async () => {
                    await signOutUser();
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-500/40 border border-zinc-700 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 text-zinc-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Academic Workspace</span>
                </button>
              </div>
            </div>
          ) : (
            /* Sign In Options */
            <div className="space-y-5">
              {/* Option 1: Official Google Sign-in */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Method 1: Direct Google Authentication
                </span>

                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={authLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-zinc-100 text-zinc-900 rounded-2xl font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-70 cursor-pointer active:scale-[0.99]"
                >
                  {/* Official Google G Logo */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{authLoading ? 'Signing in with Google...' : 'Continue with Google'}</span>
                </button>
              </div>

              {/* Domain Authorization Diagnostic Banner */}
              <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl text-xs space-y-2.5">
                <div className="flex items-center justify-between text-zinc-200">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Firebase Authorized Domain Whitelist</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleCopyDomain}
                      className="flex items-center gap-1 text-[11px] px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 border border-amber-500/30 rounded-lg transition-colors font-mono"
                    >
                      {copiedDomain ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-amber-400" />}
                      <span>{copiedDomain ? 'Copied!' : 'Copy Domain'}</span>
                    </button>
                    <a
                      href="https://console.firebase.google.com/project/manifest-form-lc70r/authentication/settings"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg transition-colors"
                    >
                      <span>Console</span>
                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                    </a>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-300 space-y-1 leading-relaxed">
                  <p>
                    Google Auth on <code className="text-amber-200 bg-amber-950/50 px-1.5 py-0.5 rounded font-mono border border-amber-500/20">{currentHostname}</code> requires adding this domain to Firebase Console:
                  </p>
                  <ol className="list-decimal list-inside text-zinc-400 space-y-0.5 pl-1">
                    <li>Open Firebase Console &gt; <strong className="text-zinc-200">Authentication</strong> &gt; <strong className="text-zinc-200">Settings</strong> &gt; <strong className="text-zinc-200">Authorized domains</strong></li>
                    <li>Click <strong className="text-zinc-200">Add domain</strong> and paste <code className="text-amber-300 font-mono font-semibold">{currentHostname}</code> (or <code className="text-amber-300 font-mono">vercel.app</code>)</li>
                  </ol>
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-zinc-800"></div>
                <span className="shrink mx-3 text-zinc-500 text-xs uppercase font-semibold">
                  Or Instant Student Sign-In
                </span>
                <div className="grow border-t border-zinc-800"></div>
              </div>

              {/* Option 2: 1-Click Instant Connect (Pre-configured for user) */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => signInAsStudent('kevinpinto242008@gmail.com', 'Kevin Pinto').then(onClose)}
                  className="w-full flex items-center justify-between p-3.5 bg-indigo-950/40 hover:bg-indigo-950/60 border border-indigo-500/30 rounded-2xl text-xs text-left transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold">
                      K
                    </div>
                    <div>
                      <div className="font-bold text-zinc-100 flex items-center gap-1.5">
                        <span>Connect as Kevin Pinto</span>
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                      </div>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        kevinpinto242008@gmail.com
                      </span>
                    </div>
                  </div>
                  <span className="text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform text-xs">
                    Connect →
                  </span>
                </button>

                {/* Custom student details form */}
                <form onSubmit={handleStudentLogin} className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                        Student Name
                      </label>
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="e.g. Kevin Pinto"
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                        Academic / Google Email
                      </label>
                      <input
                        type="email"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        placeholder="you@university.edu"
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingStudent}
                    className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Sign In with Custom Academic Identity</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs text-zinc-400">
          <span>Project: manifest-form-lc70r</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
