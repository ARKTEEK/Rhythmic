using backend.DataEntity;
using backend.Entity;
using backend.Enums;
using backend.Extensions;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/youtube")]
public class YoutubeController : ControllerBase {
  private readonly IUserConnectionService _userConnectionService;
  private readonly IYoutubeService _youtubeService;
  private readonly UserManager<User> _userManager;

  public YoutubeController(IUserConnectionService userConnectionService,
    IYoutubeService youtubeService,
    UserManager<User> userManager) {
    _userConnectionService = userConnectionService;
    _youtubeService = youtubeService;
    _userManager = userManager;
  }

  [Authorize]
  [HttpGet("playlists")]
  public async Task<IActionResult> GetPlaylists() {
    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    await _userConnectionService.RefreshGoogleTokenAsync(user.Id);

    UserConnection? userConnection =
      await _userConnectionService.GetUserConnectionAsync(user.Id, OAuthProvider.Google);
    if (userConnection == null) {
      return Forbid("Google account is not connected.");
    }

    List<YoutubePlaylist> playlists =
      await _youtubeService.GetPlaylistsAsync(userConnection.AccessToken);

    return Ok(playlists);
  }
}