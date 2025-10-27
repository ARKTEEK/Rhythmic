using System.Net.Http.Headers;
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
    return tracks;
  }


  public Task SavePlaylistAsync(string accessToken, ProviderPlaylist playlist) {
    throw new NotImplementedException();
  }
}