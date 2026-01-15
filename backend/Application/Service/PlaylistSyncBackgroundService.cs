using backend.Application.Interface;
using backend.Domain.Entity;
using backend.Infrastructure.Persistence;

using Microsoft.EntityFrameworkCore;

namespace backend.Application.Service;

public class PlaylistSyncBackgroundService : BackgroundService {
  private readonly IServiceProvider _serviceProvider;
  private readonly ILogger<PlaylistSyncBackgroundService> _logger;

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
    using var scope = _serviceProvider.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<DatabaseContext>();
    var syncService = scope.ServiceProvider.GetRequiredService<IPlaylistSyncService>();
    var jobService = scope.ServiceProvider.GetRequiredService<IScheduledJobService>();

    var now = DateTime.UtcNow;

    var dueJobs = await context.ScheduledJobs
      .Where(j => j.JobType == "PlaylistSync" &&
                  j.Enabled &&
                  j.NextRunAt.HasValue &&
                  j.NextRunAt <= now)
      .ToListAsync(cancellationToken);

    foreach (var job in dueJobs) {
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
    var executionStart = DateTime.UtcNow;

    await jobService.RecordJobExecutionAsync(
      job.Id,
      "Running",
      executionStart);

    try {
      var syncGroup = await context.PlaylistSyncGroups
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

      var result = await syncService.SyncGroupAsync(syncGroup.UserId, job.TargetId, forceSync: false);

      var executionEnd = DateTime.UtcNow;
      var status = result.Success ? "Completed" : "Failed";
      var metadata = System.Text.Json.JsonSerializer.Serialize(new {
        ChildrenSynced = result.ChildrenSynced,
        ChildrenSkipped = result.ChildrenSkipped,
        ChildrenFailed = result.ChildrenFailed
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

