using backend.Application.Model;
using backend.Domain.Enum;

namespace backend.Application.Interface;

public interface IPlaylistService {
  public Task<ProviderPlaylist> CreatePlaylistAsync(
    OAuthProvider provider,
    string providerAccountId,
    PlaylistCreateRequest request);

  public Task UpdatePlaylistAsync(
    OAuthProvider provider,
    string providerAccountId,
    PlaylistUpdateRequest request);

  public Task<List<ProviderPlaylist>> GetAllUserPlaylistsAsync(
    string userId);

  public Task<List<ProviderTrack>> GetTracksByPlaylistIdAsync(
    OAuthProvider provider,
    string playlistId,
    string providerAccountId);

  public Task DeletePlaylistAsync(
    OAuthProvider provider,
    string playlistId,
    string providerAccountId);

  public Task<List<ProviderTrack>> GetSearchResultsAsync(
    OAuthProvider provider,
    string providerAccountId,
    string searchQuery);

  public Task FindDuplicateTracksAsync(
    OAuthProvider provider,
    string providerAccountId,
    string playlistId,
    Func<int, ProviderTrack, bool, Task> onProgress,
    CancellationToken ct);

  public Task TransferPlaylistAsync(
    OAuthProvider sourceProvider,
    OAuthProvider destinationProvider,
    string sourceAccountId,
    string destinationAccountId,
    string sourcePlaylistId,
    Func<int, ProviderTrack, bool, Task> onProgress,
    CancellationToken ct);

  public Task<List<ProviderPlaylist>> SplitPlaylistAsync(
    OAuthProvider provider,
    string playlistId,
    string providerAccountId,
    string destinationAccountId,
    PlaylistSplitRequest request);
}
