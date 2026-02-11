using backend.Application.Interface.Job;
using backend.Application.Mapper;
using backend.Application.Model.Jobs;
using backend.Domain.Entity;
using backend.Domain.Interfaces;

namespace backend.Application.Service.Job;

public class ScheduledJobService : IScheduledJobService {
  private readonly IJobExecutionRepository _executions;
  private readonly IScheduledJobRepository _jobs;

  public ScheduledJobService(
    IScheduledJobRepository jobs,
    IJobExecutionRepository executions) {
    _jobs = jobs;
    _executions = executions;
  }

  public async Task<int> CreateScheduledJobAsync(
    string userId,
    string jobType,
    string targetType,
    int targetId,
    int intervalMinutes) {
    ScheduledJob job = new() {
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

    await _jobs.AddAsync(job);
    return job.Id;
  }

  public async Task UpdateScheduledJobAsync(
    int jobId,
    bool? enabled,
    int? intervalMinutes) {
    ScheduledJob job = await _jobs.GetByIdAsync(jobId)
                       ?? throw new InvalidOperationException("Scheduled job not found");

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
    await _jobs.UpdateAsync(job);
  }

  public async Task DeleteScheduledJobAsync(int jobId) {
    ScheduledJob? job = await _jobs.GetByIdAsync(jobId);
    if (job != null) {
      await _jobs.DeleteAsync(job);
    }
  }

  public async Task<List<ScheduledJobDto>> GetScheduledJobsAsync(
    string userId,
    string? jobType = null) {
    List<ScheduledJob> jobs = await _jobs.GetByUserAsync(userId, jobType);
    return jobs.Select(JobMapper.MapToDto).ToList();
  }

  public async Task<ScheduledJobDto?> GetScheduledJobAsync(int jobId) {
    ScheduledJob? job = await _jobs.GetByIdAsync(jobId);
    return job != null ? JobMapper.MapToDto(job) : null;
  }

  public async Task<List<JobExecutionDto>> GetJobExecutionsAsync(
    int scheduledJobId,
    int limit = 50) {
    List<JobExecution> executions =
      await _executions.GetByScheduledJobAsync(scheduledJobId, limit);

    return executions.Select(JobMapper.MapToDto).ToList();
  }

  public async Task RecordJobExecutionAsync(
    int scheduledJobId,
    string status,
    DateTime startedAt,
    DateTime? finishedAt = null,
    string? errorMessage = null,
    string? metadata = null) {
    JobExecution execution = new() {
      ScheduledJobId = scheduledJobId,
      Status = status,
      StartedAt = startedAt,
      FinishedAt = finishedAt,
      ErrorMessage = errorMessage,
      Metadata = metadata
    };

    await _executions.AddAsync(execution);

    ScheduledJob? job = await _jobs.GetByIdAsync(scheduledJobId);
    if (job != null) {
      job.LastRunAt = startedAt;

      if (finishedAt.HasValue && job.Enabled && job.IntervalMinutes.HasValue) {
        job.NextRunAt =
          finishedAt.Value.AddMinutes(job.IntervalMinutes.Value);
      }

      job.UpdatedAt = DateTime.UtcNow;
      await _jobs.UpdateAsync(job);
    }
  }
}