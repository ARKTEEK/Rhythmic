using System.ComponentModel.DataAnnotations;
using backend.Domain.Enum;

namespace backend.Domain.Entity;

public class PlaylistSyncChild {
  [Key] public int Id { get; set; }

  [Required] public int SyncGroupId { get; set; }
  public PlaylistSyncGroup SyncGroup { get; set; }

  [Required] public string ChildPlaylistId { get; set; }

  [Required] public OAuthProvider Provider { get; set; }

  [Required] public string ProviderAccountId { get; set; }

  public DateTime? LastSyncedAt { get; set; }
}

