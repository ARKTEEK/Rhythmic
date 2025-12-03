using backend.Application.Model;

namespace backend.Application.Interface;

public interface IJobQueue {
  void Enqueue(JobRequest job);
  ValueTask<JobRequest?> DequeueAsync(CancellationToken ct);
}