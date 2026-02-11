using backend.Application.Context;
using backend.Domain.Entity;
using backend.Domain.Interfaces;
using backend.Infrastructure.Persistence;

using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Repository;

public class AuditLogRepository : IAuditLogRepository {
  private readonly DatabaseContext _db;

  public AuditLogRepository(DatabaseContext db) {
    _db = db;
  }

  public async Task AddAsync(AuditLog log) {
    if (AuditContext.HasActiveScope) {
      return;
    }

    _db.AuditLogs.Add(log);
    await _db.SaveChangesAsync();
  }

  public async Task<List<AuditLog>> GetByUserAsync(string userId) {
    return await _db.AuditLogs
      .Where(x => x.UserId == userId)
      .OrderByDescending(x => x.CreatedAt)
      .ToListAsync();
  }
}