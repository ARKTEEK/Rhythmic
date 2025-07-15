using backend.DataEntity;
using backend.Entity;
using backend.Enums;
using backend.Extensions;
using backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/youtube")]
public class YoutubeController : ControllerBase {
  private readonly IUserService _userService;
  private readonly IUserConnectionService _userConnectionService;
  private readonly IYoutubeService _youtubeService;
  private readonly UserManager<User> _userManager;

  public YoutubeController(IUserService userService, IUserConnectionService userConnectionService,
    IYoutubeService youtubeService,
    UserManager<User> userManager) {
    _userService = userService;
    _userConnectionService = userConnectionService;
    _youtubeService = youtubeService;
    _userManager = userManager;
  }

  [HttpGet("playlists")]
  public async Task<IActionResult> GetPlaylists() {
    string username = User.GetUsername();
    User? user = await _userManager.FindByNameAsync(username);

    if (user == null) {
      return Unauthorized("User not found");
    }

    try {
      await _userService.RefreshGoogleTokensAsync(user.Id);

      UserConnection? userConnection =
        await _userConnectionService.GetUserConnectionAsync(user.Id, OAuthProvider.Google);

      List<YoutubePlaylist> playlists =
        await _youtubeService.GetPlaylistsAsync(userConnection.AccessToken);

      Console.WriteLine("--- YouTube Playlists ---");
      if (playlists.Count == 0) {
        Console.WriteLine("No playlists found.");
      } else {
        foreach (var playlist in playlists) {
          Console.WriteLine($"  Title: {playlist.Title}");
          Console.WriteLine($"  ID: {playlist.Id}");
          Console.WriteLine($"  Items: {playlist.ItemCount}");
          Console.WriteLine($"  Privacy Status: {playlist.PrivacyStatus}");
          Console.WriteLine("-------------------------");
        }
      }

      Console.WriteLine("--- End of Playlists ---");

      return Ok(playlists);
    } catch (Exception ex) {
      return StatusCode(500, ex.Message);
    }
  }
}