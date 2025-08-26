using System.ComponentModel.DataAnnotations;
using backend.Enums;

namespace backend.Entity;

public class UserProfile {
  [Key] public Guid Id { get; set; } = Guid.NewGuid();

  [Required] public string UserId { get; set; }
  public User User { get; set; }

  [Required] public OAuthProvider Provider { get; set; }

  public string ProviderUserId { get; set; }
  public string Name { get; set; }
  public string Email { get; set; }
  public string AvatarUrl { get; set; }

  public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}