using System.Text.Json;

using backend.Application.Interface.Job;
using backend.Application.Interface.Playlist.Sync;
using backend.Application.Model.Playlists.Sync;
using backend.Domain.Entity;
using backend.Infrastructure.Persistence;

using Microsoft.EntityFrameworkCore;

namespace backend.Application.Service.Playlist.Sync;

public class PlaylistSyncBackgroundService : BackgroundService {
  private readonly ILogger<PlaylistSyncBackgroundService> _logger;
  private readonly IServiceProvider _serviceProvider;

  public PlaylistSyncBackgroundService(
    IServiceProvider serviceProvider,
    ILogger<PlaylistSyncBackgroundService> logger) {
    _serviceProvider = serviceProvider;
    _logger = logger;
  }

  protected override async Task ExecuteAsync(CancellationToken stoppingToken) {
    while (!stoppingToken.IsCancellationRequested) {
      try {
        await ProcessScheduledJobsAsync(stoppingToken);
        await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
      } catch (Exception ex) {
        _logger.LogError(ex, "Error in PlaylistSyncBackgroundService");
        await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
      }
    }
  }

  private async Task ProcessScheduledJobsAsync(CancellationToken cancellationToken) {
    using IServiceScope scope = _serviceProvider.CreateScope();
    DatabaseContext context = scope.ServiceProvider.GetRequiredService<DatabaseContext>();
    IPlaylistSyncService syncService =
      scope.ServiceProvider.GetRequiredService<IPlaylistSyncService>();
    IScheduledJobService jobService =
      scope.ServiceProvider.GetRequiredService<IScheduledJobService>();

    DateTime now = DateTime.UtcNow;

    List<ScheduledJob> dueJobs = await context.ScheduledJobs
      .Where(j => j.JobType == "PlaylistSync" &&
                  j.Enabled &&
                  j.NextRunAt.HasValue &&
                  j.NextRunAt <= now)
      .ToListAsync(cancellationToken);

    foreach (ScheduledJob job in dueJobs) {
      if (cancellationToken.IsCancellationRequested) {
        break;
      }

      try {
        await ExecuteSyncJobAsync(job, syncService, jobService, context);
      } catch (Exception ex) {
        _logger.LogError(ex, "Error executing sync job {JobId}", job.Id);
        await jobService.RecordJobExecutionAsync(
          job.Id,
          "Failed",
          DateTime.UtcNow,
          DateTime.UtcNow,
          ex.Message);
      }
    }
  }

  private async Task ExecuteSyncJobAsync(
    ScheduledJob job,
    IPlaylistSyncService syncService,
    IScheduledJobService jobService,
    DatabaseContext context) {
    DateTime executionStart = DateTime.UtcNow;

    await jobService.RecordJobExecutionAsync(
      job.Id,
      "Running",
      executionStart);

    try {
      PlaylistSyncGroup? syncGroup = await context.PlaylistSyncGroups
        .FirstOrDefaultAsync(sg => sg.Id == job.TargetId);

      if (syncGroup == null || !syncGroup.SyncEnabled) {
        await jobService.RecordJobExecutionAsync(
          job.Id,
          "Skipped",
          executionStart,
          DateTime.UtcNow,
          null,
          "Sync group not found or disabled");
        return;
      }

      SyncResultDto result =
        await syncService.SyncGroupAsync(syncGroup.UserId, job.TargetId);

      DateTime executionEnd = DateTime.UtcNow;
      string status = result.Success ? "Completed" : "Failed";
      string metadata = JsonSerializer.Serialize(new {
        result.ChildrenSynced, result.ChildrenSkipped, result.ChildrenFailed
      });

      await jobService.RecordJobExecutionAsync(
        job.Id,
        status,
        executionStart,
        executionEnd,
        result.ErrorMessage,
        metadata);

      _logger.LogInformation(
        "Sync job {JobId} completed: {Synced} synced, {Skipped} skipped, {Failed} failed",
        job.Id,
        result.ChildrenSynced,
        result.ChildrenSkipped,
        result.ChildrenFailed);
    } catch (Exception ex) {
      await jobService.RecordJobExecutionAsync(
        job.Id,
        "Failed",
        executionStart,
        DateTime.UtcNow,
        ex.Message);
      throw;
    }
  }
}