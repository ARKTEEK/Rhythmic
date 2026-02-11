using System.Collections.Concurrent;

namespace backend.Application.Model.Jobs;

public class JobCancellationStore {
  private readonly ConcurrentDictionary<string, CancellationTokenSource> _running = new();

  public void Register(string jobId, CancellationTokenSource cts) {
    _running[jobId] = cts;
  }

  public void Unregister(string jobId) {
    _running.TryRemove(jobId, out _);
  }

  public bool TryCancel(string jobId) {
    if (_running.TryGetValue(jobId, out CancellationTokenSource? cts)) {
      if (!cts.IsCancellationRequested) {
        cts.Cancel();
      }

      return true;
    }

    return false;
  }
}