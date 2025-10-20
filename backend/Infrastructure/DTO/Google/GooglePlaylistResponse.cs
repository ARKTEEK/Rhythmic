using System.Text.Json.Serialization;

namespace backend.Infrastructure.DTO.Google;

public class YoutubePlaylistsResponse {
  [JsonPropertyName("kind")] public string? Kind { get; set; }
  [JsonPropertyName("etag")] public string? Etag { get; set; }
  [JsonPropertyName("nextPageToken")] public string? NextPageToken { get; set; }
  [JsonPropertyName("items")] public List<PlaylistRootItem>? Items { get; set; }
}

public class PlaylistRootItem {
  [JsonPropertyName("id")] public string? Id { get; set; }
  [JsonPropertyName("snippet")] public Snippet? Snippet { get; set; }
  [JsonPropertyName("contentDetails")] public ContentDetails? ContentDetails { get; set; }
  [JsonPropertyName("status")] public Status? Status { get; set; }
}

public class Snippet {
  [JsonPropertyName("publishedAt")] public DateTime PublishedAt { get; set; }
  [JsonPropertyName("channelId")] public string? ChannelId { get; set; }
  [JsonPropertyName("title")] public string? Title { get; set; }
  [JsonPropertyName("description")] public string? Description { get; set; }
  [JsonPropertyName("thumbnails")] public Thumbnails? Thumbnails { get; set; }
  [JsonPropertyName("channelTitle")] public string? ChannelTitle { get; set; }
}

public class ContentDetails {
  [JsonPropertyName("itemCount")] public int ItemCount { get; set; }
}

public class Status {
  [JsonPropertyName("privacyStatus")] public string? PrivacyStatus { get; set; }
}

public class Thumbnails {
  [JsonPropertyName("default")] public Thumbnail? Default { get; set; }
  [JsonPropertyName("medium")] public Thumbnail? Medium { get; set; }
  [JsonPropertyName("high")] public Thumbnail? High { get; set; }
}

public class Thumbnail {
  [JsonPropertyName("url")] public string? Url { get; set; }
  [JsonPropertyName("width")] public int Width { get; set; }
  [JsonPropertyName("height")] public int Height { get; set; }
}