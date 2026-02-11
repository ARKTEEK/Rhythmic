using backend.Domain.Enum;

namespace backend.Application.Model.Playlists.Sync;

public class PlaylistSyncGroupDto {
  public int Id { get; set; }
  public string Name { get; set; } = string.Empty;
  public string MasterPlaylistId { get; set; } = string.Empty;
  public OAuthProvider MasterProvider { get; set; }
  public string MasterProviderAccountId { get; set; } = string.Empty;
  public bool SyncEnabled { get; set; }
  public DateTime? LastSyncedAt { get; set; }
  public DateTime CreatedAt { get; set; }
  public DateTime UpdatedAt { get; set; }
  public List<PlaylistSyncChildDto> Children { get; set; } = new();
}