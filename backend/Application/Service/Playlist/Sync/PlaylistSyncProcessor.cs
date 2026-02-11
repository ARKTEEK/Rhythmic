using backend.Application.Interface.Playlist;
using backend.Application.Interface.Playlist.Sync;
using backend.Application.Model.Playlists.Sync;
using backend.Application.Model.Provider;
using backend.Domain.Entity;

namespace backend.Application.Service.Playlist.Sync;

public class PlaylistSyncProcessor : IPlaylistSyncProcessor {
  private readonly IPlaylistComparisonService _comparisonService;
  private readonly IPlaylistService _playlistService;
  private readonly IPlaylistSnapshotService _snapshotService;
  private readonly IPlaylistTrackSynchronizer _synchronizer;

  public PlaylistSyncProcessor(
    IPlaylistService playlistSvc,
    IPlaylistSnapshotService snapshotSvc,
    IPlaylistTrackSynchronizer synchronizer,
    IPlaylistComparisonService comparisonSvc) {
    _playlistService = playlistSvc;
    _snapshotService = snapshotSvc;
    _synchronizer = synchronizer;
    _comparisonService = comparisonSvc;
  }

  public async Task<SyncResultDto> ProcessSyncGroupAsync(
    string userId,
    PlaylistSyncGroup syncGroup,
    bool forceSync) {
    SyncResultDto result = new() {
      SyncGroupId = syncGroup.Id, SyncGroupName = syncGroup.Name, Success = true
    };

    try {
      List<ProviderTrack> masterTracks =
        await _playlistService.GetTracksByPlaylistIdAsync(
          syncGroup.MasterProvider,
          syncGroup.MasterPlaylistId,
          syncGroup.MasterProviderAccountId);

      await _snapshotService.CreateSnapshotIfChangedAsync(userId, syncGroup.MasterProvider,
        syncGroup.MasterPlaylistId, syncGroup.MasterProviderAccountId, masterTracks);

      foreach (PlaylistSyncChild child in syncGroup.Children) {
        await ProcessChildAsync(child, masterTracks, forceSync, result);
      }
    } catch (Exception ex) {
      result.Success = false;
      result.ErrorMessage = ex.Message;
    }

    return result;
  }

  private async Task ProcessChildAsync(
    PlaylistSyncChild child,
    List<ProviderTrack> masterTracks,
    bool forceSync,
    SyncResultDto result) {
    ChildSyncResultDto childRes = new() { ChildPlaylistId = child.ChildPlaylistId };
    try {
      List<ProviderTrack> childTracks =
        await _playlistService.GetTracksByPlaylistIdAsync(
          child.Provider,
          child.ChildPlaylistId,
          child.ProviderAccountId);

      bool isIdentical = _comparisonService.AreIdentical(masterTracks, childTracks);
      if (isIdentical && !forceSync) {
        childRes.Skipped = true;
        result.ChildrenSkipped++;
      } else {
        await _synchronizer.SynchronizeTracksAsync(
          child.Provider,
          child.ChildPlaylistId,
          child.ProviderAccountId,
          masterTracks);

        child.LastSyncedAt = DateTime.UtcNow;
        result.ChildrenSynced++;
        childRes.Success = true;
      }
    } catch (Exception ex) {
      childRes.Success = false;
      result.ChildrenFailed++;
      result.Success = false;
    }

    result.ChildResults.Add(childRes);
  }
}