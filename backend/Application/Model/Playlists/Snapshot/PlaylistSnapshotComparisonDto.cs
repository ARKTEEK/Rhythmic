using backend.Application.Model.Provider;

namespace backend.Application.Model.Playlists.Snapshot;

public class PlaylistSnapshotComparisonDto {
  public PlaylistSnapshotDto Snapshot { get; set; } = new();
  public List<ProviderTrack> CurrentTracks { get; set; } = new();
  public List<ProviderTrack> SnapshotTracks { get; set; } = new();
  public List<ProviderTrack> AddedTracks { get; set; } = new();
  public List<ProviderTrack> RemovedTracks { get; set; } = new();
}