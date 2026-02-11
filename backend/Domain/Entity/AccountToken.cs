using System.ComponentModel.DataAnnotations;

using backend.Domain.Enum;

namespace backend.Domain.Entity;

public class AccountToken {
  [Key] public string Id { get; set; }

  [Required] public string UserId { get; set; }
  public User User { get; set; }

  [Required] public OAuthProvider Provider { get; set; }

  public string AccessToken { get; set; }
  public string RefreshToken { get; set; }
  public DateTime ExpiresAt { get; set; }

  public string Scope { get; set; }
  public string TokenType { get; set; }

  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
  public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}