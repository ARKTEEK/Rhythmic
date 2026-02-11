using backend.Application.Model.Audit;

namespace backend.Application.Interface;

public interface IAuditLogService {
  Task<List<AuditLogDto>> GetAuditLogs(string userId);
  Task SaveAuditLog(AuditLogModal auditLog);
}