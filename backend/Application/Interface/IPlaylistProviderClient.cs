using backend.Application.Model;
using backend.Domain.Enum;

namespace backend.Application.Interface;

public interface IPlaylistProviderClient {
  OAuthProvider Provider { get; }

  Task<List<ProviderPlaylist>> GetPlaylistsAsync(string accessToken);
  Task<ProviderPlaylist> GetPlaylistAsync(string accessToken, string playlistId);
  Task SavePlaylistAsync(string accessToken, ProviderPlaylist playlist);
}