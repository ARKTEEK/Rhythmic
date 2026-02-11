using System.Text.Json.Serialization;

namespace backend.Infrastructure.DTO.SoundCloud;

public class SoundCloudUserResponse {
  [JsonPropertyName("urn")] public string Urn { get; set; } = string.Empty;

  [JsonPropertyName("username")] public string Username { get; set; } = string.Empty;

  [JsonPropertyName("avatar_url")] public string? AvatarUrl { get; set; }

  [JsonPropertyName("full_name")] public string? FullName { get; set; }
}