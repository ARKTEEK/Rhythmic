using backend.Domain.Enum;

namespace backend.Application.Model;

public class PlaylistUpdateRequest {
  public string Id { get; set; }
  public List<ProviderTrack>? AddItems { get; set; }
  public List<ProviderTrack>? RemoveItems { get; set; }
  public Reorder? Reorder { get; set; }
  public Boolean? ReplaceAll { get; set; }
  public OAuthProvider Provider { get; set; }
}

public class Reorder {
  public int OriginalIndex { get; set; }
  public int NewIndex { get; set; }
  public int Count { get; set; }
}