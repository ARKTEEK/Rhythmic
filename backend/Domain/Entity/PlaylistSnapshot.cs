using System.ComponentModel.DataAnnotations;

using backend.Domain.Enum;

namespace backend.Domain.Entity;

public class PlaylistSnapshot {
  [Key] public int Id { get; set; }

  [Required] public string UserId { get; set; }
  public User User { get; set; }

  [Required] public OAuthProvider Provider { get; set; }

  [Required] public string PlaylistId { get; set; }

  [Required] public string ProviderAccountId { get; set; }

  [Required] public string TracksJson { get; set; } = string.Empty;

  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}