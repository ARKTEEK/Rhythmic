using backend.Application.Model.Provider;
using backend.Infrastructure.DTO.Spotify;

namespace backend.Infrastructure.Mapper.Spotify;

public static class SpotifyOAuthMapper {
  public static TokenInfo ToTokenInfo(SpotifyTokenResponse response, string id) {
    return new TokenInfo {
      Id = id,
      AccessToken = response.AccessToken,
      ExpiresIn = response.ExpiresIn,
      Scope = response.Scope,
      RefreshToken = response.RefreshToken,
      TokenType = response.TokenType
    };
  }

  public static TokenRefreshInfo ToTokenRefreshInfo(SpotifyTokenRefreshResponse response) {
    return new TokenRefreshInfo {
      AccessToken = response.AccessToken,
      ExpiresIn = response.ExpiresIn,
      Scope = response.Scope,
      TokenType = response.TokenType
    };
  }
}