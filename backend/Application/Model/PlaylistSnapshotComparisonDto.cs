namespace backend.Application.Model;

public class PlaylistSnapshotComparisonDto {
  public PlaylistSnapshotDto Snapshot { get; set; } = new();
  public List<ProviderTrack> CurrentTracks { get; set; } = new();
  public List<ProviderTrack> SnapshotTracks { get; set; } = new();
  public List<ProviderTrack> AddedTracks { get; set; } = new();
  public List<ProviderTrack> RemovedTracks { get; set; } = new();
}

