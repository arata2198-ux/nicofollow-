import React, { useState, useMemo } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  Download,
  Filter,
  Search,
  EyeOff,
  Eye,
  Shield,
  UserX,
  UserCheck,
  UserPlus,
  Users,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { NicoUser, TabKey, SortKey, ScanResult } from '../types/niconico';
import { exportUsersToCsv } from '../utils/csv';

interface UserListTableProps {
  scanResult: ScanResult;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  whitelist: Set<number>;
  onToggleWhitelist: (userId: number) => void;
}

export const UserListTable: React.FC<UserListTableProps> = ({
  scanResult,
  activeTab,
  onTabChange,
  whitelist,
  onToggleWhitelist,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('default');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [hideWhitelisted, setHideWhitelisted] = useState(true);

  // Map followers and followings for quick lookup
  const followerIdSet = useMemo(
    () => new Set((scanResult?.followers || []).map((u) => u.id)),
    [scanResult?.followers]
  );
  const followingIdSet = useMemo(
    () => new Set((scanResult?.followings || []).map((u) => u.id)),
    [scanResult?.followings]
  );

  // Determine current list based on active tab
  const rawList = useMemo(() => {
    if (!scanResult) return [];
    switch (activeTab) {
      case 'notFollowingBack':
        return scanResult.notFollowingBack || [];
      case 'lostMutual':
        // Combines lost mutual and unfollowed
        const lostMutual = scanResult?.diff?.lostMutual || [];
        const unfollowedBy = scanResult?.diff?.unfollowedBy || [];
        return [
          ...lostMutual,
          ...unfollowedBy.filter((u) => !lostMutual.some((lm) => lm.id === u.id)),
        ];
      case 'mutual':
        return scanResult.mutual || [];
      case 'fans':
        return scanResult.fans || [];
      case 'newFollowers':
        return scanResult?.diff?.newFollowers || [];
      case 'allFollowing':
        return scanResult.followings || [];
      case 'allFollowers':
        return scanResult.followers || [];
      default:
        return scanResult.notFollowingBack || [];
    }
  }, [activeTab, scanResult]);

  // Filter by query and whitelist
  const filteredList = useMemo(() => {
    return rawList.filter((user) => {
      if (hideWhitelisted && activeTab === 'notFollowingBack' && whitelist.has(user.id)) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = user.nickname?.toLowerCase().includes(q);
      const idMatch = String(user.id).includes(q);
      const descMatch = (user.strippedDescription || user.description || '')
        .toLowerCase()
        .includes(q);
      return nameMatch || idMatch || descMatch;
    });
  }, [rawList, searchQuery, hideWhitelisted, activeTab, whitelist]);

  // Sort list
  const sortedList = useMemo(() => {
    const list = [...filteredList];
    if (sortKey === 'id_desc') {
      return list.sort((a, b) => b.id - a.id);
    }
    if (sortKey === 'id_asc') {
      return list.sort((a, b) => a.id - b.id);
    }
    if (sortKey === 'name_asc') {
      return list.sort((a, b) => (a.nickname || '').localeCompare(b.nickname || ''));
    }
    return list;
  }, [filteredList, sortKey]);

  // Copy single user ID
  const handleCopyId = (id: number) => {
    navigator.clipboard.writeText(String(id));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Copy all IDs in current view
  const handleCopyAllIds = () => {
    const ids = sortedList.map((u) => u.id).join('\n');
    navigator.clipboard.writeText(ids);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Export CSV
  const handleExportCsv = () => {
    const tabNames: Record<TabKey, string> = {
      notFollowingBack: '片思い・解除された人',
      lostMutual: 'リムられ差分',
      mutual: '相互フォロー',
      fans: '片思われ',
      newFollowers: '新規フォロワー',
      allFollowing: '全フォロー中',
      allFollowers: '全フォロワー',
    };
    exportUsersToCsv(sortedList, tabNames[activeTab], scanResult.user.nickname);
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
      {/* Interactive Tabs Header (Segmented Bar) */}
      <div className="p-3 sm:p-4 bg-slate-900/60 border-b border-slate-700/60 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => onTabChange('notFollowingBack')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'notFollowingBack'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <UserX className="w-3.5 h-3.5 text-rose-400" />
            <span>片思い・解除された人</span>
            <span className="font-mono tabular-nums px-1.5 py-0.5 rounded text-[11px] bg-rose-500/20 text-rose-300">
              {scanResult.notFollowingBack.length}
            </span>
          </button>

          {scanResult.diff.hasPreviousSnapshot && (
            <button
              onClick={() => onTabChange('lostMutual')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'lostMutual'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>リムられ差分</span>
              <span className="font-mono tabular-nums px-1.5 py-0.5 rounded text-[11px] bg-amber-500/20 text-amber-300">
                {scanResult.diff.lostMutual.length + scanResult.diff.unfollowedBy.length}
              </span>
            </button>
          )}

          <button
            onClick={() => onTabChange('mutual')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'mutual'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>相互フォロー</span>
            <span className="font-mono tabular-nums px-1.5 py-0.5 rounded text-[11px] bg-emerald-500/20 text-emerald-300">
              {scanResult.mutual.length}
            </span>
          </button>

          <button
            onClick={() => onTabChange('fans')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'fans'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
            <span>片思われ (フォロワー)</span>
            <span className="font-mono tabular-nums px-1.5 py-0.5 rounded text-[11px] bg-cyan-500/20 text-cyan-300">
              {scanResult.fans.length}
            </span>
          </button>

          {scanResult.diff.hasPreviousSnapshot && scanResult.diff.newFollowers.length > 0 && (
            <button
              onClick={() => onTabChange('newFollowers')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'newFollowers'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>新規フォロワー</span>
              <span className="font-mono tabular-nums px-1.5 py-0.5 rounded text-[11px] bg-indigo-500/20 text-indigo-300">
                {scanResult.diff.newFollowers.length}
              </span>
            </button>
          )}

          <button
            onClick={() => onTabChange('allFollowing')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'allFollowing'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>全フォロー中</span>
            <span className="font-mono tabular-nums px-1.5 py-0.5 rounded text-[11px] bg-slate-700 text-slate-300">
              {scanResult.followings.length}
            </span>
          </button>

          <button
            onClick={() => onTabChange('allFollowers')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'allFollowers'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>全フォロワー</span>
            <span className="font-mono tabular-nums px-1.5 py-0.5 rounded text-[11px] bg-slate-700 text-slate-300">
              {scanResult.followers.length}
            </span>
          </button>
        </div>
      </div>

      {/* Filter, Search & Batch Actions Bar */}
      <div className="p-4 border-b border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-850/40">
        <div className="flex items-center gap-3 flex-1">
          {/* Keyword Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ニックネーム、ID、プロフで検索..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Sort Selector */}
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="default">取得順（新着優先）</option>
            <option value="id_desc">ユーザーID (大きい順 / 新規)</option>
            <option value="id_asc">ユーザーID (小さい順 / 古参)</option>
            <option value="name_asc">名前順 (50音・アルファベット)</option>
          </select>

          {/* Whitelist Toggle for 片思い tab */}
          {activeTab === 'notFollowingBack' && whitelist.size > 0 && (
            <button
              onClick={() => setHideWhitelisted(!hideWhitelisted)}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 border border-slate-700 rounded-lg flex items-center gap-1.5"
            >
              {hideWhitelisted ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-cyan-400" />
                  <span>除外済を非表示 ({whitelist.size}件)</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>除外済を表示中</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Batch export buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyAllIds}
            disabled={sortedList.length === 0}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            {copiedAll ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>{copiedAll ? 'コピー完了' : '全IDをコピー'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={sortedList.length === 0}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV出力</span>
          </button>
        </div>
      </div>

      {/* User Count Indicator */}
      <div className="px-4 py-2 bg-slate-900/40 text-[11px] text-slate-400 flex items-center justify-between border-b border-slate-800">
        <span>表示中: {sortedList.length} 件</span>
        {activeTab === 'notFollowingBack' && (
          <span className="text-rose-400 font-medium">
            💡 あなたがフォロー中ですが、相手はあなたをフォローしていません
          </span>
        )}
      </div>

      {/* User List Rows */}
      {sortedList.length === 0 ? (
        <div className="p-12 text-center space-y-2">
          <p className="text-slate-400 text-sm">該当するユーザーは見つかりませんでした</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-cyan-400 hover:underline"
            >
              検索条件をクリア
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-800/80">
          {sortedList.map((user) => {
            const isFollower = followerIdSet.has(user.id);
            const isFollowing = followingIdSet.has(user.id);
            const isMutual = isFollower && isFollowing;
            const isNotFollowingBack = isFollowing && !isFollower;
            const isFan = isFollower && !isFollowing;
            const isWhitelisted = whitelist.has(user.id);

            return (
              <div
                key={user.id}
                className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                {/* Left: Avatar & Basic Information */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <img
                    src={
                      user.icons?.small ||
                      user.icons?.large ||
                      'https://resource.video.nimg.jp/web/images/favicon_uni/48.png'
                    }
                    alt={user.nickname}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-xl object-cover bg-slate-900 border border-slate-700 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-white truncate max-w-xs">
                        {user.nickname || `ユーザー (${user.id})`}
                      </span>
                      <span className="text-xs font-mono text-slate-500">ID: {user.id}</span>

                      {/* Relationship indicator badges */}
                      {isMutual && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          相互フォロー
                        </span>
                      )}
                      {isNotFollowingBack && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          片思い (相手未フォロー)
                        </span>
                      )}
                      {isFan && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          片思われ
                        </span>
                      )}

                      {user.isPremium && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          プレ
                        </span>
                      )}

                      {isWhitelisted && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-700 text-slate-300 flex items-center gap-1">
                          <Shield className="w-2.5 h-2.5 text-cyan-400" />
                          <span>除外済</span>
                        </span>
                      )}
                    </div>

                    {/* Bio Snippet */}
                    {(user.strippedDescription || user.description) && (
                      <p className="text-xs text-slate-400 line-clamp-1 leading-relaxed">
                        {user.strippedDescription || user.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {/* Whitelist / Exclude button for known accounts */}
                  <button
                    onClick={() => onToggleWhitelist(user.id)}
                    title={isWhitelisted ? '除外を解除' : '公式・公認など除外リストに追加'}
                    className={`p-2 rounded-lg text-xs transition-colors ${
                      isWhitelisted
                        ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                  </button>

                  {/* Copy ID button */}
                  <button
                    onClick={() => handleCopyId(user.id)}
                    title="ユーザーIDをコピー"
                    className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 rounded-lg text-xs transition-colors"
                  >
                    {copiedId === user.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {/* Open Nico userpage */}
                  <a
                    href={`https://www.nicovideo.jp/user/${user.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-700/60 hover:bg-slate-700 border border-slate-600 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <span>ニコニコで開く</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
