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
  private readonly UserManager<User> _userManager;
  private readonly IUserService _userService;
  private readonly IHttpClientFactory _httpClientFactory;

  public GoogleOAuthController(IConfiguration configuration, IUserService userService,
    UserManager<User> userManager, IHttpClientFactory httpClientFactory) {
    _configuration = configuration;
    _userService = userService;
    _userManager = userManager;
    _httpClientFactory = httpClientFactory;
  }

  [HttpGet("login")]
  public IActionResult Login() {
    string? clientId = _configuration["Google:ClientId"];
    string? redirectUri = _configuration["Google:RedirectUri"];
    string scope = "https://www.googleapis.com/auth/youtube.force-ssl";
    string state = Guid.NewGuid().ToString();

    string url = $"https://accounts.google.com/o/oauth2/v2/auth?" +
                 $"client_id={clientId}&redirect_uri={redirectUri}&" +
                 $"response_type=code&scope={scope}&access_type=offline&prompt=consent&state={state}";

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

    string? clientId = _configuration["Google:ClientId"];
    string? clientSecret = _configuration["Google:ClientSecret"];
    string? redirectUri = _configuration["Google:RedirectUri"];

    if (string.IsNullOrWhiteSpace(clientId)) {
      throw new InvalidOperationException("Google:ClientId configuration is missing or empty.");
    }

    if (string.IsNullOrWhiteSpace(clientSecret)) {
      throw new InvalidOperationException("Google:ClientSecret configuration is missing or empty.");
    }

    if (string.IsNullOrWhiteSpace(redirectUri)) {
      throw new InvalidOperationException("Google:RedirectUri configuration is missing or empty.");
    }

    HttpClient httpClient = _httpClientFactory.CreateClient();
    FormUrlEncodedContent tokenContent = new(new Dictionary<string, string> {
      ["code"] = response.Code,
      ["client_id"] = clientId,
      ["client_secret"] = clientSecret,
      ["redirect_uri"] = redirectUri,
      ["grant_type"] = "authorization_code"
    });

    HttpResponseMessage tokenResponse =
      await httpClient.PostAsync("https://oauth2.googleapis.com/token", tokenContent);

    if (!tokenResponse.IsSuccessStatusCode) {
      string error = await tokenResponse.Content.ReadAsStringAsync();
      Console.WriteLine("Google token exchange failed: " + error);
      return BadRequest("Token exchange failed");
    }

    string json = await tokenResponse.Content.ReadAsStringAsync();
    GoogleTokenResponse? tokens = JsonSerializer.Deserialize<GoogleTokenResponse>(json);

    if (tokens == null || string.IsNullOrEmpty(tokens.AccessToken)) {
      return BadRequest("Failed to deserialize token response");
    }

    await _userService.SaveGoogleTokens(appUser.Id, tokens);

    return Ok(new { success = true });
  }
}