
namespace backend.Infrastructure.DTO;

using System.Collections.Generic;
using System.Text.Json.Serialization;

public class SpotifyPlaylistsResponse {
  [JsonPropertyName("items")] public List<SpotifyPlaylistItem> Items { get; set; } = [];
}

public class SpotifyPlaylistItem {
  [JsonPropertyName("id")] public string Id { get; set; }

  [JsonPropertyName("name")] public string Name { get; set; }

  [JsonPropertyName("description")] public string Description { get; set; }

  [JsonPropertyName("owner")] public SpotifyPlaylistOwner Owner { get; set; }

  [JsonPropertyName("tracks")] public SpotifyPlaylistTracks Tracks { get; set; }

  [JsonPropertyName("images")] public List<SpotifyImage> Images { get; set; }

  [JsonPropertyName("public")] public bool? Public { get; set; }

  [JsonPropertyName("snapshot_id")] public string SnapshotId { get; set; }

  [JsonPropertyName("href")] public string Href { get; set; }
}

public class SpotifyPlaylistOwner {
  [JsonPropertyName("id")] public string Id { get; set; }

  [JsonPropertyName("display_name")] public string DisplayName { get; set; }
}

public class SpotifyPlaylistTracks {
  [JsonPropertyName("total")] public int Total { get; set; }
}

public class SpotifyImage {
  [JsonPropertyName("url")] public string Url { get; set; }

  [JsonPropertyName("height")] public int? Height { get; set; }

  [JsonPropertyName("width")] public int? Width { get; set; }
}