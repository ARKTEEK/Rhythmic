using System.Text.Json.Serialization;

namespace backend.Infrastructure.DTO.Spotify;

public class SpotifyPlaylistTracksResponse {
  [JsonPropertyName("items")] public List<SpotifyPlaylistTrackItem> Items { get; set; }

  [JsonPropertyName("next")] public string? Next { get; set; }

  [JsonPropertyName("total")] public int Total { get; set; }

  [JsonPropertyName("limit")] public int Limit { get; set; }
}

public class SpotifyPlaylistTrackItem {
  [JsonPropertyName("track")] public SpotifyTrack Track { get; set; }
}

public class SpotifyTrack {
  [JsonPropertyName("id")] public string Id { get; set; }

  [JsonPropertyName("name")] public string Name { get; set; }

  [JsonPropertyName("duration_ms")] public int DurationMs { get; set; }

  [JsonPropertyName("artists")] public List<SpotifyArtist> Artists { get; set; }

  [JsonPropertyName("album")] public SpotifyAlbum Album { get; set; }
}

public class SpotifyArtist {
  [JsonPropertyName("name")] public string Name { get; set; }
}

public class SpotifyAlbum {
  [JsonPropertyName("name")] public string Name { get; set; }

  [JsonPropertyName("images")] public List<SpotifyImage> Images { get; set; }
}