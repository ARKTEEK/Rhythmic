using backend.Application.Interface.Playlist;
using backend.Application.Interface.Playlist.Sync;
using backend.Application.Model.Playlists.Requests;
using backend.Application.Model.Provider;
using backend.Domain.Enum;

namespace backend.Application.Service.Playlist.Sync;

public class PlaylistTrackSynchronizer : IPlaylistTrackSynchronizer {
  private readonly IPlaylistComparisonService _comparisonService;
  private readonly IPlaylistService _playlistService;

  public PlaylistTrackSynchronizer(IPlaylistService playlistService,
    IPlaylistComparisonService comparisonService) {
    _playlistService = playlistService;
    _comparisonService = comparisonService;
  }

  public async Task SynchronizeTracksAsync(OAuthProvider provider, string playlistId,
    string providerAccountId, List<ProviderTrack> masterTracks) {
    List<ProviderTrack> childTracks =
      await _playlistService.GetTracksByPlaylistIdAsync(
        provider,
        playlistId,
        providerAccountId);
    PlaylistDiff diff = _comparisonService.CalculateDiff(masterTracks, childTracks);

    List<(ProviderTrack track, int position)> tracksToAdd =
      await ResolveTracksOnProvider(
        provider,
        providerAccountId,
        diff.ToAdd);

    bool useReplaceAll = tracksToAdd.Count + diff.ToRemove.Count > masterTracks.Count / 2;

    if (useReplaceAll) {
      await ExecuteReplaceAll(
        provider,
        playlistId,
        providerAccountId,
        tracksToAdd);
    } else {
      await ExecuteIncrementalUpdate(provider,
        playlistId,
        providerAccountId,
        diff.ToRemove,
        tracksToAdd);
    }
  }

  private async Task<List<(ProviderTrack track, int position)>> ResolveTracksOnProvider(
    OAuthProvider provider,
    string accountId,
    List<(ProviderTrack track, int? position)> toAdd) {
    List<(ProviderTrack, int)> resolved = new();
    foreach ((ProviderTrack track, int? position) item in toAdd) {
      string query = $"{item.track.Artist} {item.track.Title}".Trim();
      List<ProviderTrack> results =
        await _playlistService.GetSearchResultsAsync(
          provider,
          accountId,
          query);
      if (results.Any()) {
        ProviderTrack found = results.First();
        resolved.Add((found, item.position ?? 0));
      }
    }

    return resolved;
  }

  private async Task ExecuteReplaceAll(OAuthProvider provider, string id, string accountId,
    List<(ProviderTrack track, int position)> tracks) {
    PlaylistUpdateRequest request = new() {
      Id = id,
      Provider = provider,
      ReplaceAll = true,
      AddItems = tracks.OrderBy(t => t.position).Select(t => t.track).ToList()
    };
    await _playlistService.UpdatePlaylistAsync(provider, accountId, request);
  }

  private async Task ExecuteIncrementalUpdate(OAuthProvider provider, string id, string accountId,
    List<ProviderTrack> toRemove, List<(ProviderTrack track, int position)> toAdd) {
    if (toRemove.Any()) {
      await _playlistService.UpdatePlaylistAsync(provider, accountId,
        new PlaylistUpdateRequest {
          Id = id,
          Provider = provider,
          RemoveItems = toRemove.OrderByDescending(t => t.Position).ToList()
        });
    }

    foreach ((ProviderTrack track, int pos) in toAdd.OrderByDescending(x => x.position)) {
      track.Position = pos;
      await _playlistService.UpdatePlaylistAsync(provider, accountId,
        new PlaylistUpdateRequest {
          Id = id, Provider = provider, AddItems = new List<ProviderTrack> { track }
        });
    }
  }
}