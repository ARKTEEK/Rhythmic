using System.Text.Json;
using backend.Application.Interface;
using backend.Application.Model;
using backend.Domain.Enum;
using backend.Infrastructure.DTO.Spotify;
using backend.Infrastructure.Mapper.Spotify;

namespace backend.Infrastructure.Provider.Spotify;

public class SpotifyPlaylistClient : IPlaylistProviderClient {
  private readonly HttpClient _http;

  public SpotifyPlaylistClient(IHttpClientFactory http) {
    _http = http.CreateClient();
  }

  public OAuthProvider Provider => OAuthProvider.Spotify;

  public async Task<List<ProviderPlaylist>> GetPlaylistsAsync(string accessToken) {
    HttpRequestMessage request = new(HttpMethod.Get,
      "https://api.spotify.com/v1/me/playlists?limit=50");
    request.Headers.Add("Authorization", $"Bearer {accessToken}");

    HttpResponseMessage response = await _http.SendAsync(request);

    if (!response.IsSuccessStatusCode) {
      string content = await response.Content.ReadAsStringAsync();
      throw new HttpRequestException($"Spotify API failed ({response.StatusCode}): {content}");
    }

    string json = await response.Content.ReadAsStringAsync();

    SpotifyPlaylistsResponse responsePlaylist =
      JsonSerializer.Deserialize<SpotifyPlaylistsResponse>(json)!;

    return SpotifyPlaylistMapper.ToProviderPlaylists(responsePlaylist);
  }

  public Task<ProviderPlaylist> GetPlaylistAsync(string accessToken, string playlistId) {
    throw new NotImplementedException();
  }

  public Task SavePlaylistAsync(string accessToken, ProviderPlaylist playlist) {
    throw new NotImplementedException();
  }
}