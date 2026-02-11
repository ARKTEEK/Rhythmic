using System.Text.Json.Serialization;

namespace backend.Infrastructure.DTO.Spotify;

public class SpotifySearchResult {
  [JsonPropertyName("tracks")] public TrackCollection Tracks { get; set; } = new();
}

public class TrackCollection {
  [JsonPropertyName("items")] public List<TrackItem> Items { get; set; } = new();
}

public class TrackItem {
  [JsonPropertyName("id")] public string Id { get; set; } = string.Empty;

  [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;

  [JsonPropertyName("artists")] public List<Artist> Artists { get; set; } = new();

  [JsonPropertyName("album")] public Album Album { get; set; } = new();

  [JsonPropertyName("duration_ms")] public int DurationMs { get; set; }
}

public class Artist {
  [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;
}

public class Album {
  [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;

  [JsonPropertyName("images")] public List<AlbumImage> Images { get; set; } = new();
}

public class AlbumImage {
  [JsonPropertyName("url")] public string Url { get; set; } = string.Empty;

  [JsonPropertyName("height")] public int Height { get; set; }

  [JsonPropertyName("width")] public int Width { get; set; }
}