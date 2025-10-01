using backend.Application.Model;
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
}