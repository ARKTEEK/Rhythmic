using backend.Api.DTO;
using backend.Application.Interface;
using backend.Application.Model;

namespace backend.Api.Controller;

using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class JobsController : ControllerBase {
  private readonly IJobQueue _queue;
  private readonly JobCancellationStore _cancelStore;

  public JobsController(IJobQueue queue, JobCancellationStore cancelStore) {
    _queue = queue;
    _cancelStore = cancelStore;
  }

  [HttpPost("duplicates")]
  public IActionResult StartFindDuplicates(
    [FromBody] StartFindDuplicatesRequest req
  ) {
    if (string.IsNullOrWhiteSpace(req.ProviderAccountId))
      return BadRequest("ProviderAccountId is required");

    if (string.IsNullOrWhiteSpace(req.PlaylistId))
      return BadRequest("PlaylistId is required");

    var job = new FindDuplicatesJob {
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
        string.IsNullOrWhiteSpace(req.DestinationAccountId))
      return BadRequest("Both account IDs are required");

    if (string.IsNullOrWhiteSpace(req.SourcePlaylistId))
      return BadRequest("Both playlist IDs are required");

    var job = new TransferPlaylistJob {
      SourceProvider = req.SourceProvider,
      SourceAccountId = req.SourceAccountId,
      SourcePlaylistId = req.SourcePlaylistId,
      DestinationProvider = req.DestinationProvider,
      DestinationAccountId = req.DestinationAccountId,
    };

    _queue.Enqueue(job);
    return Ok(new { jobId = job.JobId });
  }


  [HttpPost("{jobId}/cancel")]
  public IActionResult CancelJob(string jobId) {
    var cancelled = _cancelStore.TryCancel(jobId);
    return Ok(new { cancelled });
  }
}
