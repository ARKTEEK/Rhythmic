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
  private readonly IOAuthService _ioAuthService;
  private readonly UserManager<User> _userManager;

  public OAuthController(IOAuthService ioAuthService, UserManager<User> userManager) {
    _ioAuthService = ioAuthService;
    _userManager = userManager;
  }

  [HttpGet("oauth/google/login")]
  public IActionResult GoogleLogin() {
    string loginUrl = _ioAuthService.GetLoginUrl(OAuthProvider.Google);
    return Redirect(loginUrl);
  }

  [HttpPost("oauth/google/callback")]
  public async Task<IActionResult> GoogleLogin([FromBody] OAuthLoginRequestDto request) {
    User? user = await this.GetCurrentUserAsync(_userManager);

    OAuthLoginResponseDto result = await _ioAuthService.LoginAsync(
      user.Id,
      OAuthProvider.Google,
      request.Code
    );

    return Ok(result);
  }
}