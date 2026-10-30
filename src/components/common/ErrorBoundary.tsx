import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Download, Copy, Check, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, copied: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Studious Workspace Error Caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleEmergencyExport = () => {
    try {
      const keys = Object.keys(localStorage).filter(
        (k) => k.startsWith('studious_') || k.includes('studious')
      );
      const backupData: Record<string, any> = {};
      keys.forEach((key) => {
        try {
          backupData[key] = JSON.parse(localStorage.getItem(key) || 'null');
        } catch {
          backupData[key] = localStorage.getItem(key);
        }
      });

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `studious_emergency_backup_${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Unable to extract emergency backup.');
    }
  };

  private handleCopyDiagnostic = () => {
    const diagnostic = [
      `=== STUDIOUS SAAS DIAGNOSTIC REPORT ===`,
      `Timestamp: ${new Date().toISOString()}`,
      `URL: ${window.location.href}`,
      `User Agent: ${navigator.userAgent}`,
      `Error Name: ${this.state.error?.name}`,
      `Error Message: ${this.state.error?.message}`,
      `Error Stack:\n${this.state.error?.stack || 'No stack'}`,
      `Component Stack:\n${this.state.errorInfo?.componentStack || 'No component stack'}`,
    ].join('\n\n');

    navigator.clipboard.writeText(diagnostic).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    });
  };

  private handleResetCache = () => {
    if (
      window.confirm(
        'Are you sure you want to clear your local cache? Please make sure you have saved an emergency backup first.'
      )
    ) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 sm:p-8 font-sans">
          <div className="max-w-xl w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-zinc-100">
                  Workspace Interruption
                </h1>
                <p className="text-xs text-zinc-400">
                  Studious safely halted execution to protect your academic records
                </p>
              </div>
            </div>

            <div className="p-4 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl text-xs space-y-2 font-mono">
              <div className="text-rose-400 font-semibold truncate">
                {this.state.error?.name}: {this.state.error?.message}
              </div>
              <div className="text-zinc-500 text-[11px] leading-relaxed line-clamp-3 overflow-hidden">
                {this.state.error?.stack || 'No stack trace available'}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-md shadow-indigo-600/20"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Workspace
              </button>

              <button
                onClick={this.handleEmergencyExport}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-sm font-semibold transition-colors"
              >
                <Download className="w-4 h-4 text-blue-400" />
                Emergency JSON Backup
              </button>

              <button
                onClick={this.handleCopyDiagnostic}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-xl text-sm font-medium transition-colors"
              >
                {this.state.copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Diagnostics Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-zinc-400" />
                    Copy Diagnostic Log
                  </>
                )}
              </button>

              <button
                onClick={this.handleResetCache}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 border border-rose-500/20 rounded-xl text-sm font-medium transition-colors"
              >
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Clear Local Cache
              </button>
            </div>

            <p className="text-center text-xs text-zinc-500">
              Studious Enterprise Academic SaaS • Protected Local & Cloud Data Cache
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
