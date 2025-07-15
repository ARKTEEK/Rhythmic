using System.Text.Json.Serialization;

namespace backend.DataEntity;

public class YoutubePlaylistsResponse {
  [JsonPropertyName("items")] public List<PlaylistRootItem>? Items { get; set; }
}

public class PlaylistRootItem {
  [JsonPropertyName("id")] public string? Id { get; set; }

  [JsonPropertyName("snippet")] public Snippet? Snippet { get; set; }

  [JsonPropertyName("contentDetails")] public ContentDetails? ContentDetails { get; set; }

  [JsonPropertyName("status")] public Status? Status { get; set; }
}

public class Snippet {
  [JsonPropertyName("title")] public string? Title { get; set; }

  [JsonPropertyName("description")] public string? Description { get; set; }

  [JsonPropertyName("thumbnails")] public Thumbnails? Thumbnails { get; set; }
}

public class ContentDetails {
  [JsonPropertyName("itemCount")] public int ItemCount { get; set; }
}

public class Status {
  [JsonPropertyName("privacyStatus")] public string? PrivacyStatus { get; set; }
}

public class Thumbnails {
  [JsonPropertyName("high")] public Thumbnail? High { get; set; }

  [JsonPropertyName("default")] public Thumbnail? Default { get; set; }
}

public class Thumbnail {
  [JsonPropertyName("url")] public string? Url { get; set; }

  [JsonPropertyName("width")] public int Width { get; set; }

  [JsonPropertyName("height")] public int Height { get; set; }
}

public class YoutubePlaylist {
  public string? Id { get; set; }
  public string? Title { get; set; }
  public string? Description { get; set; }
  public string? CoverImageUrl { get; set; }
  public int ItemCount { get; set; }
  public string? PrivacyStatus { get; set; }
}