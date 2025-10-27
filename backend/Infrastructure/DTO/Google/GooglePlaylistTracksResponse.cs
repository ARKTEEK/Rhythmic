using System.Text.Json.Serialization;

namespace backend.Infrastructure.DTO.Google;

public class GooglePlaylistTracksResponse {
  [JsonPropertyName("nextPageToken")] public string? NextPageToken { get; set; }

  [JsonPropertyName("items")] public List<GooglePlaylistTrackItem>? Items { get; set; }
}

public class GooglePlaylistTrackItem {
  [JsonPropertyName("snippet")] public Snippet? Snippet { get; set; }

  [JsonPropertyName("contentDetails")] public VideoContentDetails? ContentDetails { get; set; }
}

public class VideoContentDetails {
  [JsonPropertyName("videoId")] public string? VideoId { get; set; }

  [JsonPropertyName("videoPublishedAt")] public DateTime? VideoPublishedAt { get; set; }
}