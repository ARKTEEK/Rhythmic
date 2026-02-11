using backend.Domain.Entity;
using backend.Domain.Enum;

namespace backend.Domain.Interfaces;

public interface IPlaylistSnapshotRepository {
  Task AddAsync(PlaylistSnapshot snapshot);

  Task<PlaylistSnapshot?>
    GetLatestAsync(string userId, OAuthProvider provider, string playlistId);

  Task<PlaylistSnapshot?> GetByIdAsync(int snapshotId);

  Task<List<PlaylistSnapshot>> GetHistoryAsync(string userId, OAuthProvider provider,
    string playlistId);

  Task DeleteAsync(PlaylistSnapshot snapshot);
}