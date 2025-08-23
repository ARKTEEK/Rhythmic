using backend.DataEntity.Auth;
using backend.Entity;
using backend.Enums;
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
  private readonly IUserConnectionService _userConnectionService;
  private readonly IGoogleAuthService _googleAuthService;

  public GoogleOAuthController(IUserConnectionService userConnectionService,
    IGoogleAuthService googleAuthService,
    UserManager<User> userManager) {
    _userConnectionService = userConnectionService;
    _userManager = userManager;
    _googleAuthService = googleAuthService;
  }

  [HttpGet("login")]
  public IActionResult Login() {
    string url = _googleAuthService.GetGoogleLoginUrl();
    return Redirect(url);
  }

  [Authorize]
  [HttpDelete("logout")]
  public async Task<IActionResult> Logout() {
    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    await _userConnectionService.DeleteUserConnectionAsync(user.Id, OAuthProvider.Google);

    return Ok(new { success = true });
  }

  [Authorize]
  [HttpPost("callback")]
  public async Task<IActionResult> Callback([FromBody] OAuthCallbackDto response) {
    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    GoogleTokenResponse tokens =
      await _googleAuthService.ExchangeCodeForTokenAsync(response.Code);
    await _userConnectionService.SaveUserConnectionAsync(user.Id, tokens);

    return Ok(new { success = true });
  }
}