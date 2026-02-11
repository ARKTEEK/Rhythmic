using backend.Api.Hub;
using backend.Application.Interface.Job;
using backend.Application.Interface.Playlist;
using backend.Application.Model.Jobs;
using backend.Application.Model.Provider;

using Microsoft.AspNetCore.SignalR;

namespace backend.Application.Service.Job;

public class JobProcessingService : BackgroundService {
  private readonly JobCancellationStore _cancelStore;
  private readonly IHubContext<ProgressHub> _hub;
  private readonly ILogger<JobProcessingService> _logger;
  private readonly IJobQueue _queue;
  private readonly IServiceProvider _services;

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

      CancellationTokenSource cts =
        CancellationTokenSource.CreateLinkedTokenSource(stoppingToken);
      _cancelStore.Register(job.JobId, cts);

      try {
        using IServiceScope scope = _services.CreateScope();
        IPlaylistService playlistService =
          scope.ServiceProvider.GetRequiredService<IPlaylistService>();
        IPlaylistTransferService _playlistTransferService =
          scope.ServiceProvider.GetRequiredService<IPlaylistTransferService>();

        async Task OnProgress(int idx, ProviderTrack track, bool removed) {
          var payload = new { jobId = job.JobId, index = idx, track, removed };
          await _hub.Clients.Group(job.JobId)
            .SendAsync("ProgressUpdate", payload, cts.Token);
        }

        if (job is FindDuplicatesJob dupJob) {
          await playlistService.FindDuplicateTracksAsync(
            dupJob.Provider,
            dupJob.ProviderAccountId,
            dupJob.PlaylistId,
            OnProgress,
            cts.Token
          );
        } else if (job is TransferPlaylistJob transferJob) {
          await _playlistTransferService.TransferPlaylistAsync(
            transferJob.SourceProvider,
            transferJob.DestinationProvider,
            transferJob.SourceAccountId,
            transferJob.DestinationAccountId,
            transferJob.SourcePlaylistId,
            OnProgress,
            cts.Token
          );
        } else {
          throw new InvalidOperationException($"Unsupported job type {job.JobType}");
        }

        await _hub.Clients
          .Group(job.JobId)
          .SendAsync("JobCompleted",
            new { jobId = job.JobId },
            cts.Token
          );
      } catch (OperationCanceledException) {
        _logger.LogInformation("Job {JobId} was cancelled.", job.JobId);

        await _hub.Clients
          .Group(job.JobId)
          .SendAsync("JobCancelled",
            new { jobId = job.JobId });
      } catch (Exception ex) {
        _logger.LogError(ex, "Job {JobId} failed", job.JobId);

        await _hub.Clients
          .Group(job.JobId)
          .SendAsync("JobFailed",
            new { jobId = job.JobId, error = ex.Message });
      } finally {
        _cancelStore.Unregister(job.JobId);
      }
    }
  }
}