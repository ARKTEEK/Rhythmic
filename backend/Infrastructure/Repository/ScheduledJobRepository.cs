using backend.Domain.Entity;
using backend.Domain.Interfaces;
using backend.Infrastructure.Persistence;

using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Repository;

public class ScheduledJobRepository : IScheduledJobRepository {
  private readonly DatabaseContext _context;

  public ScheduledJobRepository(DatabaseContext context) {
    _context = context;
  }

  public async Task<ScheduledJob?> GetByIdAsync(int jobId) {
    return await _context.ScheduledJobs.FindAsync(jobId);
  }

  public async Task<List<ScheduledJob>> GetByUserAsync(string userId, string? jobType) {
    IQueryable<ScheduledJob> query =
      _context.ScheduledJobs.Where(j => j.UserId == userId);

    if (!string.IsNullOrEmpty(jobType)) {
      query = query.Where(j => j.JobType == jobType);
    }

    return await query
      .OrderByDescending(j => j.CreatedAt)
      .ToListAsync();
  }

  public async Task AddAsync(ScheduledJob job) {
    _context.ScheduledJobs.Add(job);
    await _context.SaveChangesAsync();
  }

  public async Task UpdateAsync(ScheduledJob job) {
    _context.ScheduledJobs.Update(job);
    await _context.SaveChangesAsync();
  }

  public async Task DeleteAsync(ScheduledJob job) {
    _context.ScheduledJobs.Remove(job);
    await _context.SaveChangesAsync();
  }
}