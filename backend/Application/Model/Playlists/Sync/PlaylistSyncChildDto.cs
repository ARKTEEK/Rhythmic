using backend.Domain.Enum;

namespace backend.Application.Model.Playlists.Sync;

public class PlaylistSyncChildDto {
  public int Id { get; set; }
  public string ChildPlaylistId { get; set; } = string.Empty;
  public OAuthProvider Provider { get; set; }
  public string ProviderAccountId { get; set; } = string.Empty;
  public DateTime? LastSyncedAt { get; set; }
}