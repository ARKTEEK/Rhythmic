using backend.Application.Model.Jobs;
using backend.Domain.Entity;

namespace backend.Application.Mapper;

public static class JobMapper {
  public static ScheduledJobDto MapToDto(ScheduledJob job) {
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

  public static JobExecutionDto MapToDto(JobExecution execution) {
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