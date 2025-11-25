using System.Net.Http.Headers;
using System.Text.Json;
using backend.Application.Interface;
using backend.Application.Model;
using backend.Domain.Enum;
using backend.Infrastructure.DTO.Google;
using backend.Infrastructure.Mapper.Google;

namespace backend.Infrastructure.Provider.Google;

public class GoogleProviderClient : IProviderClient {
  private readonly IConfiguration _configuration;
  private readonly HttpClient _http;
  private readonly ITokenService _tokenService;

  public GoogleProviderClient(IHttpClientFactory http, IConfiguration configuration,
    ITokenService tokenService) {
    _http = http.CreateClient();
    _configuration = configuration;
    _tokenService = tokenService;
  }

  public OAuthProvider Provider => OAuthProvider.Google;

  public string GetLoginUrl() {
    string clientId = _configuration["Google:ClientId"];
    string redirectUri = _configuration["Google:RedirectUri"];
    string scope = "https://www.googleapis.com/auth/youtube " +
                   "https://www.googleapis.com/auth/youtube.force-ssl " +
                   "https://www.googleapis.com/auth/userinfo.email " +
                   "https://www.googleapis.com/auth/userinfo.profile";
    string state = Guid.NewGuid().ToString();

    return $"https://accounts.google.com/o/oauth2/v2/auth?" +
           $"client_id={clientId}&redirect_uri={redirectUri}&" +
           $"response_type=code&scope={scope}&access_type=offline&" +
           $"prompt=consent&state={state}";
  }

  public async Task<TokenInfo> ExchangeCodeAsync(string code) {
    string? clientId = _configuration["Google:ClientId"];
    string? clientSecret = _configuration["Google:ClientSecret"];
    string? redirectUri = _configuration["Google:RedirectUri"];

    FormUrlEncodedContent content = new(new Dictionary<string, string> {
      ["code"] = code,
      ["client_id"] = clientId!,
      ["client_secret"] = clientSecret!,
      ["redirect_uri"] = redirectUri!,
      ["grant_type"] = "authorization_code"
    });

    HttpResponseMessage response =
      await _http.PostAsync("https://oauth2.googleapis.com/token", content);


    response.EnsureSuccessStatusCode();


    string json = await response.Content.ReadAsStringAsync();
    GoogleTokenResponse tokenResponse = JsonSerializer.Deserialize<GoogleTokenResponse>(json)!;

    string? sub = _tokenService.GetClaimFromToken(tokenResponse.IdToken, "sub");

    if (string.IsNullOrEmpty(sub)) {
      throw new InvalidOperationException("ID token is required for Google login.");
    }

    return GoogleOAuthMapper.ToTokenInfo(tokenResponse, sub);
  }

  public async Task<TokenRefreshInfo> RefreshTokenAsync(string refreshToken) {
    string? clientId = _configuration["Google:ClientId"];
    string? clientSecret = _configuration["Google:ClientSecret"];

    FormUrlEncodedContent content = new(new Dictionary<string, string> {
      ["client_id"] = clientId!,
      ["client_secret"] = clientSecret!,
      ["refresh_token"] = refreshToken,
      ["grant_type"] = "refresh_token"
    });

    HttpResponseMessage response =
      await _http.PostAsync("https://oauth2.googleapis.com/token", content);

    if (!response.IsSuccessStatusCode) {
      string error = await response.Content.ReadAsStringAsync();
      throw new HttpRequestException($"Google refresh failed ({response.StatusCode}): {error}");
    }

    response.EnsureSuccessStatusCode();

    string json = await response.Content.ReadAsStringAsync();
    GoogleTokenRefreshResponse tokenResponse =
      JsonSerializer.Deserialize<GoogleTokenRefreshResponse>(json)!;

    return GoogleOAuthMapper.ToTokenRefreshInfo(tokenResponse);
  }

  public async Task<ProviderProfile> GetProfileAsync(string accessToken) {
    HttpRequestMessage request =
      new(HttpMethod.Get, "https://www.googleapis.com/oauth2/v3/userinfo");
    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

    HttpResponseMessage response = await _http.SendAsync(request);
    response.EnsureSuccessStatusCode();

    string json = await response.Content.ReadAsStringAsync();

    GoogleUserInfoResponse responseProfile =
      JsonSerializer.Deserialize<GoogleUserInfoResponse>(json)!;

    ProviderProfile profile = GoogleProfileMapper.ToProviderProfile(responseProfile);

    return profile;
  }

  public async Task DisconnectAsync(string refreshToken) {
    Dictionary<string, string> requestBody = new() {
      { "token", refreshToken }
    };

    HttpResponseMessage response = await _http.PostAsync(
      "https://oauth2.googleapis.com/revoke",
      new FormUrlEncodedContent(requestBody)
    );

    response.EnsureSuccessStatusCode();
  }

  public async Task<List<ProviderTrack>> Search(string accessKey, string query) {
    string? apiKey = _configuration["Google:ApiKey"];
    if (string.IsNullOrWhiteSpace(apiKey)) {
      throw new InvalidOperationException("YouTube API key is required for search.");
    }

    string url =
      $"https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q={Uri.EscapeDataString(query)}&key={apiKey}";

    HttpResponseMessage response = await _http.GetAsync(url);
    response.EnsureSuccessStatusCode();

    string json = await response.Content.ReadAsStringAsync();
    YouTubeSearchResult result = JsonSerializer.Deserialize<YouTubeSearchResult>(json)!;

    return GooglePlaylistMapper.ToProviderTracksFromSearch(result);
  }
}