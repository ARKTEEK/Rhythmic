using backend.Domain.Entity;
using backend.Domain.Enum;

namespace backend.Domain.Interfaces;

public interface IPlaylistSyncRepository {
  Task<PlaylistSyncGroup> CreateSyncGroupAsync(PlaylistSyncGroup syncGroup);
  Task<PlaylistSyncGroup?> GetSyncGroupByIdAsync(string userId, int syncGroupId);
  Task<List<PlaylistSyncGroup>> GetSyncGroupsByUserIdAsync(string userId);
  Task<PlaylistSyncGroup> UpdateSyncGroupAsync(PlaylistSyncGroup syncGroup);
  Task DeleteSyncGroupAsync(PlaylistSyncGroup syncGroup);

  Task<PlaylistSyncChild> AddChildPlaylistAsync(PlaylistSyncChild child);
  Task RemoveChildPlaylistAsync(PlaylistSyncChild child);

  Task<PlaylistSnapshot?> GetLatestSnapshotAsync(string userId, OAuthProvider provider,
    string playlistId);

  Task<List<ScheduledJob>> GetScheduledJobsForSyncGroupAsync(string userId, int syncGroupId);

  Task SaveChangesAsync();
}