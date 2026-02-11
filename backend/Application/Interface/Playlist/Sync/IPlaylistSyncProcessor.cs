using backend.Application.Model.Playlists.Sync;
using backend.Domain.Entity;

namespace backend.Application.Interface.Playlist.Sync;

public interface IPlaylistSyncProcessor {
  Task<SyncResultDto> ProcessSyncGroupAsync(string userId, PlaylistSyncGroup syncGroup,
    bool forceSync);
}