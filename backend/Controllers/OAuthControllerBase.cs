using backend.DataEntity;
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
public abstract class OAuthControllerBase<TUserInfo, TTokenResponse> : ControllerBase
  where TTokenResponse : OAuthTokenResponse {
  protected readonly UserManager<User> _userManager;
  protected readonly IUserConnectionService _userConnectionService;
  protected readonly IOAuthService<TUserInfo, TTokenResponse> _oauthService;
  protected readonly OAuthProvider _provider;

  protected OAuthControllerBase(
    IUserConnectionService userConnectionService,
    IOAuthService<TUserInfo, TTokenResponse> oauthService,
    UserManager<User> userManager,
    OAuthProvider provider) {
    _userConnectionService = userConnectionService;
    _userManager = userManager;
    _oauthService = oauthService;
    _provider = provider;
  }

  [HttpGet("login")]
  public IActionResult Login() {
    string loginUrl = _oauthService.GetLoginUrl();
    return Redirect(loginUrl);
  }

  [Authorize]
  [HttpGet("me")]
  public async Task<IActionResult> GetUserInfo() {
    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    try {
      await _userConnectionService.RefreshTokenAsync(user.Id, _provider, _oauthService);
    } catch {
      return StatusCode(403, $"{_provider} account is not connected");
    }

    UserConnection? userConnection =
      await _userConnectionService.GetUserConnectionAsync(user.Id, _provider);
    if (userConnection == null || string.IsNullOrWhiteSpace(userConnection.AccessToken)) {
      return StatusCode(403, $"{_provider} account is not connected.");
    }

    TUserInfo userInfo = await _oauthService.GetUserInfoAsync(userConnection.AccessToken);
    return Ok(userInfo);
  }

  [Authorize]
  [HttpDelete("logout")]
  public async Task<IActionResult> Logout() {
    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    await _userConnectionService.DeleteUserConnectionAsync(user.Id, _provider);
    return Ok(new { success = true });
  }

  [HttpPost("callback")]
  public async Task<IActionResult> Callback([FromBody] OAuthCallbackDto response) {
    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    TTokenResponse tokens = await _oauthService.ExchangeCodeForTokenAsync(response.Code);
    await _userConnectionService.SaveUserConnectionAsync(user.Id, tokens, _provider);

    return Ok(new { success = true });
  }
}