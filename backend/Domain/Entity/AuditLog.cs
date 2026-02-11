using System.ComponentModel.DataAnnotations;

using backend.Domain.Enum;

namespace backend.Domain.Entity;

public class AuditLog {
  [Key] public int Id { get; set; }

  public string UserId { get; set; }
  public User user { get; set; }

  [Required] public ExecutorType Executor { get; set; }

  [Required] public AuditType Type { get; set; }

  public string? Description { get; set; }

  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}