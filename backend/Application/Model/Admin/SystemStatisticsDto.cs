namespace backend.Application.Model.Admin;

public class SystemStatisticsDto {
  public UserStatistics Users { get; set; }
  public PlaylistStatistics Playlists { get; set; }
  public SyncStatistics Syncs { get; set; }
  public AuditStatistics Audits { get; set; }
}

public class UserStatistics {
  public int TotalUsers { get; set; }
  public int DailyActiveUsers { get; set; }
  public int WeeklyActiveUsers { get; set; }
  public int MonthlyActiveUsers { get; set; }
  public List<DailyCount> UserRegistrations { get; set; }
}

public class PlaylistStatistics {
  public int TotalPlaylists { get; set; }
  public int SpotifyPlaylists { get; set; }
  public int YouTubePlaylists { get; set; }
  public int TotalTracks { get; set; }
  public List<DailyCount> PlaylistsCreated { get; set; }
}

public class SyncStatistics {
  public int TotalSyncGroups { get; set; }
  public int ActiveSyncGroups { get; set; }
  public int TotalSyncs { get; set; }
  public int SyncsToday { get; set; }
  public int SyncsThisWeek { get; set; }
  public int SyncsThisMonth { get; set; }
  public List<DailyCount> DailySyncs { get; set; }
}

public class AuditStatistics {
  public int TotalActions { get; set; }
  public int ActionsToday { get; set; }
  public int ActionsThisWeek { get; set; }
  public int ActionsThisMonth { get; set; }
  public Dictionary<string, int> ActionsByType { get; set; }
}

public class DailyCount {
  public DateTime Date { get; set; }
  public int Count { get; set; }
}

