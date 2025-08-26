using System.Text.Json.Serialization;

namespace backend.DataEntity;

public class GoogleUserInfoResponse {
  [JsonPropertyName("id")] public string Id { get; set; }

  [JsonPropertyName("name")] public string Name { get; set; }

  [JsonPropertyName("given_name")] public string GivenName { get; set; }

  [JsonPropertyName("picture")] public string Picture { get; set; }
}