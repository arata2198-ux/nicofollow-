import React from 'react';
import { Search, Loader2, ArrowRight, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { ScanProgress } from '../types/niconico';

interface ScannerInputProps {
  inputValue: string;
  onInputChange: (val: string) => void;
  onScan: () => void;
  isScanning: boolean;
  progress: ScanProgress;
  extractedId: number | null;
  errorMessage?: string | null;
  remainingScans: number;
  maxScans: number;
  isInCooldown: boolean;
  cooldownText: string;
}

export const ScannerInput: React.FC<ScannerInputProps> = ({
  inputValue,
  onInputChange,
  onScan,
  isScanning,
  progress,
  extractedId,
  errorMessage,
  remainingScans,
  maxScans,
  isInCooldown,
  cooldownText,
}) => {
  const canSubmit = !isScanning && !isInCooldown && remainingScans > 0 && !!inputValue.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      onScan();
    }
  };

  const calculatePercent = () => {
    if (progress.phase === 'init') return 5;
    if (progress.phase === 'following') {
      const p = progress.total > 0 ? (progress.current / progress.total) * 45 : 20;
      return Math.min(45, Math.max(5, p));
    }
    if (progress.phase === 'follower') {
      const p = progress.total > 0 ? 45 + (progress.current / progress.total) * 45 : 65;
      return Math.min(90, Math.max(45, p));
    }
    if (progress.phase === 'analyzing') return 95;
    return 0;
  };

  const percent = calculatePercent();

  return (
    <div className="w-full bg-slate-850/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm space-y-4">
      {/* Scan Quota & 60-Minute Cooldown Information */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/70 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              remainingScans > 0 ? 'bg-cyan-400' : 'bg-rose-500'
            }`}
          />
          <span className="text-slate-300">
            本日の無料スキャン回数は残り{' '}
            <strong className="text-cyan-400 font-bold text-sm">
              {remainingScans}
            </strong>{' '}
            / {maxScans} 回です（日付が変わるとリセット）
          </span>
        </div>

        <div className="text-[11px] sm:text-right font-mono">
          {isInCooldown ? (
            <span className="text-amber-400 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>待機中: 次のスキャンまで残り {cooldownText}</span>
            </span>
          ) : (
            <span className="text-slate-400">
              ※前回のスキャンから６０分間は再スキャン不可
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            ニコニコ動画 アカウントURL または ユーザーID
          </label>
          <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder="例: https://www.nicovideo.jp/user/12345678/follow または ユーザーID"
                disabled={isScanning || isInCooldown || remainingScans <= 0}
                className="w-full pl-10 pr-24 py-3 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all font-mono"
              />
              {extractedId && (
                <div className="absolute right-3 inset-y-0 flex items-center">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                    ID: {extractedId}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all whitespace-nowrap active:scale-[0.98]"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>解析中...</span>
                </>
              ) : remainingScans <= 0 ? (
                <span>本日上限（3回）到達</span>
              ) : isInCooldown ? (
                <>
                  <Clock className="w-4 h-4" />
                  <span>待機中 ({cooldownText})</span>
                </>
              ) : (
                <>
                  <span>全件スキャン開始</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error notification if any */}
        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Progress Bar when scanning */}
        {isScanning && (
          <div className="pt-3 border-t border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-400 flex items-center gap-1.5 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {progress.message || 'データ取得中...'}
              </span>
              <span className="text-slate-400 font-semibold">{Math.round(percent)}%</span>
            </div>

            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300 shadow-sm shadow-cyan-500/50"
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>
                {progress.phase === 'following' && `フォロー中: ${progress.current} 件取得完了`}
                {progress.phase === 'follower' && `フォロワー: ${progress.current} 件取得完了`}
                {progress.phase === 'analyzing' && '相互関係の差分判定を実行中...'}
              </span>
              <span>
                {progress.page > 0 && `(第 ${progress.page} ページ走査中)`}
              </span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
