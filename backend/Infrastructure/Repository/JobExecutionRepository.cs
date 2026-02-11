using backend.Domain.Entity;
using backend.Domain.Interfaces;
using backend.Infrastructure.Persistence;

using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Repository;

public class JobExecutionRepository : IJobExecutionRepository {
  private readonly DatabaseContext _context;

  public JobExecutionRepository(DatabaseContext context) {
    _context = context;
  }

  public async Task<List<JobExecution>> GetByScheduledJobAsync(
    int scheduledJobId,
    int limit) {
    return await _context.JobExecutions
      .Where(e => e.ScheduledJobId == scheduledJobId)
      .OrderByDescending(e => e.StartedAt)
      .Take(limit)
      .ToListAsync();
  }

  public async Task AddAsync(JobExecution execution) {
    _context.JobExecutions.Add(execution);
    await _context.SaveChangesAsync();
  }
}