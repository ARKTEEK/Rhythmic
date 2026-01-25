using System.Text.Json.Serialization;

public class SoundCloudPlaylistUpdateRequest {
  [JsonPropertyName("playlist")]
  public SoundCloudPlaylistUpdateData Playlist { get; set; } = new();
}

public class SoundCloudPlaylistUpdateData {
  [JsonPropertyName("title")]
  public string? Title { get; set; }

  [JsonPropertyName("description")]
  public string? Description { get; set; }

  [JsonPropertyName("sharing")]
  public string? Sharing { get; set; }

  [JsonPropertyName("tracks")]
  public List<SoundCloudTrackUrn> Tracks { get; set; } = new();
}

public class SoundCloudTrackUrn {
  [JsonPropertyName("urn")]
  public string Urn { get; set; } = string.Empty;
}
