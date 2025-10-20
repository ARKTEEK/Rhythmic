using backend.Application.Model;
using backend.Domain.Entity;
using backend.Infrastructure.DTO.Google;

namespace backend.Infrastructure.Mapper.Google;

public static class GoogleOAuthMapper {
  public static TokenInfo ToTokenInfo(GoogleTokenResponse response, string id) {
    return new TokenInfo {
      Id = id,
      AccessToken = response.AccessToken,
      ExpiresIn = response.ExpiresIn,
      RefreshToken = response.RefreshToken,
      TokenType = response.TokenType,
      Scope = response.Scope
    };
  }

  public static TokenRefreshInfo ToTokenRefreshInfo(GoogleTokenRefreshResponse response) {
    return new TokenRefreshInfo {
      AccessToken = response.AccessToken,
      ExpiresIn = response.ExpiresIn,
      Scope = response.Scope,
      TokenType = response.TokenType
    };
  }

  public static TokenInfo ToTokenInfo(AccountToken token) {
    return new TokenInfo {
      AccessToken = token.AccessToken,
      RefreshToken = token.RefreshToken,
      ExpiresIn = (int)(token.ExpiresAt - DateTime.UtcNow).TotalSeconds,
      Scope = token.Scope,
      TokenType = token.TokenType
    };
  }
}