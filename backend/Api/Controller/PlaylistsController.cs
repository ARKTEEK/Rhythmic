using backend.Application.Interface;
using backend.Application.Model;
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
  private readonly UserManager<User> _userManager;

  public PlaylistsController(
    UserManager<User> userManager,
    IPlaylistService playlistService) {
    _userManager = userManager;
    _playlistService = playlistService;
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
}