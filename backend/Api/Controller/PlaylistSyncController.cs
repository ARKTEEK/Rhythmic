using backend.Application.Interface;
using backend.Application.Model;
using backend.Domain.Entity;
using backend.Infrastructure.Extensions;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Api.Controller;

[ApiController]
[Route("api/sync")]
public class PlaylistSyncController : ControllerBase {
  private readonly IPlaylistSyncService _syncService;
  private readonly UserManager<User> _userManager;

  public PlaylistSyncController(
    IPlaylistSyncService syncService,
    UserManager<User> userManager) {
    _syncService = syncService;
    _userManager = userManager;
  }

  [Authorize]
  [HttpPost("groups")]
  public async Task<IActionResult> CreateSyncGroup([FromBody] CreateSyncGroupRequest request) {
    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    try {
      var syncGroup = await _syncService.CreateSyncGroupAsync(user.Id, request);
      return Ok(syncGroup);
    } catch (InvalidOperationException ex) {
      return BadRequest(ex.Message);
    }
  }

  [Authorize]
  [HttpGet("groups")]
  public async Task<IActionResult> GetSyncGroups() {
    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    var syncGroups = await _syncService.GetSyncGroupsAsync(user.Id);
    return Ok(syncGroups);
  }

  [Authorize]
  [HttpGet("groups/{syncGroupId}")]
  public async Task<IActionResult> GetSyncGroup(int syncGroupId) {
    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    var syncGroup = await _syncService.GetSyncGroupAsync(user.Id, syncGroupId);
    if (syncGroup == null) {
      return NotFound();
    }

    return Ok(syncGroup);
  }

  [Authorize]
  [HttpPut("groups/{syncGroupId}")]
  public async Task<IActionResult> UpdateSyncGroup(
    int syncGroupId,
    [FromBody] UpdateSyncGroupRequest request) {
    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    try {
      var syncGroup = await _syncService.UpdateSyncGroupAsync(
        user.Id,
        syncGroupId,
        request.Name,
        request.SyncEnabled);
      return Ok(syncGroup);
    } catch (InvalidOperationException ex) {
      return BadRequest(ex.Message);
    }
  }

  [Authorize]
  [HttpDelete("groups/{syncGroupId}")]
  public async Task<IActionResult> DeleteSyncGroup(int syncGroupId) {
    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    try {
      await _syncService.DeleteSyncGroupAsync(user.Id, syncGroupId);
      return NoContent();
    } catch (InvalidOperationException ex) {
      return BadRequest(ex.Message);
    }
  }

  [Authorize]
  [HttpPost("groups/{syncGroupId}/children")]
  public async Task<IActionResult> AddChildPlaylist(
    int syncGroupId,
    [FromBody] AddChildPlaylistRequest request) {
    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    try {
      var syncGroup = await _syncService.AddChildPlaylistAsync(user.Id, syncGroupId, request);
      return Ok(syncGroup);
    } catch (InvalidOperationException ex) {
      return BadRequest(ex.Message);
    }
  }

  [Authorize]
  [HttpDelete("groups/{syncGroupId}/children/{childId}")]
  public async Task<IActionResult> RemoveChildPlaylist(int syncGroupId, int childId) {
    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    try {
      await _syncService.RemoveChildPlaylistAsync(user.Id, syncGroupId, childId);
      return NoContent();
    } catch (InvalidOperationException ex) {
      return BadRequest(ex.Message);
    }
  }

  [Authorize]
  [HttpPost("groups/{syncGroupId}/sync")]
  public async Task<IActionResult> SyncGroup(int syncGroupId, [FromQuery] bool force = false) {
    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    try {
      var result = await _syncService.SyncGroupAsync(user.Id, syncGroupId, force);
      return Ok(result);
    } catch (InvalidOperationException ex) {
      return BadRequest(ex.Message);
    } catch (Exception ex) {
      return StatusCode(500, ex.Message);
    }
  }
}

public class UpdateSyncGroupRequest {
  public string? Name { get; set; }
  public bool? SyncEnabled { get; set; }
}

