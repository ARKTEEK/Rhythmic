using backend.Application.Interface.Job;
using backend.Application.Model.Jobs;
using backend.Application.Model.Playlists.Requests;

using Microsoft.AspNetCore.Mvc;

namespace backend.Api.Controller;

[ApiController]
[Route("api/[controller]")]
public class JobsController : ControllerBase {
  private readonly JobCancellationStore _cancelStore;
  private readonly IJobQueue _queue;

  public JobsController(IJobQueue queue, JobCancellationStore cancelStore) {
    _queue = queue;
    _cancelStore = cancelStore;
  }

  [HttpPost("duplicates")]
  public IActionResult StartFindDuplicates(
    [FromBody] StartFindDuplicatesRequest req
  ) {
    if (string.IsNullOrWhiteSpace(req.ProviderAccountId)) {
      return BadRequest("ProviderAccountId is required");
    }

    if (string.IsNullOrWhiteSpace(req.PlaylistId)) {
      return BadRequest("PlaylistId is required");
    }

    FindDuplicatesJob job = new() {
      Provider = req.Provider,
      ProviderAccountId = req.ProviderAccountId,
      PlaylistId = req.PlaylistId
    };

    _queue.Enqueue(job);
    return Ok(new { jobId = job.JobId });
  }

  [HttpPost("transfer")]
  public IActionResult StartTransfer(
    [FromBody] StartTransferPlaylistRequest req
  ) {
    if (string.IsNullOrWhiteSpace(req.SourceAccountId) ||
        string.IsNullOrWhiteSpace(req.DestinationAccountId)) {
      return BadRequest("Both account IDs are required");
    }

    if (string.IsNullOrWhiteSpace(req.SourcePlaylistId)) {
      return BadRequest("Both playlist IDs are required");
    }

    TransferPlaylistJob job = new() {
      SourceProvider = req.SourceProvider,
      SourceAccountId = req.SourceAccountId,
      SourcePlaylistId = req.SourcePlaylistId,
      DestinationProvider = req.DestinationProvider,
      DestinationAccountId = req.DestinationAccountId
    };

    _queue.Enqueue(job);
    return Ok(new { jobId = job.JobId });
  }


  [HttpPost("{jobId}/cancel")]
  public IActionResult CancelJob(string jobId) {
    bool cancelled = _cancelStore.TryCancel(jobId);
    return Ok(new { cancelled });
  }
}