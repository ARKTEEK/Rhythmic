using backend.Application.Interface;
using backend.Domain.Entity;
using backend.Domain.Enum;
using backend.Infrastructure.Extensions;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Api.Controller;

[ApiController]
[Route("api")]
public class PlaylistSnapshotsController : ControllerBase {
  private readonly IPlaylistSnapshotService _snapshotService;
  private readonly UserManager<User> _userManager;

  public PlaylistSnapshotsController(
    UserManager<User> userManager,
    IPlaylistSnapshotService snapshotService) {
    _userManager = userManager;
    _snapshotService = snapshotService;
  }

  [Authorize]
  [HttpGet("{provider}/{playlistId}/snapshots")]
  public async Task<IActionResult> GetSnapshotHistoryAsync(
    OAuthProvider provider,
    [FromRoute] string playlistId) {
    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    var snapshots = await _snapshotService.GetSnapshotHistoryAsync(
      user.Id, provider, playlistId);

    return Ok(snapshots);
  }

  [Authorize]
  [HttpGet("snapshots/{snapshotId}/compare")]
  public async Task<IActionResult> CompareSnapshotAsync(
    [FromRoute] int snapshotId,
    [FromQuery] OAuthProvider provider,
    [FromQuery] string playlistId,
    [FromQuery] string providerAccountId) {
    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    if (string.IsNullOrWhiteSpace(providerAccountId)) {
      return BadRequest("providerAccountId is required.");
    }

    try {
      var comparison = await _snapshotService.CompareSnapshotAsync(
        user.Id, provider, playlistId, providerAccountId, snapshotId);

      return Ok(comparison);
    } catch (InvalidOperationException ex) {
      return NotFound(ex.Message);
    }
  }

  [Authorize]
  [HttpPost("snapshots/{snapshotId}/revert")]
  public async Task<IActionResult> RevertToSnapshotAsync(
    [FromRoute] int snapshotId,
    [FromQuery] OAuthProvider provider,
    [FromQuery] string playlistId,
    [FromQuery] string providerAccountId) {
    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    if (string.IsNullOrWhiteSpace(providerAccountId)) {
      return BadRequest("providerAccountId is required.");
    }

    try {
      await _snapshotService.RevertToSnapshotAsync(
        provider, playlistId, providerAccountId, snapshotId);

      return NoContent();
    } catch (InvalidOperationException ex) {
      return NotFound(ex.Message);
    }
  }

  [Authorize]
  [HttpDelete("snapshots/{snapshotId}")]
  public async Task<IActionResult> DeleteSnapshotAsync(
    [FromRoute] int snapshotId) {
    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    try {
      await _snapshotService.DeleteSnapshotAsync(user.Id, snapshotId);
      return NoContent();
    } catch (InvalidOperationException ex) {
      return NotFound(ex.Message);
    }
  }
}

