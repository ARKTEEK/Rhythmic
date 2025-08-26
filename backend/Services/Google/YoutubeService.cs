using System.Text.Json;
using backend.DataEntity;

namespace backend.Services;

public class YoutubeService : IYoutubeService {
  private readonly IHttpClientFactory _clientFactory;

  public YoutubeService(IHttpClientFactory clientFactory) {
    _clientFactory = clientFactory;
  }

  public async Task<List<YoutubePlaylist>> GetPlaylistsAsync(string accessToken) {
    HttpClient client = _clientFactory.CreateClient();
    client.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");

    string requestUri =
      "https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails,status&mine=true";

    HttpResponseMessage response = await client.GetAsync(requestUri);

    if (!response.IsSuccessStatusCode) {
      string message = await response.Content.ReadAsStringAsync();
      throw new HttpRequestException(
        $"Failed to get playlists from YouTube API. Status: {response.StatusCode}. Content: {message}");
    }

    string json = await response.Content.ReadAsStringAsync();

    YoutubePlaylistsResponse playlistsResponse =
      JsonSerializer.Deserialize<YoutubePlaylistsResponse>(json);

    if (playlistsResponse?.Items == null) {
      return new List<YoutubePlaylist>();
    }

    return playlistsResponse.Items.Select(item => new YoutubePlaylist {
      Id = item.Id,
      Title = item.Snippet?.Title,
      Description = item.Snippet?.Description,
      ItemCount = item.ContentDetails.ItemCount,
      PrivacyStatus = item.Status?.PrivacyStatus,
      CoverImageUrl = item.Snippet.Thumbnails?.High?.Url
    }).ToList();
  }
}