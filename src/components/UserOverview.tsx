import React from 'react';
import { ExternalLink, UserCheck, UserX, Users, UserPlus, AlertTriangle, ArrowUpRight, Trash2 } from 'lucide-react';
import { UserProfile, ScanStats, DiffResult } from '../types/niconico';

interface UserOverviewProps {
  user: UserProfile;
  stats: ScanStats;
  diff: DiffResult;
  onSelectTab: (tab: any) => void;
  lastScannedTime: string | null;
  onClearHistory?: () => void;
}

export const UserOverview: React.FC<UserOverviewProps> = ({
  user,
  stats,
  diff,
  onSelectTab,
  lastScannedTime,
  onClearHistory,
}) => {
  if (!user || !stats) {
    return null;
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 sm:p-6 backdrop-blur-sm shadow-xl space-y-6">
      {/* Account Info Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-700/60">
        <div className="flex items-start sm:items-center gap-4">
          <div className="relative">
            <img
              src={user.iconUrl || 'https://resource.video.nimg.jp/web/images/favicon_uni/96.png'}
              alt={user.nickname}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-700 shadow-md bg-slate-900"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            {user.isPremium && (
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950 shadow-sm">
                PREM
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white tracking-tight">{user.nickname}</h2>
              <span className="text-xs font-mono text-slate-400">ID: {user.id}</span>
              {user.level !== undefined && (
                <span className="text-xs text-cyan-400 font-mono">Lv.{user.level}</span>
              )}
            </div>

            <p className="text-xs text-slate-400 max-w-2xl line-clamp-2 leading-relaxed">
              {user.description || 'プロフィール文未設定'}
            </p>

            <div className="flex items-center gap-3 pt-1 text-xs text-slate-500">
              <a
                href={`https://www.nicovideo.jp/user/${user.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
              >
                <span>ニコニコユーザーページを開く</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              {lastScannedTime && (
                <span>· 最終スキャン: {new Date(lastScannedTime).toLocaleTimeString('ja-JP')}</span>
              )}
            </div>
          </div>
        </div>

        {onClearHistory && (
          <button
            type="button"
            onClick={onClearHistory}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 rounded-xl transition-all shadow-sm cursor-pointer self-start sm:self-center shrink-0"
            title="画面の表示結果と履歴を削除します"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>履歴・結果を削除</span>
          </button>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Metric 1: 片思い / 外された人 (PRIMARY TARGET) */}
        <button
          onClick={() => onSelectTab('notFollowingBack')}
          className="text-left p-4 rounded-xl bg-gradient-to-br from-rose-950/40 to-slate-900 border border-rose-800/40 hover:border-rose-500/80 transition-all group relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-xs text-rose-300 mb-1">
            <span className="font-semibold flex items-center gap-1">
              <UserX className="w-3.5 h-3.5 text-rose-400" />
              <span>片思い・解除</span>
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-rose-400 tabular-nums">
            {stats.notFollowingBackCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">フォロー中だが未フォロー</div>
          {stats.notFollowingBackCount > 0 && (
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>

        {/* Metric 2: 相互フォロー */}
        <button
          onClick={() => onSelectTab('mutual')}
          className="text-left p-4 rounded-xl bg-slate-900/60 border border-emerald-800/30 hover:border-emerald-500/60 transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-emerald-300 mb-1">
            <span className="font-semibold flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>相互フォロー</span>
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 tabular-nums">
            {stats.mutualCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">お互いにフォロー中</div>
        </button>

        {/* Metric 3: 片思われ (フォロワー) */}
        <button
          onClick={() => onSelectTab('fans')}
          className="text-left p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 hover:border-cyan-500/60 transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-cyan-300 mb-1">
            <span className="font-semibold flex items-center gap-1">
              <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
              <span>片思われ</span>
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-cyan-400 tabular-nums">
            {stats.fansCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">フォロー返ししていない人</div>
        </button>

        {/* Metric 4: 総フォロー数 */}
        <button
          onClick={() => onSelectTab('allFollowing')}
          className="text-left p-4 rounded-xl bg-slate-900/40 border border-slate-700/40 hover:border-slate-500 transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span className="font-medium flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>フォロー中</span>
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-200 tabular-nums">
            {stats.followingCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">あなたがフォロー中</div>
        </button>

        {/* Metric 5: 総フォロワー数 */}
        <button
          onClick={() => onSelectTab('allFollowers')}
          className="text-left p-4 rounded-xl bg-slate-900/40 border border-slate-700/40 hover:border-slate-500 transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span className="font-medium flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>フォロワー</span>
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-200 tabular-nums">
            {stats.followerCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">あなたをフォロー中</div>
        </button>
      </div>

      {/* Snapshot Diff Notification Banner if diff detected */}
      {diff.hasPreviousSnapshot && (diff.unfollowedBy.length > 0 || diff.lostMutual.length > 0) && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <div className="font-semibold text-amber-300">
              🚨 前回スキャンからのリムられ（フォロー解除）を検知しました！
            </div>
            <div className="text-slate-300 leading-relaxed">
              {diff.lostMutual.length > 0 && (
                <span className="block">
                  ・元々相互フォローだった相手 <strong className="text-amber-300">{diff.lostMutual.length}名</strong> がフォローを解除しました。
                </span>
              )}
              {diff.unfollowedBy.length > 0 && (
                <span className="block">
                  ・合計 <strong className="text-amber-300">{diff.unfollowedBy.length}名</strong> がフォロワーから消えています。
                </span>
              )}
            </div>
            <button
              onClick={() => onSelectTab('lostMutual')}
              className="mt-1 text-cyan-400 hover:text-cyan-300 font-medium underline inline-block"
            >
              解除されたユーザーリストを確認する →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
