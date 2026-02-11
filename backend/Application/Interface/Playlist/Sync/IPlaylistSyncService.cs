using backend.Application.Model.Playlists.Requests;
using backend.Application.Model.Playlists.Sync;
using backend.Application.Model.Provider;
using backend.Domain.Enum;

namespace backend.Application.Interface.Playlist.Sync;

public interface IPlaylistSyncService {
  Task<PlaylistSyncGroupDto> CreateSyncGroupAsync(string userId, CreateSyncGroupRequest request);
  Task<PlaylistSyncGroupDto?> GetSyncGroupAsync(string userId, int syncGroupId);
  Task<List<PlaylistSyncGroupDto>> GetSyncGroupsAsync(string userId);

  Task<PlaylistSyncGroupDto> UpdateSyncGroupAsync(string userId, int syncGroupId, string? name,
    bool? syncEnabled);

  Task DeleteSyncGroupAsync(string userId, int syncGroupId);

  Task<PlaylistSyncGroupDto> AddChildPlaylistAsync(string userId, int syncGroupId,
    AddChildPlaylistRequest request);

  Task RemoveChildPlaylistAsync(string userId, int syncGroupId, int childId);
  Task<SyncResultDto> SyncGroupAsync(string userId, int syncGroupId, bool forceSync = false);

  Task<bool> ArePlaylistsIdenticalAsync(OAuthProvider provider, string playlistId,
    string providerAccountId, List<ProviderTrack> masterTracks);
}