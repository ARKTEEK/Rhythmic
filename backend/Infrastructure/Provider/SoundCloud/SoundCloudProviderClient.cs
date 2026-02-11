using System.Net.Http.Headers;
using System.Text.Json;

using backend.Application.Interface.ExternalProvider;
using backend.Application.Model.Provider;
using backend.Domain.Enum;
using backend.Infrastructure.DTO.SoundCloud;
using backend.Infrastructure.Mapper.SoundCloud;
using backend.Infrastructure.Utils;

using Microsoft.AspNetCore.WebUtilities;

namespace backend.Infrastructure.Provider.SoundCloud;

public class SoundCloudProviderClient : IProviderClient {
  private readonly IConfiguration _configuration;
  private readonly HttpClient _http;
  private readonly IHttpContextAccessor _httpContextAccessor;

  public SoundCloudProviderClient(HttpClient http, IHttpContextAccessor httpContextAccessor,
    IConfiguration configuration) {
    _http = http;
    _configuration = configuration;
    _httpContextAccessor = httpContextAccessor;
  }

  public OAuthProvider Provider => OAuthProvider.SoundCloud;

  public string GetLoginUrl() {
    string verifier = Pkce.GenerateVerifier();
    string challenge = Pkce.GenerateChallenge(verifier);
    string state = Guid.NewGuid().ToString();

    ISession session = _httpContextAccessor.HttpContext?.Session;
    session?.SetString("sc_verifier", verifier);
    session?.SetString("sc_state", state);

    Dictionary<string, string?> query = new() {
      ["client_id"] = _configuration["SoundCloud:ClientId"],
      ["redirect_uri"] = _configuration["SoundCloud:RedirectUri"],
      ["response_type"] = "code",
      ["scope"] = "non-expiring",
      ["state"] = state,
      ["code_challenge"] = challenge,
      ["code_challenge_method"] = "S256"
    };

    return QueryHelpers.AddQueryString("https://secure.soundcloud.com/authorize", query);
  }

  public async Task<TokenInfo> ExchangeCodeAsync(string code) {
    HttpContext context = _httpContextAccessor.HttpContext;
    ISession session = context?.Session;

    string? returnedState = context?.Items["returned_state"] as string;

    string? savedVerifier = session?.GetString("sc_verifier");
    string? savedState = session?.GetString("sc_state");

    if (string.IsNullOrEmpty(savedVerifier)) {
      throw new UnauthorizedAccessException(
        "Session expired: Verifier not found in session cookie.");
    }

    if (string.IsNullOrEmpty(returnedState) || returnedState != savedState) {
      throw new UnauthorizedAccessException("OAuth state mismatch: CSRF protection failed.");
    }

    if (string.IsNullOrEmpty(savedVerifier) || returnedState != savedState) {
      throw new UnauthorizedAccessException("OAuth state mismatch or session expired.");
    }

    FormUrlEncodedContent body = new(new Dictionary<string, string> {
      ["client_id"] = _configuration["SoundCloud:ClientId"]!,
      ["client_secret"] = _configuration["SoundCloud:ClientSecret"]!,
      ["grant_type"] = "authorization_code",
      ["redirect_uri"] = _configuration["SoundCloud:RedirectUri"]!,
      ["code"] = code,
      ["code_verifier"] = savedVerifier
    });

    HttpResponseMessage response =
      await _http.PostAsync("https://secure.soundcloud.com/oauth/token", body);

    if (!response.IsSuccessStatusCode) {
      string error = await response.Content.ReadAsStringAsync();
      throw new Exception($"SoundCloud Token Error: {error}");
    }

    string json = await response.Content.ReadAsStringAsync();
    SoundCloudTokenResponse tokenResponse =
      JsonSerializer.Deserialize<SoundCloudTokenResponse>(json)!;

    session?.Remove("sc_verifier");
    session?.Remove("sc_state");

    ProviderProfile profile = await GetProfileAsync(tokenResponse.AccessToken);

    return SoundCloudOAuthMapper.ToTokenInfo(tokenResponse, profile.Id);
  }

  public async Task<TokenRefreshInfo> RefreshTokenAsync(string refreshToken) {
    string? clientId = _configuration["SoundCloud:ClientId"];
    string? clientSecret = _configuration["SoundCloud:ClientSecret"];

    Dictionary<string, string> dict = new() {
      ["client_id"] = clientId!,
      ["client_secret"] = clientSecret!,
      ["grant_type"] = "refresh_token",
      ["refresh_token"] = refreshToken
    };

    HttpResponseMessage response =
      await _http.PostAsync("https://secure.soundcloud.com/oauth/token",
        new FormUrlEncodedContent(dict));

    if (!response.IsSuccessStatusCode) {
      string error = await response.Content.ReadAsStringAsync();
      throw new HttpRequestException($"SoundCloud refresh failed: {error}");
    }

    string json = await response.Content.ReadAsStringAsync();
    SoundCloudTokenRefreshResponse tokenResponse =
      JsonSerializer.Deserialize<SoundCloudTokenRefreshResponse>(json)!;

    return SoundCloudOAuthMapper.ToTokenRefreshInfo(tokenResponse);
  }

  public async Task<ProviderProfile> GetProfileAsync(string accessToken) {
    HttpRequestMessage request = new(HttpMethod.Get, "https://api.soundcloud.com/me");
    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

    HttpResponseMessage response = await _http.SendAsync(request);
    response.EnsureSuccessStatusCode();

    string json = await response.Content.ReadAsStringAsync();
    SoundCloudUserResponse
      scProfile = JsonSerializer.Deserialize<SoundCloudUserResponse>(json)!;

    return SoundCloudProfileMapper.ToProviderProfile(scProfile);
  }

  public async Task DisconnectAsync(string refreshToken) {
    await Task.CompletedTask;
  }

  public async Task<List<ProviderTrack>> Search(string accessToken, string query) {
    string url =
      $"https://api.soundcloud.com/tracks?q={Uri.EscapeDataString(query)}&linked_partitioning=1&limit=20";

    HttpRequestMessage request = new(HttpMethod.Get, url);
    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

    HttpResponseMessage response = await _http.SendAsync(request);

    if (!response.IsSuccessStatusCode) {
      string error = await response.Content.ReadAsStringAsync();
      throw new Exception($"SoundCloud Search Failed: {response.StatusCode} - {error}");
    }

    SoundCloudCollectionResponse<SoundCloudTrack> data = await response.Content
      .ReadFromJsonAsync<SoundCloudCollectionResponse<SoundCloudTrack>>();

    if (data?.Collection == null) {
      return new List<ProviderTrack>();
    }

    return data.Collection
      .Select((track, index) => SoundCloudPlaylistMapper.ToProviderTrack(track, null, index))
      .ToList();
  }
}