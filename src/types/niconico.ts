export interface NicoUser {
  id: number;
  nickname: string;
  icons?: {
    small?: string;
    large?: string;
  };
  description?: string;
  strippedDescription?: string;
  shortDescription?: string;
  isPremium?: boolean;
}

export interface UserProfile {
  id: number;
  nickname: string;
  iconUrl: string;
  description: string;
  followeeCount: number;
  followerCount: number;
  level?: number;
  isPremium?: boolean;
}

export interface ScanStats {
  followingCount: number;
  followerCount: number;
  mutualCount: number;
  notFollowingBackCount: number;
  fansCount: number;
}

export interface DiffResult {
  hasPreviousSnapshot: boolean;
  previousTimestamp: string | null;
  unfollowedBy: NicoUser[]; // users who disappeared from followers
  lostMutual: NicoUser[]; // users who were mutual, but now unfollowed you
  newFollowers: NicoUser[]; // newly acquired followers
}

export interface ScanResult {
  user: UserProfile;
  stats: ScanStats;
  mutual: NicoUser[];
  notFollowingBack: NicoUser[];
  fans: NicoUser[];
  followings: NicoUser[];
  followers: NicoUser[];
  diff: DiffResult;
  snapshotId?: string;
}

export interface ScanProgress {
  phase: 'init' | 'following' | 'follower' | 'analyzing' | 'idle';
  current: number;
  total: number;
  page: number;
  message: string;
}

export interface StoredSnapshot {
  id: string;
  userId: number;
  nickname: string;
  timestamp: string;
  stats: ScanStats;
  followingIds: number[];
  followerIds: number[];
}

export type TabKey =
  | 'notFollowingBack'
  | 'lostMutual'
  | 'mutual'
  | 'fans'
  | 'newFollowers'
  | 'allFollowing'
  | 'allFollowers';

export type SortKey = 'default' | 'id_desc' | 'id_asc' | 'name_asc';
