using backend.Application.Model.Jobs;

namespace backend.Application.Interface.Job;

public interface IJobQueue {
  void Enqueue(JobRequest job);
  ValueTask<JobRequest?> DequeueAsync(CancellationToken ct);
}