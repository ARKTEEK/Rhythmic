using backend.Application.Model;

public interface IAuditLogService {
  Task<List<AuditLogDto>> GetAuditLogs(string userId);
  Task SaveAuditLog(AuditLogModal auditLog);

}
