using backend.Domain.Entity;

namespace backend.Domain.Interfaces;

public interface IJobExecutionRepository {
  Task<List<JobExecution>> GetByScheduledJobAsync(int scheduledJobId, int limit);
  Task AddAsync(JobExecution execution);
}