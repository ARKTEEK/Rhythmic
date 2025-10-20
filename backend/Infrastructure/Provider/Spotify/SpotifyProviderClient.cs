using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using backend.Application.Interface;
using backend.Application.Model;
using backend.Domain.Enum;
using backend.Infrastructure.DTO.Spotify;
using backend.Infrastructure.Mapper.Spotify;

namespace backend.Infrastructure.Provider.Spotify;

public class SpotifyProviderClient : IProviderClient {
  private readonly IConfiguration _configuration;
  private readonly HttpClient _http;

  public SpotifyProviderClient(HttpClient http, IConfiguration configuration) {
    _http = http;
    _configuration = configuration;
  }

  public OAuthProvider Provider => OAuthProvider.Spotify;

  public string GetLoginUrl() {
    string? clientId = _configuration["Spotify:ClientId"];
    string? redirectUri = _configuration["Spotify:RedirectUri"];
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

  public async Task<TokenInfo> ExchangeCodeAsync(string code) {
    string? clientId = _configuration["Spotify:ClientId"];
    string? clientSecret = _configuration["Spotify:ClientSecret"];
    string? redirectUri = _configuration["Spotify:RedirectUri"];

    FormUrlEncodedContent content = new(new Dictionary<string, string> {
      ["code"] = code,
      ["redirect_uri"] = redirectUri!,
      ["grant_type"] = "authorization_code"
    });

    HttpRequestMessage request = new(HttpMethod.Post, "https://accounts.spotify.com/api/token") {
      Content = content
    };

    string encodedAuthorizationCode =
      Convert.ToBase64String(Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}"));
    request.Headers.Authorization =
      new AuthenticationHeaderValue("Basic", encodedAuthorizationCode);

    HttpResponseMessage response = await _http.SendAsync(request);
    response.EnsureSuccessStatusCode();

    string json = await response.Content.ReadAsStringAsync();
    SpotifyTokenResponse tokenResponse = JsonSerializer.Deserialize<SpotifyTokenResponse>(json)!;

    ProviderProfile profile = await GetProfileAsync(tokenResponse.AccessToken);

    return SpotifyOAuthMapper.ToTokenInfo(tokenResponse, profile.Id);
  }

  public async Task<TokenRefreshInfo> RefreshTokenAsync(string refreshToken) {
    string? clientId = _configuration["Spotify:ClientId"];
    string? clientSecret = _configuration["Spotify:ClientSecret"];

    FormUrlEncodedContent content = new(new Dictionary<string, string> {
      ["grant_type"] = "refresh_token",
      ["refresh_token"] = refreshToken
    });

    HttpRequestMessage request = new(HttpMethod.Post, "https://accounts.spotify.com/api/token") {
      Content = content
    };

    string encodedCredentials =
      Convert.ToBase64String(Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}"));
    request.Headers.Authorization = new AuthenticationHeaderValue("Basic", encodedCredentials);

    HttpResponseMessage response = await _http.SendAsync(request);

    if (!response.IsSuccessStatusCode) {
      string error = await response.Content.ReadAsStringAsync();
      throw new HttpRequestException($"Spotify refresh failed ({response.StatusCode}): {error}");
    }

    string json = await response.Content.ReadAsStringAsync();
    SpotifyTokenRefreshResponse tokenResponse =
      JsonSerializer.Deserialize<SpotifyTokenRefreshResponse>(json)!;

    return SpotifyOAuthMapper.ToTokenRefreshInfo(tokenResponse);
  }

  public async Task<ProviderProfile> GetProfileAsync(string accessToken) {
    HttpRequestMessage request =
      new(HttpMethod.Get, "https://api.spotify.com/v1/me");
    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

    HttpResponseMessage response = await _http.SendAsync(request);
    response.EnsureSuccessStatusCode();

    string json = await response.Content.ReadAsStringAsync();

    SpotifyUserInfoResponse responseProfile =
      JsonSerializer.Deserialize<SpotifyUserInfoResponse>(json)!;

    ProviderProfile profile = SpotifyProfileMapper.ToProviderProfile(responseProfile);

    return profile;
  }

  public Task DisconnectAsync(string refreshToken) {
    throw new NotImplementedException();
  }
}