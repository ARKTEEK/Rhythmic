using System.ComponentModel.DataAnnotations;
using backend.Enums;

namespace backend.Entity;

public class UserConnection {
  [Key] public Guid Id { get; set; } = Guid.NewGuid();

  [Required] public string UserId { get; set; }
  public User User { get; set; }

  [Required] public OAuthProvider Provider { get; set; }
  public string AccessToken { get; set; }
  public string RefreshToken { get; set; }
  public DateTime ExpiresAt { get; set; }
  public string Scope { get; set; }
  public string TokenType { get; set; }

  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}