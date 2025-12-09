using System.Net.Http.Headers;
using System.Text;
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

  private static readonly IReadOnlySet<PlaylistVisibility> Visibilities =
    new HashSet<PlaylistVisibility> {
      PlaylistVisibility.Public,
      PlaylistVisibility.Private,
    };

  public IReadOnlySet<PlaylistVisibility> SupportedVisibilities => Visibilities;


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

  public Task<ProviderPlaylist> CreatePlaylistAsync(string accessToken,
    PlaylistCreateRequest request) {
    throw new NotImplementedException();
  }

  public async Task UpdatePlaylistAsync(string accessToken, PlaylistUpdateRequest request) {
    _http.DefaultRequestHeaders.Authorization =
        new AuthenticationHeaderValue("Bearer", accessToken);

    if (request.AddItems?.Any() == true) {
      List<string> uris = request.AddItems
          .Select(SpotifyPlaylistMapper.ToSpotifyUri)
          .ToList();

      for (int i = 0; i < uris.Count; i += 100) {
        List<string> chunk = uris.Skip(i).Take(100).ToList();
        await AddTracksAsync(request.Id, chunk);
      }
    }

    if (request.RemoveItems?.Any() == true) {
      object removeBody = SpotifyPlaylistMapper.ToSpotifyDeleteBody(request.RemoveItems);
      await DeleteTracksAsync(request.Id, removeBody);
    }
  }


  private async Task AddTracksAsync(string playlistId, List<string> uris) {
    string url = $"https://api.spotify.com/v1/playlists/{Uri.EscapeDataString(playlistId)}/tracks";
    var body = new { uris };
    HttpRequestMessage req = new(HttpMethod.Post, url) {
      Content = new StringContent(
        JsonSerializer.Serialize(body),
        Encoding.UTF8,
        "application/json"
      )
    };

    HttpResponseMessage res = await _http.SendAsync(req);
    if (!res.IsSuccessStatusCode) {
      string err = await res.Content.ReadAsStringAsync();
      throw new HttpRequestException($"Spotify AddTracks failed ({res.StatusCode}): {err}");
    }
  }

  private async Task DeleteTracksAsync(string playlistId, object removeBody) {
    string url = $"https://api.spotify.com/v1/playlists/{Uri.EscapeDataString(playlistId)}/tracks";
    HttpRequestMessage req = new(HttpMethod.Delete, url) {
      Content = new StringContent(
        JsonSerializer.Serialize(removeBody),
        Encoding.UTF8,
        "application/json"
      )
    };

    HttpResponseMessage res = await _http.SendAsync(req);
    if (!res.IsSuccessStatusCode) {
      string err = await res.Content.ReadAsStringAsync();
      throw new HttpRequestException($"Spotify DeleteTracks failed ({res.StatusCode}): {err}");
    }
  }

  public async Task DeletePlaylistAsync(string accessToken, string playlistId) {
    string url = $"https://api.spotify.com/v1/playlists/{playlistId}/followers";
    HttpRequestMessage req = new(HttpMethod.Delete, url);
    req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

    HttpResponseMessage res = await _http.SendAsync(req);
    if (!res.IsSuccessStatusCode) {
      string msg = await res.Content.ReadAsStringAsync();
      throw new HttpRequestException($"Spotify playlist delete failed ({res.StatusCode}): {msg}");
    }
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
}
