using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

using backend.Application.Interface.ExternalProvider;
using backend.Application.Model.Playlists.Requests;
using backend.Application.Model.Provider;
using backend.Domain.Entity;
using backend.Domain.Enum;
using backend.Infrastructure.DTO.Spotify;
using backend.Infrastructure.Mapper.Spotify;

namespace backend.Infrastructure.Provider.Spotify;

public class SpotifyPlaylistClient : IPlaylistProviderClient {
  private static readonly IReadOnlySet<PlaylistVisibility> Visibilities =
    new HashSet<PlaylistVisibility> { PlaylistVisibility.Public, PlaylistVisibility.Private };

  private readonly HttpClient _http;

  public SpotifyPlaylistClient(IHttpClientFactory http) {
    _http = http.CreateClient();
  }

  public OAuthProvider Provider => OAuthProvider.Spotify;

  public IReadOnlySet<PlaylistVisibility> SupportedVisibilities => Visibilities;


  public async Task<List<ProviderPlaylist>>
    GetPlaylistsAsync(string providerId, string accessToken) {
    HttpRequestMessage request = new(HttpMethod.Get,
      "https://api.spotify.com/v1/me/playlists?limit=50");
    request.Headers.Add("Authorization", $"Bearer {accessToken}");

    HttpResponseMessage response = await _http.SendAsync(request);

    if (!response.IsSuccessStatusCode) {
      string content = await response.Content.ReadAsStringAsync();
      throw new HttpRequestException(
        $"Spotify API failed ({response.StatusCode}): {content}");
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
    using SemaphoreSlim semaphore = new(5);

    for (int i = 1; i < pages; i++) {
      int offset = i * limit;
      string url =
        $"https://api.spotify.com/v1/playlists/{playlistId}/tracks?limit={limit}&offset={offset}";

      tasks.Add(Task.Run(async () => {
        await semaphore.WaitAsync();
        try {
          SpotifyPlaylistTracksResponse
            page = await FetchTrackPageAsync(accessToken, url);
          return page.Items;
        } finally {
          semaphore.Release();
        }
      }));
    }

    List<SpotifyPlaylistTrackItem>[] results = await Task.WhenAll(tasks);
    foreach (List<SpotifyPlaylistTrackItem> items in results) {
      allTrackItems.AddRange(items);
    }

    return SpotifyPlaylistMapper.ToProviderTracks(allTrackItems);
  }

  public async Task<ProviderPlaylist> CreatePlaylistAsync(
    AccountToken accountToken,
    PlaylistCreateRequest request
  ) {
    string userId = accountToken.Id;

    var createBody = new {
      name = request.Title,
      description = request.Description,
      @public = request.Visibility == PlaylistVisibility.Public
    };

    HttpRequestMessage createReq = new(
      HttpMethod.Post,
      $"https://api.spotify.com/v1/users/{Uri.EscapeDataString(userId)}/playlists"
    ) {
      Content = new StringContent(
        JsonSerializer.Serialize(createBody),
        Encoding.UTF8,
        "application/json"
      )
    };

    createReq.Headers.Authorization =
      new AuthenticationHeaderValue("Bearer", accountToken.AccessToken);

    HttpResponseMessage createRes = await _http.SendAsync(createReq);
    if (!createRes.IsSuccessStatusCode) {
      string err = await createRes.Content.ReadAsStringAsync();
      throw new HttpRequestException(
        $"Spotify CreatePlaylist failed ({createRes.StatusCode}): {err}");
    }

    string json = await createRes.Content.ReadAsStringAsync();
    SpotifyCreatePlaylistResponse created =
      JsonSerializer.Deserialize<SpotifyCreatePlaylistResponse>(json)!;

    return new ProviderPlaylist {
      Id = created.id,
      Title = created.name,
      Provider = OAuthProvider.Spotify,
      ItemCount = request.TrackIds?.Count ?? 0
    };
  }

  public async Task UpdatePlaylistAsync(string accessToken, PlaylistUpdateRequest request) {
    _http.DefaultRequestHeaders.Authorization =
      new AuthenticationHeaderValue("Bearer", accessToken);

    if (request.ReplaceAll == true && request.AddItems?.Any() == true) {
      List<string> uris = request.AddItems
        .OrderBy(t => t.Position ?? 0)
        .Select(SpotifyPlaylistMapper.ToSpotifyUri)
        .ToList();

      await ReplaceAllTracksAsync(request.Id, uris);
      return;
    }

    if (request.AddItems?.Any() == true) {
      List<string> uris = request.AddItems
        .Select(SpotifyPlaylistMapper.ToSpotifyUri)
        .ToList();

      // Add tracks in batches of 100
      // For new playlists, we don't need positions - tracks are added in order
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

  public async Task DeletePlaylistAsync(string accessToken, string playlistId) {
    string url = $"https://api.spotify.com/v1/playlists/{playlistId}/followers";
    HttpRequestMessage req = new(HttpMethod.Delete, url);
    req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

    HttpResponseMessage res = await _http.SendAsync(req);
    if (!res.IsSuccessStatusCode) {
      string msg = await res.Content.ReadAsStringAsync();
      throw new HttpRequestException(
        $"Spotify playlist delete failed ({res.StatusCode}): {msg}");
    }
  }

  public Task<Dictionary<string, int>> GetVideoDurationsAsync(string accessToken,
    List<string> videoIds) {
    throw new NotImplementedException();
  }

  private async Task ReplaceAllTracksAsync(string playlistId, List<string> uris) {
    string url =
      $"https://api.spotify.com/v1/playlists/{Uri.EscapeDataString(playlistId)}/tracks";

    if (uris.Count <= 100) {
      var body = new { uris };
      HttpRequestMessage req = new(HttpMethod.Put, url) {
        Content = new StringContent(
          JsonSerializer.Serialize(body),
          Encoding.UTF8,
          "application/json"
        )
      };

      HttpResponseMessage res = await _http.SendAsync(req);
      if (!res.IsSuccessStatusCode) {
        string err = await res.Content.ReadAsStringAsync();
        throw new HttpRequestException(
          $"Spotify ReplaceAllTracks failed ({res.StatusCode}): {err}");
      }
    } else {
      List<string> firstBatch = uris.Take(100).ToList();
      var putBody = new { uris = firstBatch };
      HttpRequestMessage putReq = new(HttpMethod.Put, url) {
        Content = new StringContent(
          JsonSerializer.Serialize(putBody),
          Encoding.UTF8,
          "application/json"
        )
      };

      HttpResponseMessage putRes = await _http.SendAsync(putReq);
      if (!putRes.IsSuccessStatusCode) {
        string err = await putRes.Content.ReadAsStringAsync();
        throw new HttpRequestException(
          $"Spotify ReplaceAllTracks failed ({putRes.StatusCode}): {err}");
      }

      for (int i = 100; i < uris.Count; i += 100) {
        List<string> chunk = uris.Skip(i).Take(100).ToList();
        await AddTracksAsync(playlistId, chunk);
      }
    }
  }

  private async Task AddTracksAsync(string playlistId, List<string> uris, int? position = null) {
    string url =
      $"https://api.spotify.com/v1/playlists/{Uri.EscapeDataString(playlistId)}/tracks";

    object body = position.HasValue
      ? new { uris, position = position.Value }
      : new { uris };

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
    string url =
      $"https://api.spotify.com/v1/playlists/{Uri.EscapeDataString(playlistId)}/tracks";
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
      throw new HttpRequestException(
        $"Spotify DeleteTracks failed ({res.StatusCode}): {err}");
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