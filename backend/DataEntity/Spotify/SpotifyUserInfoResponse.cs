using System.Text.Json.Serialization;

namespace backend.DataEntity.Spotify;

public class SpotifyUserInfoResponse {
  [JsonPropertyName("id")] public string Id { get; set; }
  [JsonPropertyName("display_name")] public string Name { get; set; }
  [JsonPropertyName("email")] public string Email { get; set; }
  [JsonPropertyName("images")] public List<Image> Images { get; set; }
}

public class Image {
  [JsonPropertyName("url")] public string Url { get; set; }

  [JsonPropertyName("height")] public int? Height { get; set; }

  [JsonPropertyName("width")] public int? Width { get; set; }
}