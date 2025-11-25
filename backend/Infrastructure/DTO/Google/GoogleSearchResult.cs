using System.Text.Json.Serialization;

namespace backend.Infrastructure.DTO.Google;

public class YouTubeSearchResult {
  [JsonPropertyName("items")] public List<YouTubeSearchItem> Items { get; set; } = new();
}

public class YouTubeSearchItem {
  [JsonPropertyName("id")] public YouTubeVideoId Id { get; set; } = new();

  [JsonPropertyName("snippet")] public YouTubeSnippet Snippet { get; set; } = new();
}

public class YouTubeVideoId {
  [JsonPropertyName("videoId")] public string VideoId { get; set; } = string.Empty;
}

public class YouTubeSnippet {
  [JsonPropertyName("title")] public string Title { get; set; } = string.Empty;

  [JsonPropertyName("channelTitle")] public string ChannelTitle { get; set; } = string.Empty;

  [JsonPropertyName("thumbnails")] public YouTubeThumbnails Thumbnails { get; set; } = new();
}

public class YouTubeThumbnails {
  [JsonPropertyName("default")] public YouTubeThumbnail Default { get; set; } = new();
}

public class YouTubeThumbnail {
  [JsonPropertyName("url")] public string Url { get; set; } = string.Empty;
}