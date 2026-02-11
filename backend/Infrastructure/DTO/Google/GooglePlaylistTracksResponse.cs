using System.Text.Json.Serialization;

namespace backend.Infrastructure.DTO.Google;

public class GooglePlaylistTracksResponse {
  [JsonPropertyName("nextPageToken")] public string? NextPageToken { get; set; }

  [JsonPropertyName("items")] public List<GooglePlaylistTrackItem>? Items { get; set; }
}

public class GooglePlaylistTrackItem {
  [JsonPropertyName("id")] public string? Id { get; set; }

  [JsonPropertyName("snippet")] public Snippet? Snippet { get; set; }

  [JsonPropertyName("contentDetails")] public VideoContentDetails? ContentDetails { get; set; }
}

public class VideoContentDetails {
  [JsonPropertyName("videoId")] public string? VideoId { get; set; }

  [JsonPropertyName("videoPublishedAt")] public DateTime? VideoPublishedAt { get; set; }
}

public class YouTubeVideosResponse {
  [JsonPropertyName("items")] public List<YouTubeVideoItem> Items { get; set; } = new();
}

public class YouTubeVideoItem {
  [JsonPropertyName("id")] public string Id { get; set; } = string.Empty;

  [JsonPropertyName("contentDetails")]
  public YouTubeVideoContentDetails? ContentDetails { get; set; }
}

public class YouTubeVideoContentDetails {
  [JsonPropertyName("duration")] public string Duration { get; set; } = string.Empty;
}