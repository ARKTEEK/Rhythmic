using backend.Application.Interface;
using backend.Application.Model.Audit;
using backend.Domain.Entity;
using backend.Domain.Interfaces;

namespace backend.Application.Service;

public class AuditLogService : IAuditLogService {
  private readonly IAuditLogRepository _repository;

  public AuditLogService(IAuditLogRepository repository) {
    _repository = repository;
  }

  public async Task<List<AuditLogDto>> GetAuditLogs(string userId) {
    List<AuditLog> logs = await _repository.GetByUserAsync(userId);

    return logs.Select(log => new AuditLogDto {
      Id = log.Id,
      Executor = log.Executor,
      Type = log.Type,
      Description = log.Description,
      CreatedAt = log.CreatedAt
    }).ToList();
  }

  public async Task SaveAuditLog(AuditLogModal dto) {
    AuditLog log = new() {
      UserId = dto.UserId,
      Executor = dto.Executor,
      Type = dto.Type,
      Description = dto.Description,
      CreatedAt = DateTime.UtcNow
    };

    await _repository.AddAsync(log);
  }
}