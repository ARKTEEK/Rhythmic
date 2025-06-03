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
  private readonly IConfiguration _configuration;
  private readonly IUserService _userService;
  private readonly UserManager<User> _userManager;

  public GoogleOAuthController(IConfiguration configuration, IUserService userService,
    UserManager<User> userManager) {
    _configuration = configuration;
    _userService = userService;
    _userManager = userManager;
  }

  [HttpGet("login")]
  public IActionResult Login() {
    var clientId = _configuration["Google:ClientId"];
    var redirectUri = _configuration["Google:RedirectUri"];
    var scope = "https://www.googleapis.com/auth/youtube.force-ssl";
    var state = Guid.NewGuid().ToString();

    var url = $"https://accounts.google.com/o/oauth2/v2/auth?" +
              $"client_id={clientId}&redirect_uri={redirectUri}&" +
              $"response_type=code&scope={scope}&access_type=offline&prompt=consent&state={state}";

    return Redirect(url);
  }

  [Authorize]
  [HttpPost("callback")]
  public async Task<IActionResult> Callback([FromBody] OAuthCallbackDto response) {
    var username = User.GetUsername();
    var appUser = await _userManager.FindByNameAsync(username);
    
    if (appUser == null) return Unauthorized("User not found");

    var clientId = _configuration["Google:ClientId"];
    var clientSecret = _configuration["Google:ClientSecret"];
    var redirectUri = _configuration["Google:RedirectUri"];

    var httpClient = new HttpClient();
    var tokenResponse = await httpClient.PostAsync(
      "https://oauth2.googleapis.com/token",
      new FormUrlEncodedContent(new Dictionary<string, string> {
        ["code"] = response.Code,
        ["client_id"] = clientId,
        ["client_secret"] = clientSecret,
        ["redirect_uri"] = redirectUri,
        ["grant_type"] = "authorization_code"
      })
    );

    if (!tokenResponse.IsSuccessStatusCode) {
      var error = await tokenResponse.Content.ReadAsStringAsync();
      Console.WriteLine("Google token exchange failed: " + error);
      return BadRequest("Token exchange failed");
    }

    var json = await tokenResponse.Content.ReadAsStringAsync();
    var tokens = JsonSerializer.Deserialize<GoogleTokenResponse>(json);

    if (tokens == null || string.IsNullOrEmpty(tokens.AccessToken)) {
      return BadRequest("Failed to deserialize token response");
    }

    await _userService.SaveGoogleTokens(appUser.Id, tokens);

    return Ok(new { success = true });
  }
}