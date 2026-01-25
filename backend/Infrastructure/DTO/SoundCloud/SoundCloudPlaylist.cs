using System.Text.Json.Serialization;

public class SoundCloudPlaylist {
  [JsonPropertyName("urn")]
  public string Urn { get; set; } = string.Empty;

  [JsonPropertyName("title")]
  public string Title { get; set; } = string.Empty;

  [JsonPropertyName("description")]
  public string? Description { get; set; }

  [JsonPropertyName("sharing")]
  public string Sharing { get; set; } = "public";

  [JsonPropertyName("track_count")]
  public int TrackCount { get; set; }

  [JsonPropertyName("created_at")]
  [JsonConverter(typeof(SoundCloudDateTimeConverter))]
  public DateTime CreatedAt { get; set; }

  [JsonPropertyName("artwork_url")]
  public string? ArtworkUrl { get; set; }

  [JsonPropertyName("user")]
  public SoundCloudUserResponse? User { get; set; }

  [JsonPropertyName("tracks")]
  public List<SoundCloudTrack> Tracks { get; set; } = new();
}

public class SoundCloudTrack {
  [JsonPropertyName("urn")]
  public string Urn { get; set; } = string.Empty;

  [JsonPropertyName("title")]
  public string Title { get; set; } = string.Empty;

  [JsonPropertyName("duration")]
  public int Duration { get; set; }

  [JsonPropertyName("permalink_url")]
  public string PermalinkUrl { get; set; } = string.Empty;

  [JsonPropertyName("artwork_url")]
  public string? ArtworkUrl { get; set; }

  [JsonPropertyName("user")]
  public SoundCloudUserResponse? User { get; set; }
}

public class SoundCloudCollectionResponse<T> {
  [JsonPropertyName("collection")]
  public List<T> Collection { get; set; } = new();

  [JsonPropertyName("next_href")]
  public string? NextHref { get; set; }
}
