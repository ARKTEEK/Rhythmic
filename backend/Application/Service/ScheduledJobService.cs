using backend.Application.Interface;
using backend.Application.Model;
using backend.Domain.Entity;
using backend.Infrastructure.Persistence;

using Microsoft.EntityFrameworkCore;

namespace backend.Application.Service;

public class ScheduledJobService : IScheduledJobService {
  private readonly DatabaseContext _context;

  public ScheduledJobService(DatabaseContext context) {
    _context = context;
  }

  public async Task<int> CreateScheduledJobAsync(
    string userId,
    string jobType,
    string targetType,
    int targetId,
    int intervalMinutes) {
    var job = new ScheduledJob {
      UserId = userId,
      JobType = jobType,
      TargetType = targetType,
      TargetId = targetId,
      IntervalMinutes = intervalMinutes,
      Enabled = true,
      CreatedAt = DateTime.UtcNow,
      UpdatedAt = DateTime.UtcNow,
      NextRunAt = DateTime.UtcNow.AddMinutes(intervalMinutes)
    };

    _context.ScheduledJobs.Add(job);
    await _context.SaveChangesAsync();

    return job.Id;
  }

  public async Task UpdateScheduledJobAsync(int jobId, bool? enabled, int? intervalMinutes) {
    var job = await _context.ScheduledJobs.FindAsync(jobId);
    if (job == null) {
      throw new InvalidOperationException("Scheduled job not found");
    }

    if (enabled.HasValue) {
      job.Enabled = enabled.Value;
    }

    if (intervalMinutes.HasValue) {
      job.IntervalMinutes = intervalMinutes;
      if (job.Enabled) {
        job.NextRunAt = DateTime.UtcNow.AddMinutes(intervalMinutes.Value);
      }
    }

    job.UpdatedAt = DateTime.UtcNow;
    await _context.SaveChangesAsync();
  }

  public async Task DeleteScheduledJobAsync(int jobId) {
    var job = await _context.ScheduledJobs.FindAsync(jobId);
    if (job != null) {
      _context.ScheduledJobs.Remove(job);
      await _context.SaveChangesAsync();
    }
  }

  public async Task<List<ScheduledJobDto>> GetScheduledJobsAsync(string userId, string? jobType = null) {
    var query = _context.ScheduledJobs.Where(j => j.UserId == userId);

    if (!string.IsNullOrEmpty(jobType)) {
      query = query.Where(j => j.JobType == jobType);
    }

    var jobs = await query
      .OrderByDescending(j => j.CreatedAt)
      .ToListAsync();

    return jobs.Select(MapToDto).ToList();
  }

  public async Task<ScheduledJobDto?> GetScheduledJobAsync(int jobId) {
    var job = await _context.ScheduledJobs.FindAsync(jobId);
    return job != null ? MapToDto(job) : null;
  }

  public async Task<List<JobExecutionDto>> GetJobExecutionsAsync(int scheduledJobId, int limit = 50) {
    var executions = await _context.JobExecutions
      .Where(je => je.ScheduledJobId == scheduledJobId)
      .OrderByDescending(je => je.StartedAt)
      .Take(limit)
      .ToListAsync();

    return executions.Select(MapToDto).ToList();
  }

  public async Task RecordJobExecutionAsync(
    int scheduledJobId,
    string status,
    DateTime startedAt,
    DateTime? finishedAt = null,
    string? errorMessage = null,
    string? metadata = null) {
    var execution = new JobExecution {
      ScheduledJobId = scheduledJobId,
      Status = status,
      StartedAt = startedAt,
      FinishedAt = finishedAt,
      ErrorMessage = errorMessage,
      Metadata = metadata
    };

    _context.JobExecutions.Add(execution);

    var job = await _context.ScheduledJobs.FindAsync(scheduledJobId);
    if (job != null) {
      job.LastRunAt = startedAt;
      if (finishedAt.HasValue) {
        if (job.IntervalMinutes.HasValue && job.Enabled) {
          job.NextRunAt = finishedAt.Value.AddMinutes(job.IntervalMinutes.Value);
        }
      }
      job.UpdatedAt = DateTime.UtcNow;
    }

    await _context.SaveChangesAsync();
  }

  private ScheduledJobDto MapToDto(ScheduledJob job) {
    return new ScheduledJobDto {
      Id = job.Id,
      JobType = job.JobType,
      TargetType = job.TargetType,
      TargetId = job.TargetId,
      CronExpression = job.CronExpression,
      IntervalMinutes = job.IntervalMinutes,
      Enabled = job.Enabled,
      LastRunAt = job.LastRunAt,
      NextRunAt = job.NextRunAt,
      CreatedAt = job.CreatedAt,
      UpdatedAt = job.UpdatedAt
    };
  }

  private JobExecutionDto MapToDto(JobExecution execution) {
    return new JobExecutionDto {
      Id = execution.Id,
      ScheduledJobId = execution.ScheduledJobId,
      Status = execution.Status,
      StartedAt = execution.StartedAt,
      FinishedAt = execution.FinishedAt,
      ErrorMessage = execution.ErrorMessage,
      Metadata = execution.Metadata
    };
  }
}

