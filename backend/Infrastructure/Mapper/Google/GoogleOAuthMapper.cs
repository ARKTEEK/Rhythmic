using backend.Application.Model;
using backend.Domain.Entity;
using backend.Infrastructure.DTO;

namespace backend.Infrastructure.Mapper;

public static class GoogleOAuthMapper {
  public static TokenInfo ToTokenInfo(GoogleTokenResponse response, string id) =>
    new() {
      Id = id,
      AccessToken = response.AccessToken,
      ExpiresIn = response.ExpiresIn,
      RefreshToken = response.RefreshToken,
      TokenType = response.TokenType,
      Scope = response.Scope,
    };

  public static TokenRefreshInfo ToTokenRefreshInfo(GoogleTokenRefreshResponse response) =>
    new() {
      AccessToken = response.AccessToken,
      ExpiresIn = response.ExpiresIn,
      Scope = response.Scope,
      TokenType = response.TokenType,
    };

  public static TokenInfo ToTokenInfo(AccountToken token) =>
    new() {
      AccessToken = token.AccessToken,
      RefreshToken = token.RefreshToken,
      ExpiresIn = (int)(token.ExpiresAt - DateTime.UtcNow).TotalSeconds,
      Scope = token.Scope,
      TokenType = token.TokenType,
    };
}