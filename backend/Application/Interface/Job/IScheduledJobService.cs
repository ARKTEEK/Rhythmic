using backend.Application.Model.Jobs;

namespace backend.Application.Interface.Job;

public interface IScheduledJobService {
  Task<int> CreateScheduledJobAsync(string userId, string jobType, string targetType,
    int targetId, int intervalMinutes);

  Task UpdateScheduledJobAsync(int jobId, bool? enabled, int? intervalMinutes);
  Task DeleteScheduledJobAsync(int jobId);
  Task<List<ScheduledJobDto>> GetScheduledJobsAsync(string userId, string? jobType = null);
  Task<ScheduledJobDto?> GetScheduledJobAsync(int jobId);
  Task<List<JobExecutionDto>> GetJobExecutionsAsync(int scheduledJobId, int limit = 50);

  Task RecordJobExecutionAsync(int scheduledJobId, string status, DateTime startedAt,
    DateTime? finishedAt = null, string? errorMessage = null, string? metadata = null);
}