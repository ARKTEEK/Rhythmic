using backend.Application.Model;
using backend.Infrastructure.DTO;

namespace backend.Infrastructure.Mapper;

public static class SpotifyOAuthMapper {
  public static TokenInfo ToTokenInfo(SpotifyTokenResponse response, string id) =>
    new() {
      Id = id,
      AccessToken = response.AccessToken,
      ExpiresIn = response.ExpiresIn,
      Scope = response.Scope,
      RefreshToken = response.RefreshToken,
      TokenType = response.TokenType,
    };
}