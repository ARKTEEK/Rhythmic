using System.Text.Json;

using backend.Application.Model.Provider;

namespace backend.Application.Serializer;

public static class PlaylistSnapshotSerializer {
  private static readonly JsonSerializerOptions JsonOptions = new() {
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
  };

  public static string SerializeTracks(List<ProviderTrack> tracks) {
    return JsonSerializer.Serialize(tracks, JsonOptions);
  }

  public static List<ProviderTrack> DeserializeTracks(string tracksJson) {
    return JsonSerializer.Deserialize<List<ProviderTrack>>(tracksJson, JsonOptions)
           ?? new List<ProviderTrack>();
  }
}