using System.Text.Json.Serialization;

namespace backend.Infrastructure.DTO;

public class GoogleUserInfoResponse {
  [JsonPropertyName("sub")] public string Id { get; set; } = default!;

  [JsonPropertyName("email")] public string Email { get; set; } = default!;

  [JsonPropertyName("name")] public string Name { get; set; } = default!;

  [JsonPropertyName("given_name")] public string GivenName { get; set; } = default!;

  [JsonPropertyName("picture")] public string Picture { get; set; } = default!;
}