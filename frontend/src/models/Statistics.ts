export interface SystemStatistics {
  users: UserStatistics;
  playlists: PlaylistStatistics;
  syncs: SyncStatistics;
  audits: AuditStatistics;
}

export interface UserStatistics {
  totalUsers: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  userRegistrations: DailyCount[];
}

export interface PlaylistStatistics {
  totalPlaylists: number;
  spotifyPlaylists: number;
  youTubePlaylists: number;
  totalTracks: number;
  playlistsCreated: DailyCount[];
}

export interface SyncStatistics {
  totalSyncGroups: number;
  activeSyncGroups: number;
  totalSyncs: number;
  syncsToday: number;
  syncsThisWeek: number;
  syncsThisMonth: number;
  dailySyncs: DailyCount[];
}

export interface AuditStatistics {
  totalActions: number;
  actionsToday: number;
  actionsThisWeek: number;
  actionsThisMonth: number;
  actionsByType: Record<string, number>;
}

export interface DailyCount {
  date: string;
  count: number;
}

