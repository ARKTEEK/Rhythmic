using backend.Application.Interface.Playlist;
using backend.Application.Model.Playlists.Requests;
using backend.Application.Model.Provider;
using backend.Domain.Entity;
using backend.Domain.Enum;
using backend.Infrastructure.Extensions;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Api.Controller;

[ApiController]
[Route("api")]
public class PlaylistsController : ControllerBase {
  private readonly IPlaylistService _playlistService;
  private readonly IPlaylistSplitService _playlistSplitService;
  private readonly IPlaylistSnapshotService _snapshotService;
  private readonly UserManager<User> _userManager;

  public PlaylistsController(
    UserManager<User> userManager,
    IPlaylistService playlistService,
    IPlaylistSplitService playlistSplitService,
    IPlaylistSnapshotService snapshotService) {
    _userManager = userManager;
    _playlistService = playlistService;
    _playlistSplitService = playlistSplitService;
    _snapshotService = snapshotService;
  }

  [Authorize]
  [HttpPost("{provider}/playlists")]
  public async Task<IActionResult> CreatePlaylistAsync(
    OAuthProvider provider,
    [FromQuery] string providerAccountId,
    [FromBody] PlaylistCreateRequest request) {
    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    if (string.IsNullOrWhiteSpace(providerAccountId)) {
      return BadRequest("providerAccountId is required.");
    }

    try {
      ProviderPlaylist createdPlaylist = await _playlistService.CreatePlaylistAsync(
        provider, providerAccountId, request);

      return Ok(createdPlaylist);
    } catch (Exception ex) {
      return BadRequest(ex.Message);
    }
  }

  [Authorize]
  [HttpGet("playlists")]
  public async Task<IActionResult> GetPlaylistsAsync() {
    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    List<ProviderPlaylist> playlists = await _playlistService.GetAllUserPlaylistsAsync(user.Id);

    return Ok(playlists);
  }

  [Authorize]
  [HttpGet("{provider}/{playlistId}/tracks")]
  public async Task<IActionResult> GetPlaylistTracks(
    OAuthProvider provider,
    [FromRoute] string playlistId,
    [FromQuery] string providerAccountId) {
    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    if (string.IsNullOrWhiteSpace(providerAccountId)) {
      return BadRequest("providerAccountId is required.");
    }

    List<ProviderTrack> tracks = await _playlistService.GetTracksByPlaylistIdAsync(
      provider,
      playlistId,
      providerAccountId);

    try {
      await _snapshotService.CreateSnapshotIfChangedAsync(
        user.Id, provider, playlistId, providerAccountId, tracks);
    } catch {
    }

    return Ok(tracks);
  }

  [Authorize]
  [HttpPut("{provider}/{playlistId}")]
  public async Task<IActionResult> UpdatePlaylistAsync(
    OAuthProvider provider,
    [FromRoute] string playlistId,
    [FromQuery] string providerAccountId,
    [FromBody] PlaylistUpdateRequest request) {
    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    if (string.IsNullOrWhiteSpace(providerAccountId)) {
      return BadRequest("providerAccountId is required.");
    }

    request.Id = playlistId;
    request.Provider = provider;

    bool isRevertOperation = Request.Headers.ContainsKey("X-Revert-Operation");

    if (!isRevertOperation) {
      List<ProviderTrack> currentTracks = await _playlistService.GetTracksByPlaylistIdAsync(
        provider, playlistId, providerAccountId);

      try {
        await _snapshotService.CreateSnapshotIfChangedAsync(
          user.Id, provider, playlistId, providerAccountId, currentTracks);
      } catch {
      }
    }

    await _playlistService.UpdatePlaylistAsync(provider, providerAccountId, request);

    return NoContent();
  }

  [Authorize]
  [HttpDelete("{provider}/{playlistId}")]
  public async Task<IActionResult> DeletePlaylistAsync(
    OAuthProvider provider,
    [FromRoute] string playlistId,
    [FromQuery] string providerAccountId) {
    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    if (string.IsNullOrWhiteSpace(providerAccountId)) {
      return BadRequest("providerAccountId is required.");
    }

    await _playlistService.DeletePlaylistAsync(provider, playlistId, providerAccountId);

    return NoContent();
  }

  [Authorize]
  [HttpGet("{provider}/search/{query}")]
  public async Task<IActionResult> SearchSongsAsync(
    OAuthProvider provider,
    [FromQuery] string providerAccountId,
    [FromRoute] string query) {
    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    if (string.IsNullOrWhiteSpace(providerAccountId)) {
      return BadRequest("providerAccountId is required.");
    }

    List<ProviderTrack> tracks =
      await _playlistService.GetSearchResultsAsync(provider, providerAccountId, query);

    return Ok(tracks);
  }

  [Authorize]
  [HttpPost("{provider}/{playlistId}/split")]
  public async Task<IActionResult> SplitPlaylistAsync(
    OAuthProvider provider,
    [FromRoute] string playlistId,
    [FromQuery] string providerAccountId,
    [FromQuery] string destinationAccountId,
    [FromBody] PlaylistSplitRequest request) {
    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    if (string.IsNullOrWhiteSpace(providerAccountId)) {
      return BadRequest("providerAccountId is required.");
    }

    if (string.IsNullOrWhiteSpace(destinationAccountId)) {
      return BadRequest("destinationAccountId is required.");
    }

    request.Provider = provider;
    request.PlaylistId = playlistId;
    request.ProviderAccountId = providerAccountId;
    request.DestinationProviderAccountId = destinationAccountId;

    try {
      List<ProviderPlaylist> createdPlaylists =
        await _playlistSplitService.SplitPlaylistAsync(
          provider, playlistId, providerAccountId, destinationAccountId, request);

      return Ok(createdPlaylists);
    } catch (Exception ex) {
      return BadRequest(ex.Message);
    }
  }
}