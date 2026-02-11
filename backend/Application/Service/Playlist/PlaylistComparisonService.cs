using backend.Application.Interface.Playlist;
using backend.Application.Model.Provider;

namespace backend.Application.Service.Playlist;

public class PlaylistComparisonService : IPlaylistComparisonService {
  public bool AreIdentical(
    IReadOnlyList<ProviderTrack> master,
    IReadOnlyList<ProviderTrack> target,
    PlaylistComparisonMode mode = PlaylistComparisonMode.PositionBased
  ) {
    if (master.Count != target.Count) {
      return false;
    }

    return mode switch {
      PlaylistComparisonMode.PositionBased => AreIdenticalPositionBased(master, target),
      PlaylistComparisonMode.SetBased => AreIdenticalSetBased(master, target),
      _ => throw new ArgumentException($"Unknown comparison mode: {mode}", nameof(mode))
    };
  }

  public PlaylistDiff CalculateDiff(
    IReadOnlyList<ProviderTrack> master,
    IReadOnlyList<ProviderTrack> target,
    PlaylistComparisonMode mode = PlaylistComparisonMode.PositionBased
  ) {
    return mode switch {
      PlaylistComparisonMode.PositionBased => CalculateDiffPositionBased(master, target),
      PlaylistComparisonMode.SetBased => CalculateDiffSetBased(master, target),
      _ => throw new ArgumentException($"Unknown comparison mode: {mode}", nameof(mode))
    };
  }

  public string GetTrackKey(ProviderTrack track) {
    if (!string.IsNullOrWhiteSpace(track.TrackUrl)) {
      return track.TrackUrl.ToLowerInvariant().Trim();
    }

    if (!string.IsNullOrWhiteSpace(track.Id)) {
      return track.Id.ToLowerInvariant().Trim();
    }

    return
      $"{track.Title?.ToLowerInvariant().Trim() ?? ""}|{track.Artist?.ToLowerInvariant().Trim() ?? ""}";
  }

  private bool AreIdenticalPositionBased(
    IReadOnlyList<ProviderTrack> master,
    IReadOnlyList<ProviderTrack> target
  ) {
    Dictionary<int, string> masterByPosition = BuildPositionMap(master);
    Dictionary<int, string> targetByPosition = BuildPositionMap(target);

    if (masterByPosition.Count != targetByPosition.Count) {
      return false;
    }

    foreach ((int position, string? masterKey) in masterByPosition) {
      if (!targetByPosition.TryGetValue(position, out string? targetKey) ||
          masterKey != targetKey) {
        return false;
      }
    }

    return true;
  }

  private bool AreIdenticalSetBased(
    IReadOnlyList<ProviderTrack> master,
    IReadOnlyList<ProviderTrack> target
  ) {
    HashSet<string> masterKeys = GetTrackKeys(master);
    HashSet<string> targetKeys = GetTrackKeys(target);

    return masterKeys.SetEquals(targetKeys);
  }

  private PlaylistDiff CalculateDiffPositionBased(
    IReadOnlyList<ProviderTrack> master,
    IReadOnlyList<ProviderTrack> target
  ) {
    Dictionary<int, ProviderTrack> masterByPosition = new();
    Dictionary<int, ProviderTrack> targetByPosition = new();

    foreach (ProviderTrack track in master) {
      int pos = track.Position ?? 0;
      masterByPosition[pos] = track;
    }

    foreach (ProviderTrack track in target) {
      int pos = track.Position ?? 0;
      targetByPosition[pos] = track;
    }

    PlaylistDiff diff = new();

    foreach ((int position, ProviderTrack? masterTrack) in masterByPosition) {
      string masterKey = GetTrackKey(masterTrack);
      if (!targetByPosition.TryGetValue(position, out ProviderTrack? targetTrack) ||
          GetTrackKey(targetTrack) != masterKey) {
        diff.ToAdd.Add((masterTrack, position));
      }
    }

    foreach ((int position, ProviderTrack? targetTrack) in targetByPosition) {
      string targetKey = GetTrackKey(targetTrack);
      if (!masterByPosition.TryGetValue(position, out ProviderTrack? masterTrack) ||
          GetTrackKey(masterTrack) != targetKey) {
        diff.ToRemove.Add(targetTrack);
      }
    }

    return diff;
  }

  private PlaylistDiff CalculateDiffSetBased(
    IReadOnlyList<ProviderTrack> master,
    IReadOnlyList<ProviderTrack> target
  ) {
    HashSet<string> masterKeys = GetTrackKeys(master);
    HashSet<string> targetKeys = GetTrackKeys(target);

    PlaylistDiff diff = new();

    diff.ToAdd = master
      .Where(t => !targetKeys.Contains(GetTrackKey(t)))
      .Select(t => (track: t, position: (int?)null))
      .ToList();

    diff.ToRemove = target
      .Where(t => !masterKeys.Contains(GetTrackKey(t)))
      .ToList();

    return diff;
  }

  private Dictionary<int, string> BuildPositionMap(IReadOnlyList<ProviderTrack> tracks) {
    Dictionary<int, string> map = new();
    foreach (ProviderTrack track in tracks) {
      int pos = track.Position ?? 0;
      map[pos] = GetTrackKey(track);
    }

    return map;
  }

  private HashSet<string> GetTrackKeys(IEnumerable<ProviderTrack> tracks) {
    return tracks.Select(GetTrackKey).ToHashSet();
  }
}