using backend.Application.Model;
using backend.Domain.Enum;

namespace backend.Application.Interface;

public interface IPlaylistSnapshotService {
  Task CreateSnapshotAsync(
    string userId,
    OAuthProvider provider,
    string playlistId,
    string providerAccountId,
    List<ProviderTrack> tracks);

  Task CreateSnapshotIfChangedAsync(
    string userId,
    OAuthProvider provider,
    string playlistId,
    string providerAccountId,
    List<ProviderTrack> tracks);

  Task<List<PlaylistSnapshotDto>> GetSnapshotHistoryAsync(
    string userId,
    OAuthProvider provider,
    string playlistId);

  Task<PlaylistSnapshotDto?> GetSnapshotAsync(int snapshotId);

  Task<PlaylistSnapshotComparisonDto> CompareSnapshotAsync(
    string userId,
    OAuthProvider provider,
    string playlistId,
    string providerAccountId,
    int snapshotId);

  Task RevertToSnapshotAsync(
    OAuthProvider provider,
    string playlistId,
    string providerAccountId,
    int snapshotId);

  Task DeleteSnapshotAsync(string userId, int snapshotId);
}

