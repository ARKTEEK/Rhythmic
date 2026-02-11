using backend.Api.DTO.OAuth;
using backend.Application.Interface.ExternalAuth;
using backend.Domain.Entity;
using backend.Domain.Enum;
using backend.Infrastructure.Extensions;

using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Api.Controller;

[ApiController]
[Route("api/oauth")]
public class OAuthController : ControllerBase {
  private readonly IOAuthService _iOAuthService;
  private readonly UserManager<User> _userManager;

  public OAuthController(IOAuthService iOAuthService, UserManager<User> userManager) {
    _iOAuthService = iOAuthService;
    _userManager = userManager;
  }

  [HttpGet("{provider}/login")]
  public IActionResult Login([FromRoute] string provider) {
    if (!Enum.TryParse(provider, true, out OAuthProvider providerEnum)) {
      return BadRequest(new { error = "Unsupported provider." });
    }

    string loginUrl = _iOAuthService.GetLoginUrl(providerEnum);
    return Redirect(loginUrl);
  }

  [HttpPost("{provider}/callback")]
  public async Task<IActionResult> Callback([FromRoute] string provider,
    [FromBody] OAuthLoginRequestDto request) {
    if (!Enum.TryParse(provider, true, out OAuthProvider providerEnum)) {
      return BadRequest(new { error = "Unsupported provider." });
    }

    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    HttpContext.Items["returned_state"] = request.State;

    OAuthLoginResponseDto result = await _iOAuthService.LoginAsync(
      user.Id,
      providerEnum,
      request.Code
    );

    return Ok(result);
  }

  [HttpDelete("{provider}/disconnect")]
  public async Task<IActionResult> Logout([FromRoute] string provider,
    [FromQuery] string providerId) {
    if (!Enum.TryParse(provider, true, out OAuthProvider providerEnum)) {
      return BadRequest(new { error = "Unsupported provider." });
    }

    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    await _iOAuthService.DisconnectAsync(providerEnum, providerId);
    return Ok(new { success = true });
  }
}