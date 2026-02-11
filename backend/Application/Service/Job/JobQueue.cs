using System.Threading.Channels;

using backend.Application.Interface.Job;
using backend.Application.Model.Jobs;

namespace backend.Application.Service.Job;

public class JobQueue : IJobQueue {
  private readonly Channel<JobRequest> _channel = Channel.CreateUnbounded<JobRequest>(
    new UnboundedChannelOptions { SingleReader = false, SingleWriter = false });

  public void Enqueue(JobRequest job) {
    if (!_channel.Writer.TryWrite(job)) {
      throw new InvalidOperationException("Unable to enqueue job");
    }
  }

  public async ValueTask<JobRequest?> DequeueAsync(CancellationToken ct) {
    try {
      return await _channel.Reader.ReadAsync(ct);
    } catch (OperationCanceledException) {
      return null;
    }
  }
}