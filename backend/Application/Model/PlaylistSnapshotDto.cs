using backend.Domain.Enum;

namespace backend.Application.Model;

public class PlaylistSnapshotDto {
  public int Id { get; set; }
  public OAuthProvider Provider { get; set; }
  public string PlaylistId { get; set; } = string.Empty;
  public DateTime CreatedAt { get; set; }
  public int TrackCount { get; set; }
}

