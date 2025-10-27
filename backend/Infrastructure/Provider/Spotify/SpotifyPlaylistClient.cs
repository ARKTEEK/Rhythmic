using System.Net.Http.Headers;
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

  public async Task<List<ProviderPlaylist>>
    GetPlaylistsAsync(string providerId, string accessToken) {
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

    return SpotifyPlaylistMapper.ToProviderPlaylists(providerId, responsePlaylist);
  }

  public async Task<List<ProviderTrack>> GetPlaylistTracksAsync(string accessToken,
    string playlistId) {
    string firstUrl =
      $"https://api.spotify.com/v1/playlists/{playlistId}/tracks?limit=100&offset=0";
    SpotifyPlaylistTracksResponse firstPage = await FetchTrackPageAsync(accessToken, firstUrl);

    int total = firstPage.Total;
    int limit = 100;
    int pages = (int)Math.Ceiling(total / (double)limit);

    List<SpotifyPlaylistTrackItem> allTrackItems = new(firstPage.Items);

    if (pages <= 1) {
      return SpotifyPlaylistMapper.ToProviderTracks(allTrackItems);
    }

    List<Task<List<SpotifyPlaylistTrackItem>>> tasks = new();
    using var semaphore = new SemaphoreSlim(5);

    for (int i = 1; i < pages; i++) {
      int offset = i * limit;
      string url =
        $"https://api.spotify.com/v1/playlists/{playlistId}/tracks?limit={limit}&offset={offset}";

      tasks.Add(Task.Run(async () => {
        await semaphore.WaitAsync();
        try {
          var page = await FetchTrackPageAsync(accessToken, url);
          return page.Items;
        } finally {
          semaphore.Release();
        }
      }));
    }

    List<SpotifyPlaylistTrackItem>[] results = await Task.WhenAll(tasks);
    foreach (var items in results) {
      allTrackItems.AddRange(items);
    }

    return SpotifyPlaylistMapper.ToProviderTracks(allTrackItems);
  }

  private async Task<SpotifyPlaylistTracksResponse> FetchTrackPageAsync(string accessToken,
    string url) {
    HttpRequestMessage request = new(HttpMethod.Get, url);
    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

    HttpResponseMessage response = await _http.SendAsync(request);
    if (!response.IsSuccessStatusCode) {
      string error = await response.Content.ReadAsStringAsync();
      throw new HttpRequestException(
        $"Spotify track page fetch failed ({response.StatusCode}): {error}");
    }

    string json = await response.Content.ReadAsStringAsync();
    SpotifyPlaylistTracksResponse page =
      JsonSerializer.Deserialize<SpotifyPlaylistTracksResponse>(json)!;
    return page;
  }

  public Task SavePlaylistAsync(string accessToken, ProviderPlaylist playlist) {
    throw new NotImplementedException();
  }
}