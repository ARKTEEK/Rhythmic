using System.ComponentModel.DataAnnotations;
using backend.Domain.Enum;

namespace backend.Domain.Entity;

public class PlaylistSyncGroup {
  [Key] public int Id { get; set; }

  [Required] public string UserId { get; set; }
  public User User { get; set; }

  [Required] public string Name { get; set; }

  [Required] public string MasterPlaylistId { get; set; }

  [Required] public OAuthProvider MasterProvider { get; set; }

  [Required] public string MasterProviderAccountId { get; set; }

  public bool SyncEnabled { get; set; } = true;

  public DateTime? LastSyncedAt { get; set; }

  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

  public ICollection<PlaylistSyncChild> Children { get; set; } = new List<PlaylistSyncChild>();
}

