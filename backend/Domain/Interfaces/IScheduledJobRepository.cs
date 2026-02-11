using backend.Domain.Entity;

namespace backend.Domain.Interfaces;

public interface IScheduledJobRepository {
  Task<ScheduledJob?> GetByIdAsync(int jobId);
  Task<List<ScheduledJob>> GetByUserAsync(string userId, string? jobType);
  Task AddAsync(ScheduledJob job);
  Task UpdateAsync(ScheduledJob job);
  Task DeleteAsync(ScheduledJob job);
}