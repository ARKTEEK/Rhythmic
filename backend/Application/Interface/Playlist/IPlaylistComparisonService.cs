using backend.Application.Model.Provider;

namespace backend.Application.Interface.Playlist;

public interface IPlaylistComparisonService {
  bool AreIdentical(
    IReadOnlyList<ProviderTrack> master,
    IReadOnlyList<ProviderTrack> target,
    PlaylistComparisonMode mode = PlaylistComparisonMode.PositionBased
  );

  PlaylistDiff CalculateDiff(
    IReadOnlyList<ProviderTrack> master,
    IReadOnlyList<ProviderTrack> target,
    PlaylistComparisonMode mode = PlaylistComparisonMode.PositionBased
  );

  string GetTrackKey(ProviderTrack track);
}

public enum PlaylistComparisonMode {
  PositionBased,

  SetBased
}

public class PlaylistDiff {
  public List<(ProviderTrack track, int? position)> ToAdd { get; set; } = new();

  public List<ProviderTrack> ToRemove { get; set; } = new();

  public bool HasChanges => ToAdd.Any() || ToRemove.Any();
}