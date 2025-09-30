using System.ComponentModel.DataAnnotations;
using backend.Domain.Enum;

namespace backend.Domain.Entity;

public class AccountProfile {
  [Key] public Guid Id { get; set; } = Guid.NewGuid();

  [Required] public string UserId { get; set; }
  public User User { get; set; }

  [Required] public OAuthProvider Provider { get; set; }

  public string Displayname { get; set; }
  public string Email { get; set; }

  public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}