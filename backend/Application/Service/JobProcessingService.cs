using backend.Api.Hub;
using backend.Application.Interface;
using backend.Application.Model;

namespace backend.Application.Service;

using Microsoft.AspNetCore.SignalR;

public class JobProcessingService : BackgroundService {
  private readonly IJobQueue _queue;
  private readonly IServiceProvider _services;
  private readonly IHubContext<ProgressHub> _hub;
  private readonly JobCancellationStore _cancelStore;
  private readonly ILogger<JobProcessingService> _logger;

  public JobProcessingService(
    IJobQueue queue,
    IHubContext<ProgressHub> hub,
    JobCancellationStore cancelStore,
    ILogger<JobProcessingService> logger,
    IServiceProvider services
  ) {
    _queue = queue;
    _hub = hub;
    _cancelStore = cancelStore;
    _logger = logger;
    _services = services;
  }

  protected override async Task ExecuteAsync(CancellationToken stoppingToken) {
    _logger.LogInformation("JobProcessingService started.");

    while (!stoppingToken.IsCancellationRequested) {
      JobRequest? job = await _queue.DequeueAsync(stoppingToken);
      if (job == null) {
        continue;
      }

      _logger.LogInformation("Dequeued job {JobId} type {JobType}", job.JobId, job.JobType);

      CancellationTokenSource cts = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken);
      _cancelStore.Register(job.JobId, cts);

      try {
        using IServiceScope scope = _services.CreateScope();

        async Task OnProgress(int idx, ProviderTrack track, bool removed) {
          var payload = new {
            jobId = job.JobId,
            index = idx,
            track,
            removed
          };
          await _hub.Clients.Group(job.JobId).SendAsync("ProgressUpdate", payload, cts.Token);
        }

        await _hub.Clients
          .Group(job.JobId)
          .SendAsync("JobCompleted",
            new {
              jobId = job.JobId
            },
            cts.Token
          );
      } catch (OperationCanceledException) {
        _logger.LogInformation("Job {JobId} was cancelled.", job.JobId);

        await _hub.Clients
          .Group(job.JobId)
          .SendAsync("JobCancelled",
            new {
              jobId = job.JobId
            });
      } catch (Exception ex) {
        _logger.LogError(ex, "Job {JobId} failed", job.JobId);

        await _hub.Clients
          .Group(job.JobId)
          .SendAsync("JobFailed",
            new {
              jobId = job.JobId,
              error = ex.Message
            });
      } finally {
        _cancelStore.Unregister(job.JobId);
      }
    }
  }
}