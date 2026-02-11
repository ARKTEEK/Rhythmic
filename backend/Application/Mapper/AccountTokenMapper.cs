using backend.Application.Model.Provider;
using backend.Domain.Entity;
using backend.Domain.Enum;

namespace backend.Application.Mapper;

public static class AccountTokenMapper {
  public static AccountToken ToEntity(this TokenInfo tokenInfo, string userId,
    OAuthProvider provider) {
    return new AccountToken {
      Id = tokenInfo.Id,
      UserId = userId,
      Provider = provider,
      AccessToken = tokenInfo.AccessToken,
      RefreshToken = tokenInfo.RefreshToken,
      ExpiresAt = DateTime.UtcNow.AddSeconds(tokenInfo.ExpiresIn),
      Scope = tokenInfo.Scope,
      TokenType = tokenInfo.TokenType
    };
  }
}