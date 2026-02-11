using backend.Application.Model.Playlists.Requests;
using backend.Application.Model.Provider;
using backend.Domain.Enum;

namespace backend.Application.Interface.Playlist;

public interface IPlaylistService {
  Task<ProviderPlaylist> CreatePlaylistAsync(
    OAuthProvider provider,
    string providerAccountId,
    PlaylistCreateRequest request);

  Task UpdatePlaylistAsync(
    OAuthProvider provider,
    string providerAccountId,
    PlaylistUpdateRequest request);

  Task<List<ProviderPlaylist>> GetAllUserPlaylistsAsync(
    string userId);

  Task<List<ProviderTrack>> GetTracksByPlaylistIdAsync(
    OAuthProvider provider,
    string playlistId,
    string providerAccountId);

  Task DeletePlaylistAsync(
    OAuthProvider provider,
    string playlistId,
    string providerAccountId);

  Task<List<ProviderTrack>> GetSearchResultsAsync(
    OAuthProvider provider,
    string providerAccountId,
    string searchQuery);

  Task FindDuplicateTracksAsync(
    OAuthProvider provider,
    string providerAccountId,
    string playlistId,
    Func<int, ProviderTrack, bool, Task> onProgress,
    CancellationToken ct);
}