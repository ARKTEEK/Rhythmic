using backend.Application.Model;
using backend.Infrastructure.Persistence;

using Microsoft.EntityFrameworkCore;

public class AuditLogService : IAuditLogService {
  private readonly DatabaseContext _db;

  public AuditLogService(DatabaseContext database) {
    _db = database;
  }

  public async Task<List<AuditLogDto>> GetAuditLogs(string userId) {
    List<AuditLog> auditLogs =
      await _db.AuditLogs
      .Where(x => x.UserId == userId)
      .OrderByDescending(x => x.CreatedAt)
      .ToListAsync();

    return auditLogs.Select(log => new AuditLogDto {
      Id = log.Id,
      Executor = log.Executor,
      Type = log.Type,
      Description = log.Description,
      CreatedAt = log.CreatedAt
    }).ToList();
  }

  public async Task SaveAuditLog(AuditLogModal dto) {
    if (AuditContext.HasActiveScope) {
      return;
    }

    AuditLog log = new AuditLog {
      UserId = dto.UserId,
      Executor = dto.Executor,
      Type = dto.Type,
      Description = dto.Description
    };

    _db.AuditLogs.Add(log);
    await _db.SaveChangesAsync();
  }

}
