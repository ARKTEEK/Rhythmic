using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using backend.Application.Interface;
using backend.Application.Model;
using backend.Domain.Enum;
using backend.Infrastructure.DTO.Google;
using backend.Infrastructure.Mapper.Google;

namespace backend.Infrastructure.Provider.Google;

public class GooglePlaylistClient : IPlaylistProviderClient {
  private readonly HttpClient _http;

  public GooglePlaylistClient(IHttpClientFactory http) {
    _http = http.CreateClient();
  }

  public OAuthProvider Provider => OAuthProvider.Google;

  private static readonly IReadOnlySet<PlaylistVisibility> Visibilities =
    new HashSet<PlaylistVisibility> {
      PlaylistVisibility.Public,
      PlaylistVisibility.Private,
      PlaylistVisibility.Unlisted
    };

  public IReadOnlySet<PlaylistVisibility> SupportedVisibilities => Visibilities;

  public async Task<List<ProviderPlaylist>>
    GetPlaylistsAsync(string providerId, string accessToken) {
    HttpRequestMessage request = new(HttpMethod.Get,
      "https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails,status&mine=true");
    request.Headers.Add("Authorization", $"Bearer {accessToken}");

    HttpResponseMessage response = await _http.SendAsync(request);

    if (!response.IsSuccessStatusCode) {
      string content = await response.Content.ReadAsStringAsync();
      throw new HttpRequestException($"YouTube API failed ({response.StatusCode}): {content}");
    }

    response.EnsureSuccessStatusCode();

    string json = await response.Content.ReadAsStringAsync();

    YoutubePlaylistsResponse responsePlaylist =
      JsonSerializer.Deserialize<YoutubePlaylistsResponse>(json)!;

    return GooglePlaylistMapper.ToProviderPlaylists(providerId, responsePlaylist);
  }

  public async Task<List<ProviderTrack>> GetPlaylistTracksAsync(string accessToken,
    string playlistId) {
    List<ProviderTrack> tracks = new();
    string? nextPageToken = null;

    do {
      string url =
        $"https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId={playlistId}&maxResults=50";
      if (!string.IsNullOrEmpty(nextPageToken)) {
        url += $"&pageToken={nextPageToken}";
      }

      HttpRequestMessage request = new(HttpMethod.Get, url);
      request.Headers.Add("Authorization", $"Bearer {accessToken}");

      HttpResponseMessage response = await _http.SendAsync(request);

      if (!response.IsSuccessStatusCode) {
        string content = await response.Content.ReadAsStringAsync();
        throw new HttpRequestException($"YouTube API failed ({response.StatusCode}): {content}");
      }

      string json = await response.Content.ReadAsStringAsync();
      GooglePlaylistTracksResponse playlistResponse =
        JsonSerializer.Deserialize<GooglePlaylistTracksResponse>(json)!;

      tracks.AddRange(GooglePlaylistMapper.ToProviderTracks(playlistResponse));

      nextPageToken = playlistResponse.NextPageToken;
    } while (!string.IsNullOrEmpty(nextPageToken));

    return tracks;
  }

  public Task<ProviderPlaylist> CreatePlaylistAsync(string accessToken,
    PlaylistCreateRequest request) {
    throw new NotImplementedException();
  }

  public async Task UpdatePlaylistAsync(string accessToken, PlaylistUpdateRequest request) {
    _http.DefaultRequestHeaders.Authorization =
      new AuthenticationHeaderValue("Bearer", accessToken);

    if (request.AddItems != null && request.AddItems.Any()) {
      List<string> uris = request.AddItems.Select(GooglePlaylistMapper.ToYouTubeUri).ToList();

      for (int i = 0; i < uris.Count; i += 1) {
        string chunk = uris.Skip(i).Take(1).First();
        await AddTracksAsync(request.Id, chunk);
      }
    }
  }

  private async Task AddTracksAsync(string playlistId, string videoId,
    string onBehalfOfContentOwner = "") {
    string url = "https://www.googleapis.com/youtube/v3/playlistItems";

    Dictionary<string, string> query = new() {
      { "part", "snippet" }
    };

    if (!string.IsNullOrEmpty(onBehalfOfContentOwner)) {
      query.Add("onBehalfOfContentOwner", onBehalfOfContentOwner);
    }

    UriBuilder uriBuilder = new(url) {
      Query = string.Join("&", query.Select(kvp => $"{kvp.Key}={Uri.EscapeDataString(kvp.Value)}"))
    };

    var body = GooglePlaylistMapper.CreatePlaylistItemInsertBody(playlistId, videoId);

    HttpRequestMessage request = new(HttpMethod.Post, uriBuilder.Uri) {
      Content = new StringContent(
        JsonSerializer.Serialize(body),
        Encoding.UTF8,
        "application/json")
    };

    HttpResponseMessage res = await _http.SendAsync(request);
    if (!res.IsSuccessStatusCode) {
      string err = await res.Content.ReadAsStringAsync();
      throw new HttpRequestException($"YouTube API failed ({res.StatusCode}): {err}");
    }
  }

  public async Task DeletePlaylistAsync(string accessToken, string playlistId) {
    string url = $"https://www.googleapis.com/youtube/v3/playlists?id={playlistId}";
    HttpRequestMessage req = new(HttpMethod.Delete, url);
    req.Headers.Add("Authorization", $"Bearer {accessToken}");

    HttpResponseMessage res = await _http.SendAsync(req);
    if (!res.IsSuccessStatusCode) {
      string msg = await res.Content.ReadAsStringAsync();
      throw new HttpRequestException($"YouTube delete failed ({res.StatusCode}): {msg}");
    }
  }
}