using System.Text.Json;
using backend.DataEntity.Auth;
using backend.Entity;
using backend.Extensions;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/oauth/google")]
public class GoogleOAuthController : ControllerBase {
  private readonly UserManager<User> _userManager;
  private readonly IUserService _userService;
  private readonly IGoogleAuthService _googleAuthService;

  public GoogleOAuthController(IUserService userService, IGoogleAuthService googleAuthService,
    UserManager<User> userManager) {
    _userService = userService;
    _userManager = userManager;
    _googleAuthService = googleAuthService;
  }

  [HttpGet("login")]
  public IActionResult Login() {
    string url = _googleAuthService.GetGoogleLoginUrl();
    return Redirect(url);
  }


  [Authorize]
  [HttpPost("callback")]
  public async Task<IActionResult> Callback([FromBody] OAuthCallbackDto response) {
    string username = User.GetUsername();
    User? appUser = await _userManager.FindByNameAsync(username);

    if (appUser == null) {
      return Unauthorized("User is unauthorized or not found.");
    }

    try {
      GoogleTokenResponse tokens =
        await _googleAuthService.ExchangeCodeForTokenAsync(response.Code);
      await _userService.SaveGoogleTokensAsync(appUser.Id, tokens);
      return Ok(new { success = true });
    } catch (Exception ex) {
      return BadRequest("Google Token exchange failed.");
    }
  }
}