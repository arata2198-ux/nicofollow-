import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface NicoUser {
  id: number;
  nickname: string;
  icons?: {
    small?: string;
    large?: string;
  };
  description?: string;
  strippedDescription?: string;
  isPremium?: boolean;
}

interface UserProfile {
  id: number;
  nickname: string;
  iconUrl: string;
  description: string;
  followeeCount: number;
  followerCount: number;
  level?: number;
  isPremium?: boolean;
}

interface ScanSnapshot {
  id: string;
  userId: number;
  nickname: string;
  timestamp: string;
  followeeCount: number;
  followerCount: number;
  mutualCount: number;
  notFollowingBackCount: number;
  fansCount: number;
  followingIds: number[];
  followerIds: number[];
  unfollowedBy?: NicoUser[];
  lostMutual?: NicoUser[];
  newFollowers?: NicoUser[];
}

// In-memory snapshot storage per user
const snapshotStore: Map<number, ScanSnapshot[]> = new Map();

function callNvapi<T = any>(apiPath: string, query = ''): Promise<T> {
  return new Promise((resolve, reject) => {
    const fullUrl = `https://nvapi.nicovideo.jp${apiPath}${query ? '?' + query : ''}`;
    const req = https.get(
      fullUrl,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'X-Frontend-Id': '6',
          'X-Frontend-Version': '0',
          Origin: 'https://www.nicovideo.jp',
          Referer: 'https://www.nicovideo.jp/',
          Accept: 'application/json',
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 400) {
            return reject(
              new Error(`Niconico API error: HTTP ${res.statusCode} (${raw.substring(0, 200)})`)
            );
          }
          try {
            const parsed = JSON.parse(raw);
            resolve(parsed);
          } catch (err) {
            reject(new Error(`Failed to parse Niconico response: ${err}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy(new Error('Request timed out'));
    });
  });
}

function extractUserId(input: string): number | null {
  if (!input) return null;
  const trimmed = input.trim();
  // Check if raw number
  if (/^\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10);
  }
  // Check if URL: nicovideo.jp/user/{id}
  const match = trimmed.match(/nicovideo\.jp\/user\/(\d+)/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  // Check any digits
  const anyDigits = trimmed.match(/(\d{5,})/);
  if (anyDigits && anyDigits[1]) {
    return parseInt(anyDigits[1], 10);
  }
  return null;
}

async function getUserProfile(userId: number): Promise<UserProfile> {
  const json = await callNvapi(`/v1/users/${userId}`);
  const user = json?.data?.user;
  if (!user) {
    throw new Error('指定されたニコニコユーザーが見つかりませんでした');
  }
  return {
    id: user.id,
    nickname: user.nickname || '不明なユーザー',
    iconUrl: user.icons?.large || user.icons?.small || '',
    description: user.strippedDescription || user.description || '',
    followeeCount: user.followeeCount ?? 0,
    followerCount: user.followerCount ?? 0,
    level: user.userLevel?.currentLevel,
    isPremium: Boolean(user.isPremium),
  };
}

async function fetchAllList(
  type: 'following' | 'followed-by',
  userId: number,
  onProgress?: (current: number, total: number, page: number) => void
): Promise<NicoUser[]> {
  const endpoint =
    type === 'following'
      ? `/v1/users/${userId}/following/users`
      : `/v1/users/${userId}/followed-by/users`;

  let items: NicoUser[] = [];
  let cursor: string | null = null;
  let hasNext = true;
  let page = 1;
  let totalEstimated = 0;

  while (hasNext) {
    let query = 'pageSize=100';
    if (cursor) {
      query += `&cursor=${encodeURIComponent(cursor)}`;
    }

    const res = await callNvapi(endpoint, query);
    const data = res?.data;
    if (!data || !Array.isArray(data.items)) {
      break;
    }

    items = items.concat(data.items);
    totalEstimated =
      type === 'following'
        ? data.summary?.followees ?? items.length
        : data.summary?.followers ?? items.length;

    if (onProgress) {
      onProgress(items.length, totalEstimated, page);
    }

    hasNext = Boolean(data.summary?.hasNext && data.summary?.cursor);
    cursor = data.summary?.cursor || null;
    page++;

    // Safety guard against infinite loops
    if (page > 100) break;

    // Small delay to prevent API throttling
    if (hasNext) {
      await new Promise((r) => setTimeout(r, 120));
    }
  }

  return items;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Helper route to parse User ID
  app.post('/api/parse-id', (req, res) => {
    const { url } = req.body;
    const userId = extractUserId(url);
    if (!userId) {
      return res.status(400).json({ error: '有効なユーザーIDまたはURLが見つかりませんでした' });
    }
    res.json({ userId });
  });

  // User profile
  app.get('/api/user/:userId', async (req, res) => {
    try {
      const userId = extractUserId(req.params.userId);
      if (!userId) {
        return res.status(400).json({ error: '無効なユーザーIDです' });
      }
      const profile = await getUserProfile(userId);
      res.json(profile);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'ユーザー情報の取得に失敗しました' });
    }
  });

  // SSE streaming endpoint for real-time progress during full crawl
  app.get('/api/scan-stream', async (req, res) => {
    const rawInput = String(req.query.userId || '');
    const userId = extractUserId(rawInput);
    if (!userId) {
      res.status(400).json({ error: '無効なユーザーIDまたはURLです' });
      return;
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendEvent = (event: string, data: any) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    try {
      sendEvent('status', { message: 'ユーザー基本情報を取得中...' });
      const profile = await getUserProfile(userId);
      sendEvent('user', profile);

      sendEvent('status', {
        message: `フォロー中一覧を取得中... (全${profile.followeeCount}件をページ送りで巡回)`,
      });

      const followings = await fetchAllList('following', userId, (current, total, page) => {
        sendEvent('progress', {
          phase: 'following',
          current,
          total: total || profile.followeeCount,
          page,
          message: `「さらに表示する」を自動取得中: フォロー中 ${current} / ${total || profile.followeeCount} 件 (第${page}ページ)`,
        });
      });

      sendEvent('status', {
        message: `フォロワー一覧を取得中... (全${profile.followerCount}件をページ送りで巡回)`,
      });

      const followers = await fetchAllList('followed-by', userId, (current, total, page) => {
        sendEvent('progress', {
          phase: 'follower',
          current,
          total: total || profile.followerCount,
          page,
          message: `「さらに表示する」を自動取得中: フォロワー ${current} / ${total || profile.followerCount} 件 (第${page}ページ)`,
        });
      });

      sendEvent('status', { message: '相互関係・片思い・解除差分を解析中...' });

      const followingMap = new Map(followings.map((u) => [u.id, u]));
      const followerMap = new Map(followers.map((u) => [u.id, u]));

      // 相互フォロー
      const mutual = followings.filter((u) => followerMap.has(u.id));

      // 片思い / フォローバックされていない・外された人
      const notFollowingBack = followings.filter((u) => !followerMap.has(u.id));

      // 片思われ (相手はフォローしてくれているが自分はフォローしていない)
      const fans = followers.filter((u) => !followingMap.has(u.id));

      // Compare with previous snapshot if exists in store
      const history = snapshotStore.get(userId) || [];
      const prevSnapshot = history.length > 0 ? history[history.length - 1] : null;

      let unfollowedBy: NicoUser[] = [];
      let lostMutual: NicoUser[] = [];
      let newFollowers: NicoUser[] = [];

      if (prevSnapshot) {
        const prevFollowerSet = new Set(prevSnapshot.followerIds);
        const prevFollowingSet = new Set(prevSnapshot.followingIds);

        // Previous follower who is no longer following
        unfollowedBy = prevSnapshot.followerIds
          .filter((id) => !followerMap.has(id))
          .map((id) => ({
            id,
            nickname: `ユーザー (${id})`,
          }));

        // Was mutual previously, but now no longer following you (while you still follow them)
        lostMutual = notFollowingBack.filter(
          (u) => prevFollowerSet.has(u.id) && prevFollowingSet.has(u.id)
        );

        // New followers
        newFollowers = followers.filter((u) => !prevFollowerSet.has(u.id));
      }

      // Record snapshot
      const newSnapshot: ScanSnapshot = {
        id: `snap_${Date.now()}`,
        userId,
        nickname: profile.nickname,
        timestamp: new Date().toISOString(),
        followeeCount: followings.length,
        followerCount: followers.length,
        mutualCount: mutual.length,
        notFollowingBackCount: notFollowingBack.length,
        fansCount: fans.length,
        followingIds: followings.map((u) => u.id),
        followerIds: followers.map((u) => u.id),
        unfollowedBy,
        lostMutual,
        newFollowers,
      };

      if (!snapshotStore.has(userId)) {
        snapshotStore.set(userId, []);
      }
      const list = snapshotStore.get(userId)!;
      list.push(newSnapshot);
      // Keep up to 20 snapshots
      if (list.length > 20) {
        list.shift();
      }

      sendEvent('complete', {
        user: profile,
        stats: {
          followingCount: followings.length,
          followerCount: followers.length,
          mutualCount: mutual.length,
          notFollowingBackCount: notFollowingBack.length,
          fansCount: fans.length,
        },
        mutual,
        notFollowingBack,
        fans,
        followings,
        followers,
        diff: {
          hasPreviousSnapshot: Boolean(prevSnapshot),
          previousTimestamp: prevSnapshot?.timestamp || null,
          unfollowedBy,
          lostMutual,
          newFollowers,
        },
        snapshotId: newSnapshot.id,
      });

      res.write('event: done\ndata: {}\n\n');
      res.end();
    } catch (err: any) {
      console.error('Scan stream error:', err);
      sendEvent('error', { message: err.message || 'スキャン中にエラーが発生しました' });
      res.end();
    }
  });

  // REST scan endpoint (fallback or one-shot)
  app.post('/api/scan', async (req, res) => {
    const { userId: rawInput } = req.body;
    const userId = extractUserId(String(rawInput));
    if (!userId) {
      return res.status(400).json({ error: '無効なユーザーIDまたはURLです' });
    }

    try {
      const profile = await getUserProfile(userId);
      const followings = await fetchAllList('following', userId);
      const followers = await fetchAllList('followed-by', userId);

      const followerMap = new Map(followers.map((u) => [u.id, u]));
      const followingMap = new Map(followings.map((u) => [u.id, u]));

      const mutual = followings.filter((u) => followerMap.has(u.id));
      const notFollowingBack = followings.filter((u) => !followerMap.has(u.id));
      const fans = followers.filter((u) => !followingMap.has(u.id));

      const history = snapshotStore.get(userId) || [];
      const prevSnapshot = history.length > 0 ? history[history.length - 1] : null;

      let unfollowedBy: NicoUser[] = [];
      let lostMutual: NicoUser[] = [];
      let newFollowers: NicoUser[] = [];

      if (prevSnapshot) {
        const prevFollowerSet = new Set(prevSnapshot.followerIds);
        const prevFollowingSet = new Set(prevSnapshot.followingIds);

        unfollowedBy = prevSnapshot.followerIds
          .filter((id) => !followerMap.has(id))
          .map((id) => ({ id, nickname: `ユーザー (${id})` }));

        lostMutual = notFollowingBack.filter(
          (u) => prevFollowerSet.has(u.id) && prevFollowingSet.has(u.id)
        );

        newFollowers = followers.filter((u) => !prevFollowerSet.has(u.id));
      }

      res.json({
        user: profile,
        stats: {
          followingCount: followings.length,
          followerCount: followers.length,
          mutualCount: mutual.length,
          notFollowingBackCount: notFollowingBack.length,
          fansCount: fans.length,
        },
        mutual,
        notFollowingBack,
        fans,
        diff: {
          hasPreviousSnapshot: Boolean(prevSnapshot),
          previousTimestamp: prevSnapshot?.timestamp || null,
          unfollowedBy,
          lostMutual,
          newFollowers,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'スキャンに失敗しました' });
    }
  });

  // Snapshot history list
  app.get('/api/snapshots/:userId', (req, res) => {
    const userId = extractUserId(req.params.userId);
    if (!userId) {
      return res.status(400).json({ error: '無効なユーザーIDです' });
    }
    const history = snapshotStore.get(userId) || [];
    res.json(history.map(s => ({
      id: s.id,
      timestamp: s.timestamp,
      followeeCount: s.followeeCount,
      followerCount: s.followerCount,
      mutualCount: s.mutualCount,
      notFollowingBackCount: s.notFollowingBackCount,
      fansCount: s.fansCount,
      lostMutualCount: s.lostMutual?.length || 0,
      unfollowedByCount: s.unfollowedBy?.length || 0,
    })));
  });

  // Clear snapshots for user
  app.delete('/api/snapshots/:userId', (req, res) => {
    const userId = extractUserId(req.params.userId);
    if (userId) {
      snapshotStore.delete(userId);
    }
    res.json({ success: true });
  });

  // Download project source code zip
  app.get('/download-code', (_req, res) => {
    const zipPath = path.resolve(__dirname, 'public/nicofollow-files.zip');
    res.download(zipPath, 'nicofollow-code.zip');
  });

  // Mount Vite or serve static files
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
