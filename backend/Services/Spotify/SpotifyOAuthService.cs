using System.Net.Http.Headers;
using System.Text.Json;
using backend.DataEntity.Auth;

namespace backend.Services;

public class SpotifyOAuthService : IOAuthService<SpotifyUserInfoResponse, SpotifyTokenResponse> {
  private readonly IConfiguration _configuration;
  private readonly IHttpClientFactory _httpClientFactory;

  public SpotifyOAuthService(IConfiguration configuration, IHttpClientFactory httpClientFactory) {
    _configuration = configuration;
    _httpClientFactory = httpClientFactory;
  }

  public string GetLoginUrl() {
    string clientId = _configuration["Spotify:ClientId"];
    string redirectUri = _configuration["Spotify:RedirectUri"];
    string rawScope =
      "user-read-email user-read-private playlist-read-private " +
      "playlist-read-collaborative playlist-modify-private " +
      "playlist-modify-public";

    string scope = Uri.EscapeDataString(rawScope);
    string state = Guid.NewGuid().ToString();

    return $"https://accounts.spotify.com/authorize?" +
           $"client_id={clientId}&response_type=code&redirect_uri={redirectUri}&" +
           $"scope={scope}&state={state}&show_dialog=true";
  }

  public async Task<SpotifyTokenResponse> ExchangeCodeForTokenAsync(string code) {
    string clientId = _configuration["Spotify:ClientId"];
    string clientSecret = _configuration["Spotify:ClientSecret"];
    string redirectUri = _configuration["Spotify:RedirectUri"];

    var client = _httpClientFactory.CreateClient();
    var body = new Dictionary<string, string> {
      ["grant_type"] = "authorization_code",
      ["code"] = code,
      ["redirect_uri"] = redirectUri
    };

    var request = new HttpRequestMessage(HttpMethod.Post, "https://accounts.spotify.com/api/token") {
      Content = new FormUrlEncodedContent(body)
    };

    string basicAuth =
      Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}"));
    request.Headers.Authorization = new AuthenticationHeaderValue("Basic", basicAuth);

    HttpResponseMessage response = await client.SendAsync(request);
    response.EnsureSuccessStatusCode();

    string json = await response.Content.ReadAsStringAsync();
    return JsonSerializer.Deserialize<SpotifyTokenResponse>(json)!;
  }

  public async Task<SpotifyTokenResponse> RefreshTokenAsync(string refreshToken) {
    string clientId = _configuration["Spotify:ClientId"];
    string clientSecret = _configuration["Spotify:ClientSecret"];

    var client = _httpClientFactory.CreateClient();
    var body = new Dictionary<string, string> {
      ["grant_type"] = "refresh_token",
      ["refresh_token"] = refreshToken
    };

    var request = new HttpRequestMessage(HttpMethod.Post, "https://accounts.spotify.com/api/token") {
      Content = new FormUrlEncodedContent(body)
    };

    string basicAuth =
      Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}"));
    request.Headers.Authorization = new AuthenticationHeaderValue("Basic", basicAuth);

    HttpResponseMessage response = await client.SendAsync(request);
    response.EnsureSuccessStatusCode();

    string json = await response.Content.ReadAsStringAsync();
    return JsonSerializer.Deserialize<SpotifyTokenResponse>(json)!;
  }

  public async Task<SpotifyUserInfoResponse> GetUserInfoAsync(string accessToken) {
    var client = _httpClientFactory.CreateClient();
    client.DefaultRequestHeaders.Authorization =
      new AuthenticationHeaderValue("Bearer", accessToken);

    HttpResponseMessage response = await client.GetAsync("https://api.spotify.com/v1/me");
    response.EnsureSuccessStatusCode();

    string json = await response.Content.ReadAsStringAsync();
    return JsonSerializer.Deserialize<SpotifyUserInfoResponse>(json)!;
  }
}