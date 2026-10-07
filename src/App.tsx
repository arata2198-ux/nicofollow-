/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { ScannerInput } from './components/ScannerInput';
import { UserOverview } from './components/UserOverview';
import { UserListTable } from './components/UserListTable';
import { Footer } from './components/Footer';
import { LegalModals, LegalModalType } from './components/LegalModals';
import {
  ScanResult,
  ScanProgress,
  StoredSnapshot,
  TabKey,
} from './types/niconico';
import { playAlertChime, sendBrowserNotification } from './utils/audio';

const MAX_DAILY_SCANS = 3;
const COOLDOWN_MS = 60 * 60 * 1000; // 60 minutes in milliseconds

interface RateLimitData {
  date: string;
  scansToday: number;
  lastScanTimestamp: number | null;
}

interface CachedScanEntry {
  userId: number;
  nickname: string;
  timestamp: number;
  result: ScanResult;
}

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseUserId(input: string): number | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10);
  }
  const match = trimmed.match(/nicovideo\.jp\/user\/(\d+)/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  const anyDigits = trimmed.match(/(\d{5,})/);
  if (anyDigits && anyDigits[1]) {
    return parseInt(anyDigits[1], 10);
  }
  return null;
}

export default function App() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [legalModal, setLegalModal] = useState<LegalModalType>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('notFollowingBack');

  // Load cached scan results so page refreshes don't lose data
  const [scanResult, setScanResult] = useState<ScanResult | null>(() => {
    try {
      const saved = localStorage.getItem('nicofollow_last_scan_result');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          parsed.user &&
          typeof parsed.user === 'object' &&
          parsed.stats &&
          typeof parsed.stats === 'object' &&
          Array.isArray(parsed.followings) &&
          Array.isArray(parsed.followers)
        ) {
          return parsed;
        }
      }
    } catch {}
    return null;
  });

  const [cachedHistory, setCachedHistory] = useState<CachedScanEntry[]>(() => {
    try {
      const saved = localStorage.getItem('nicofollow_cached_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((item) => item && typeof item === 'object' && item.userId);
        }
      }
    } catch {}
    return [];
  });

  const [inputValue, setInputValue] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('nicofollow_last_scan_result');
      if (saved) {
        const parsed: ScanResult = JSON.parse(saved);
        if (parsed?.user?.id) {
          return `https://www.nicovideo.jp/user/${parsed.user.id}`;
        }
      }
    } catch {}
    return '';
  });

  const [isScanning, setIsScanning] = useState(false);

  // Rate Limiting State (Daily 3 scans & 60 min cooldown)
  const [rateLimit, setRateLimit] = useState<RateLimitData>(() => {
    const today = getTodayString();
    try {
      const raw = localStorage.getItem('nicofollow_rate_limit');
      if (raw) {
        const parsed: RateLimitData = JSON.parse(raw);
        if (parsed.date === today) {
          return parsed;
        } else {
          // New day rollover: reset count, preserve lastScanTimestamp for cooldown
          return {
            date: today,
            scansToday: 0,
            lastScanTimestamp: parsed.lastScanTimestamp || null,
          };
        }
      }
    } catch {}
    return {
      date: today,
      scansToday: 0,
      lastScanTimestamp: null,
    };
  });

  // Clock tick for live countdown timer
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute remaining quota and cooldown
  const today = getTodayString();
  const scansToday = rateLimit.date === today ? rateLimit.scansToday : 0;
  const remainingScans = Math.max(0, MAX_DAILY_SCANS - scansToday);

  const remainingCooldownMs = rateLimit.lastScanTimestamp
    ? Math.max(0, COOLDOWN_MS - (now - rateLimit.lastScanTimestamp))
    : 0;

  const isInCooldown = remainingCooldownMs > 0;

  const cooldownMinutes = Math.floor(remainingCooldownMs / 60000);
  const cooldownSeconds = Math.floor((remainingCooldownMs % 60000) / 1000);
  const cooldownText = `${cooldownMinutes}分${String(cooldownSeconds).padStart(2, '0')}秒`;

  const [snapshots, setSnapshots] = useState<StoredSnapshot[]>(() => {
    try {
      const saved = localStorage.getItem('nicofollow_snapshots');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [whitelist, setWhitelist] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('nicofollow_whitelist');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [progress, setProgress] = useState<ScanProgress>({
    phase: 'idle',
    current: 0,
    total: 0,
    page: 0,
    message: '',
  });

  const eventSourceRef = useRef<EventSource | null>(null);

  // Extracted user ID from input
  const extractedId = useMemo(() => parseUserId(inputValue), [inputValue]);

  // Save whitelist changes
  const toggleWhitelist = (userId: number) => {
    setWhitelist((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      localStorage.setItem('nicofollow_whitelist', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  // Primary scanning function using Server-Sent Events
  const runScan = useCallback(() => {
    const id = extractedId;
    if (!id) {
      setErrorMessage(
        '有効なニコニコのURL（例: https://www.nicovideo.jp/user/12345678/follow）またはユーザーIDを入力してください'
      );
      return;
    }

    if (remainingScans <= 0) {
      setErrorMessage('本日の無料スキャン上限（3回）に達しました。日付が変わるとリセットされます。');
      return;
    }

    if (isInCooldown) {
      setErrorMessage(`前回のスキャンから60分間は再スキャンできません（残り ${cooldownText}）。`);
      return;
    }

    if (isScanning) return;

    setErrorMessage(null);
    setIsScanning(true);
    setProgress({
      phase: 'init',
      current: 0,
      total: 0,
      page: 0,
      message: 'サーバーと通信開始...',
    });

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const sse = new EventSource(`/api/scan-stream?userId=${id}`);
    eventSourceRef.current = sse;

    sse.addEventListener('status', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        setProgress((p) => ({ ...p, message: data.message || '' }));
      } catch {}
    });

    sse.addEventListener('progress', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        setProgress({
          phase: data.phase || 'following',
          current: data.current || 0,
          total: data.total || 0,
          page: data.page || 0,
          message: data.message || '',
        });
      } catch {}
    });

    sse.addEventListener('complete', (e: MessageEvent) => {
      try {
        const data: ScanResult = JSON.parse(e.data);
        setScanResult(data);
        setIsScanning(false);
        setProgress({
          phase: 'idle',
          current: 0,
          total: 0,
          page: 0,
          message: '解析完了',
        });
        sse.close();

        // Persist scan result to localStorage so refresh retains data!
        try {
          localStorage.setItem('nicofollow_last_scan_result', JSON.stringify(data));
        } catch {}

        // Add to cached history for instant switching
        const newCacheEntry: CachedScanEntry = {
          userId: data.user.id,
          nickname: data.user.nickname,
          timestamp: Date.now(),
          result: data,
        };
        setCachedHistory((prev) => {
          const filtered = prev.filter((p) => p.userId !== data.user.id);
          const updated = [newCacheEntry, ...filtered].slice(0, 5);
          try {
            localStorage.setItem('nicofollow_cached_history', JSON.stringify(updated));
          } catch {}
          return updated;
        });

        // Record scan for rate-limiting (3/day & 60-min cooldown)
        const updatedDate = getTodayString();
        const updatedRateLimit: RateLimitData = {
          date: updatedDate,
          scansToday: (rateLimit.date === updatedDate ? rateLimit.scansToday : 0) + 1,
          lastScanTimestamp: Date.now(),
        };
        setRateLimit(updatedRateLimit);
        localStorage.setItem('nicofollow_rate_limit', JSON.stringify(updatedRateLimit));

        // Check if unfollow detected
        const hasUnfollows =
          data.diff.hasPreviousSnapshot &&
          (data.diff.lostMutual.length > 0 || data.diff.unfollowedBy.length > 0);

        if (hasUnfollows) {
          playAlertChime('alert');
          sendBrowserNotification(
            '【リムられ検知】ニコニコ相互解除が発生しました',
            `${data.diff.lostMutual.length} 名の相互フォローが解除されました。`
          );
          setActiveTab('lostMutual');
        } else {
          playAlertChime('success');
          if (data.notFollowingBack.length > 0) {
            setActiveTab('notFollowingBack');
          } else {
            setActiveTab('mutual');
          }
        }

        // Save snapshot to history
        const newSnapshot: StoredSnapshot = {
          id: `snap_${Date.now()}`,
          userId: data.user.id,
          nickname: data.user.nickname,
          timestamp: new Date().toISOString(),
          stats: data.stats,
          followingIds: data.followings.map((u) => u.id),
          followerIds: data.followers.map((u) => u.id),
        };

        setSnapshots((prev) => {
          const updated = [newSnapshot, ...prev.slice(0, 29)];
          try {
            localStorage.setItem('nicofollow_snapshots', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      } catch (err: any) {
        setErrorMessage('解析結果の読み込みに失敗しました');
        setIsScanning(false);
        sse.close();
      }
    });

    sse.addEventListener('error', (e: any) => {
      console.error('SSE Error:', e);
      setErrorMessage(
        'データ取得中にエラーが発生しました。URLまたはIDを確認して再度お試しください。'
      );
      setIsScanning(false);
      sse.close();
    });
  }, [extractedId, remainingScans, isInCooldown, cooldownText, isScanning, rateLimit]);

  // Clean up SSE on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleSelectCachedScan = useCallback(
    (userId: number) => {
      const entry = cachedHistory.find((item) => item.userId === userId);
      if (entry) {
        setScanResult(entry.result);
        setInputValue(`https://www.nicovideo.jp/user/${entry.userId}`);
        try {
          localStorage.setItem('nicofollow_last_scan_result', JSON.stringify(entry.result));
        } catch {}
      }
    },
    [cachedHistory]
  );

  const handleClearHistory = useCallback(() => {
    setCachedHistory([]);
    setScanResult(null);
    setInputValue('');
    try {
      localStorage.removeItem('nicofollow_last_scan_result');
      localStorage.removeItem('nicofollow_cached_history');
      localStorage.removeItem('nicofollow_snapshots');
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Title & Scanner Input */}
        <div className="space-y-4">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            ニコニコ相互フォローチェッカー
          </h1>

          <ScannerInput
            inputValue={inputValue}
            onInputChange={setInputValue}
            onScan={runScan}
            isScanning={isScanning}
            progress={progress}
            extractedId={extractedId}
            errorMessage={errorMessage}
            remainingScans={remainingScans}
            maxScans={MAX_DAILY_SCANS}
            isInCooldown={isInCooldown}
            cooldownText={cooldownText}
            cachedScans={(cachedHistory || [])
              .filter((c) => c && c.userId)
              .map((c) => ({
                userId: c.userId,
                nickname: c.nickname || `ID:${c.userId}`,
                timestamp: c.timestamp || Date.now(),
              }))}
            onSelectCachedScan={handleSelectCachedScan}
            hasActiveResult={!!(scanResult && scanResult.user)}
            onClearHistory={handleClearHistory}
          />
        </div>

        {/* Results Area */}
        {scanResult && scanResult.user && scanResult.stats && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Account Overview & Key Metrics */}
            <UserOverview
              user={scanResult.user}
              stats={scanResult.stats}
              diff={
                scanResult.diff || {
                  hasPreviousSnapshot: false,
                  previousTimestamp: null,
                  unfollowedBy: [],
                  lostMutual: [],
                  newFollowers: [],
                }
              }
              onSelectTab={(tab) => setActiveTab(tab)}
              lastScannedTime={
                snapshots.length > 0 ? snapshots[0].timestamp : null
              }
              onClearHistory={handleClearHistory}
            />

            {/* Detailed User Table & Tabs */}
            <UserListTable
              scanResult={scanResult}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              whitelist={whitelist}
              onToggleWhitelist={toggleWhitelist}
            />
          </div>
        )}
      </main>

      {/* AdSense Compliant Footer */}
      <Footer onOpenModal={setLegalModal} />

      {/* Legal & Policy Modals */}
      <LegalModals
        activeModal={legalModal}
        onClose={() => setLegalModal(null)}
        onOpenModal={setLegalModal}
      />
    </div>
  );
}
