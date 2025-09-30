using backend.Api.DTO.OAuth;
using backend.Application.Interface;
using backend.Domain.Entity;
using backend.Domain.Enum;
using backend.Infrastructure.Extensions;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Api.Controller;

[ApiController]
[Route("api")]
public class OAuthController : ControllerBase {
  private readonly IOAuthService _iOAuthService;
  private readonly IAccountTokensService _accountTokensService;
  private readonly UserManager<User> _userManager;

  public OAuthController(IOAuthService iOAuthService, IAccountTokensService accountTokensService,
    UserManager<User> userManager) {
    _iOAuthService = iOAuthService;
    _accountTokensService = accountTokensService;
    _userManager = userManager;
  }

  [HttpGet("oauth/google/login")]
  public IActionResult GoogleLogin() {
    string loginUrl = _iOAuthService.GetLoginUrl(OAuthProvider.Google);
    return Redirect(loginUrl);
  }

  [HttpPost("oauth/google/callback")]
  public async Task<IActionResult> GoogleLogin([FromBody] OAuthLoginRequestDto request) {
    User? user = await this.GetCurrentUserAsync(_userManager);

    OAuthLoginResponseDto result = await _iOAuthService.LoginAsync(
      user.Id,
      OAuthProvider.Google,
      request.Code
    );

    return Ok(result);
  }

  [HttpDelete("oauth/google/logout")]
  public async Task<IActionResult> GoogleLogout() {
    User? user = await this.GetCurrentUserAsync(_userManager);
    await _accountTokensService.DeleteAsync(user.Id, OAuthProvider.Google);
    return Ok(new { success = true });
  }
}