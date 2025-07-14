using backend.DataEntity.Auth;

namespace backend.Services;

public interface IGoogleAuthService {
  string GetGoogleLoginUrl();
  Task<GoogleTokenResponse> ExchangeCodeForTokenAsync(string code);
  Task<GoogleTokenResponse> RefreshTokenAsync(string refreshToken);
}