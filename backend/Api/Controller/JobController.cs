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

  [HttpPost("start")]
  public IActionResult StartJob([FromBody] JobStartRequest req) {
    if (string.IsNullOrWhiteSpace(req.ProviderAccountId)) {
      return BadRequest("ProviderAccountId is required!");
    }

    if (string.IsNullOrWhiteSpace(req.PlaylistId)) {
      return BadRequest("PlaylistId is required!");
    }

    JobRequest job = new() {
      Provider = req.Provider,
      ProviderAccountId = req.ProviderAccountId,
      PlaylistId = req.PlaylistId,
      JobType = req.JobType
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