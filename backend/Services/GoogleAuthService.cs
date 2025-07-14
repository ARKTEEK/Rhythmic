using System.Text.Json;
using backend.DataEntity.Auth;

namespace backend.Services;

public class GoogleAuthService : IGoogleAuthService {
  private readonly IConfiguration _configuration;
  private readonly IHttpClientFactory _httpClientFactory;

  public GoogleAuthService(IConfiguration configuration, IHttpClientFactory httpClientFactory) {
    _configuration = configuration;
    _httpClientFactory = httpClientFactory;
  }

  public string GetGoogleLoginUrl() {
    string? clientId = _configuration["Google:ClientId"];
    string? redirectUrl = _configuration["Google:RedirectUri"];
    string scope = "https://www.googleapis.com/auth/youtube.force-ssl";
    string state = Guid.NewGuid().ToString();

    return $"https://accounts.google.com/o/oauth2/v2/auth?" +
           $"client_id={clientId}&redirect_uri={redirectUrl}&" +
           $"response_type=code&scope={scope}&access_type=offline&" +
           $"prompt=consent&state={state}";
  }

  public async Task<GoogleTokenResponse> ExchangeCodeForTokenAsync(string code) {
    string? clientId = _configuration["Google:ClientId"];
    string? clientSecret = _configuration["Google:ClientSecret"];
    string? redirectUri = _configuration["Google:RedirectUri"];

    if (string.IsNullOrWhiteSpace(clientId)) {
      throw new InvalidOperationException("Google:ClientId configuration is missing.");
    }

    if (string.IsNullOrWhiteSpace(clientSecret)) {
      throw new InvalidOperationException("Google:ClientSecret configuration is missing.");
    }

    if (string.IsNullOrWhiteSpace(redirectUri)) {
      throw new InvalidOperationException("Google:RedirectUri configuration is missing.");
    }

    HttpClient httpClient = _httpClientFactory.CreateClient();
    FormUrlEncodedContent tokenContent = new(new Dictionary<string, string> {
      ["code"] = code,
      ["client_id"] = clientId,
      ["client_secret"] = clientSecret,
      ["redirect_uri"] = redirectUri,
      ["grant_type"] = "authorization_code"
    });

    HttpResponseMessage tokenResponse =
      await httpClient.PostAsync("https://oauth2.googleapis.com/token", tokenContent);

    if (!tokenResponse.IsSuccessStatusCode) {
      throw new Exception("Google Code exchange for Token failed.");
    }

    string json = await tokenResponse.Content.ReadAsStringAsync();
    GoogleTokenResponse? tokens = JsonSerializer.Deserialize<GoogleTokenResponse>(json);

    if (tokens == null || string.IsNullOrEmpty(tokens.AccessToken)) {
      throw new Exception("Google Token response is empty or null.");
    }

    return tokens;
  }
}