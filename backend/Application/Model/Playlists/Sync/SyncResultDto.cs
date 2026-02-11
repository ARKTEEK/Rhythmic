namespace backend.Application.Model.Playlists.Sync;

public class SyncResultDto {
  public int SyncGroupId { get; set; }
  public string SyncGroupName { get; set; } = string.Empty;
  public bool Success { get; set; }
  public string? ErrorMessage { get; set; }
  public int ChildrenSynced { get; set; }
  public int ChildrenSkipped { get; set; }
  public int ChildrenFailed { get; set; }
  public List<ChildSyncResultDto> ChildResults { get; set; } = new();
  public DateTime SyncedAt { get; set; } = DateTime.UtcNow;
}

public class ChildSyncResultDto {
  public string ChildPlaylistId { get; set; } = string.Empty;
  public bool Success { get; set; }
  public string? ErrorMessage { get; set; }
  public bool Skipped { get; set; }
  public string? SkipReason { get; set; }
}