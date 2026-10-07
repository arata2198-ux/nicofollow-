import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleResetAll = () => {
    try {
      localStorage.removeItem('nicofollow_last_scan_result');
      localStorage.removeItem('nicofollow_cached_history');
      localStorage.removeItem('nicofollow_snapshots');
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900 border border-rose-800/60 rounded-2xl p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-700/60 flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h2 className="text-lg font-bold text-slate-100">画面の表示を復旧します</h2>

            <p className="text-xs text-slate-400 leading-relaxed">
              ブラウザに保存された古いデータとの不整合が発生した可能性があります。
              下のボタンを押すと保存キャッシュを修復して正常に再読み込みします。
            </p>

            <button
              onClick={this.handleResetAll}
              className="w-full py-3 px-4 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>キャッシュを修復して再起動する</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
