using System.Net.Http.Headers;

using backend.Application.Interface;
using backend.Application.Model;
using backend.Domain.Entity;
using backend.Domain.Enum;

public class SoundCloudPlaylistClient : IPlaylistProviderClient {
  private readonly HttpClient _http;

  public SoundCloudPlaylistClient(HttpClient http) {
    _http = http;
  }

  public OAuthProvider Provider => OAuthProvider.SoundCloud;

  public IReadOnlySet<PlaylistVisibility> SupportedVisibilities =>
      new HashSet<PlaylistVisibility> { PlaylistVisibility.Public, PlaylistVisibility.Private };

  public async Task<List<ProviderPlaylist>> GetPlaylistsAsync(string providerId, string accessToken) {
    String url = "https://api.soundcloud.com/me/playlists?linked_partitioning=1";

    HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, url);
    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

    HttpResponseMessage response = await _http.SendAsync(request);
    response.EnsureSuccessStatusCode();

    SoundCloudCollectionResponse<SoundCloudPlaylist> data = await response.Content.ReadFromJsonAsync<SoundCloudCollectionResponse<SoundCloudPlaylist>>();

    if (data == null) {
      return new List<ProviderPlaylist>();
    }

    return data.Collection.Select(sc => {
      ProviderPlaylist playlist = SoundCloudPlaylistMapper.ToProviderPlaylist(sc);
      playlist.ProviderId = providerId;
      return playlist;
    }).ToList();
  }

  public async Task<List<ProviderTrack>> GetPlaylistTracksAsync(string accessToken, string playlistId) {
    HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, $"https://api.soundcloud.com/playlists/{playlistId}");
    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

    HttpResponseMessage response = await _http.SendAsync(request);
    response.EnsureSuccessStatusCode();

    SoundCloudPlaylist playlist = await response.Content.ReadFromJsonAsync<SoundCloudPlaylist>();

    if (playlist?.Tracks == null) {
      return new List<ProviderTrack>();
    }

    return playlist.Tracks
        .Select((track, index) => SoundCloudPlaylistMapper.ToProviderTrack(track, playlist.Urn, index))
        .ToList();
  }

  public async Task<ProviderPlaylist> CreatePlaylistAsync(AccountToken accountToken, PlaylistCreateRequest request) {
    SoundCloudPlaylistUpdateRequest createPayload = SoundCloudPlaylistMapper.ToCreateRequest(request);

    HttpRequestMessage httpRequest = new HttpRequestMessage(HttpMethod.Post, "https://api.soundcloud.com/playlists") {
      Headers = {
            Authorization = new AuthenticationHeaderValue("Bearer", accountToken.AccessToken)
        },
      Content = JsonContent.Create(createPayload)
    };

    HttpResponseMessage response = await _http.SendAsync(httpRequest);

    if (!response.IsSuccessStatusCode) {
      String error = await response.Content.ReadAsStringAsync();
      throw new Exception($"SoundCloud Creation Failed: {response.StatusCode} - {error}");
    }

    SoundCloudPlaylist created = await response.Content.ReadFromJsonAsync<SoundCloudPlaylist>();
    return SoundCloudPlaylistMapper.ToProviderPlaylist(created!);
  }

  public async Task UpdatePlaylistAsync(string accessToken, PlaylistUpdateRequest request) {
    HttpRequestMessage getRequest = new HttpRequestMessage(HttpMethod.Get, $"https://api.soundcloud.com/playlists/{request.Id}");
    getRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

    HttpResponseMessage getResponse = await _http.SendAsync(getRequest);
    getResponse.EnsureSuccessStatusCode();

    SoundCloudPlaylist current = await getResponse.Content.ReadFromJsonAsync<SoundCloudPlaylist>();
    if (current == null) {
      throw new Exception("Could not fetch current playlist.");
    }

    List<string> trackUrns = current.Tracks?.Select(t => t.Urn).ToList() ?? new List<string>();

    if (request.ReplaceAll == true) {
      trackUrns = request.AddItems?.Select(t => t.Id).ToList() ?? new();
    } else {
      if (request.RemoveItems != null) {
        HashSet<string> idsToRemove = request.RemoveItems.Select(t => t.Id).ToHashSet();
        trackUrns.RemoveAll(id => idsToRemove.Contains(id));
      }
      if (request.AddItems != null) {
        trackUrns.AddRange(request.AddItems.Select(t => t.Id));
      }
      if (request.Reorder != null) {
        String itemToMove = trackUrns[request.Reorder.OriginalIndex];
        trackUrns.RemoveAt(request.Reorder.OriginalIndex);

        int targetIndex = Math.Clamp(request.Reorder.NewIndex, 0, trackUrns.Count);
        trackUrns.Insert(targetIndex, itemToMove);
      }
    }

    SoundCloudPlaylistUpdateRequest updatePayload = SoundCloudPlaylistMapper.ToUpdateRequest(current, trackUrns);

    HttpRequestMessage httpRequest = new HttpRequestMessage(HttpMethod.Put, $"https://api.soundcloud.com/playlists/{request.Id}");
    httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
    httpRequest.Content = JsonContent.Create(updatePayload);

    HttpResponseMessage response = await _http.SendAsync(httpRequest);

    if (!response.IsSuccessStatusCode) {
      String errorContent = await response.Content.ReadAsStringAsync();
      throw new Exception($"SoundCloud Update Failed: {response.StatusCode} - {errorContent}");
    }
  }

  public async Task DeletePlaylistAsync(string accessToken, string playlistId) {
    HttpRequestMessage httpRequest = new HttpRequestMessage(HttpMethod.Delete, $"https://api.soundcloud.com/playlists/{playlistId}");
    httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

    HttpResponseMessage response = await _http.SendAsync(httpRequest);
    response.EnsureSuccessStatusCode();
  }

  public Task<Dictionary<string, int>> GetVideoDurationsAsync(string accessToken, List<string> videoIds) {
    return Task.FromResult(new Dictionary<string, int>());
  }
}
