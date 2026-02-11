using backend.Domain.Entity;

namespace backend.Domain.Interfaces;

public interface IAuditLogRepository {
  Task AddAsync(AuditLog log);
  Task<List<AuditLog>> GetByUserAsync(string userId);
}