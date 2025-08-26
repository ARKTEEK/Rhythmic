using backend.DataEntity.OAuth;

namespace backend.Services.Core;

public interface IOAuthService<TUserInfo, TTokenResponse>
  where TTokenResponse : OAuthTokenResponse {
  string GetLoginUrl();
  Task<TTokenResponse> ExchangeCodeForTokenAsync(string code);
  Task<TTokenResponse> RefreshTokenAsync(string refreshToken);
  Task<TUserInfo> GetUserInfoAsync(string accessToken);
}