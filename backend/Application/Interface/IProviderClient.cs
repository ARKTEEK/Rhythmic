using backend.Application.Model;
using backend.Domain.Enum;

namespace backend.Application.Interface;

public interface IProviderClient {
  OAuthProvider Provider { get; }

  string GetLoginUrl();
  Task<TokenInfo> ExchangeCodeAsync(string code);
  Task<TokenInfo> RefreshTokenAsync(string refreshToken);
  Task<ProviderProfile> GetProfileAsync(string accessToken);
}