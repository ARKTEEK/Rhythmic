using backend.Application.Model;
using backend.Domain.Enum;

namespace backend.Application.Interface;

public interface IPlaylistProviderClient {
  public OAuthProvider Provider { get; }
  public IReadOnlySet<PlaylistVisibility> SupportedVisibilities { get; }

  public Task<List<ProviderPlaylist>> GetPlaylistsAsync(
    string providerId,
    string accessToken);

  public Task<List<ProviderTrack>> GetPlaylistTracksAsync(
    string accessToken,
    string playlistId);

  public Task<ProviderPlaylist> CreatePlaylistAsync(
    string accessToken,
    PlaylistCreateRequest request);

  public Task DeletePlaylistAsync(
    string accessToken,
    string playlistId);
}