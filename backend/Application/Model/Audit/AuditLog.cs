using backend.Domain.Enum;

namespace backend.Application.Model.Audit;

public class AuditLogModal {
  public string UserId { get; set; }
  public ExecutorType Executor { get; set; }
  public AuditType Type { get; set; }
  public string? Description { get; set; }
}