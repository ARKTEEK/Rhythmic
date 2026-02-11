using backend.Domain.Enum;

namespace backend.Application.Model.Audit;

public class AuditLogDto {
  public int Id { get; set; }
  public ExecutorType Executor { get; set; }
  public AuditType Type { get; set; }
  public string? Description { get; set; }
  public DateTime CreatedAt { get; set; }
}