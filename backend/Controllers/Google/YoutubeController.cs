using backend.Entity;
using backend.Services.Google;
using backend.Services.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers.Google;

[ApiController]
[Route("api/youtube")]
public class YoutubeController : ControllerBase {
  private readonly IUserConnectionService _userConnectionService;
  private readonly UserManager<User> _userManager;
  private readonly IYoutubeService _youtubeService;

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
    // User? user = await this.GetCurrentUserAsync(_userManager);
    // if (user == null) {
    //   return Unauthorized();
    // }
    //
    // try {
    //   await _userConnectionService.RefreshGoogleTokenAsync(user.Id);
    // } catch (Exception ex) {
    //   return StatusCode(403, "Google account is not connected.");
    // }
    //
    // UserConnection? userConnection =
    //   await _userConnectionService.GetUserConnectionAsync(user.Id, OAuthProvider.Google);
    //
    // if (userConnection == null || string.IsNullOrWhiteSpace(userConnection.AccessToken)) {
    //   return StatusCode(403, "Google account is not connected.");
    // }
    //
    // List<YoutubePlaylist> playlists =
    //   await _youtubeService.GetPlaylistsAsync(userConnection.AccessToken);
    //
    // return Ok(playlists);
    return Ok();
  }
}