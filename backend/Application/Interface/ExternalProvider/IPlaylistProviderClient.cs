using backend.Application.Model.Playlists.Requests;
using backend.Application.Model.Provider;
using backend.Domain.Entity;
using backend.Domain.Enum;

namespace backend.Application.Interface.ExternalProvider;

public interface IPlaylistProviderClient {
  OAuthProvider Provider { get; }
  IReadOnlySet<PlaylistVisibility> SupportedVisibilities { get; }

  Task<List<ProviderPlaylist>> GetPlaylistsAsync(
    string providerId,
    string accessToken);

  Task<List<ProviderTrack>> GetPlaylistTracksAsync(
    string accessToken,
    string playlistId);

  Task<ProviderPlaylist> CreatePlaylistAsync(
    AccountToken accountToken,
    PlaylistCreateRequest request);

  Task UpdatePlaylistAsync(
    string accessToken,
    PlaylistUpdateRequest request);

  Task DeletePlaylistAsync(
    string accessToken,
    string playlistId);

  Task<Dictionary<string, int>> GetVideoDurationsAsync(string accessToken, List<string> videoIds);
}