using backend.Application.Model.Provider;
using backend.Infrastructure.DTO.SoundCloud;

namespace backend.Infrastructure.Mapper.SoundCloud;

public static class SoundCloudOAuthMapper {
  public static TokenInfo ToTokenInfo(SoundCloudTokenResponse response, string userId) {
    return new TokenInfo {
      Id = userId,
      AccessToken = response.AccessToken,
      TokenType = response.TokenType,
      Scope = response.Scope,
      ExpiresIn = response.ExpiresIn,
      RefreshToken = response.RefreshToken
    };
  }

  public static TokenRefreshInfo ToTokenRefreshInfo(SoundCloudTokenRefreshResponse response) {
    return new TokenRefreshInfo {
      AccessToken = response.AccessToken,
      RefreshToken = response.RefreshToken,
      TokenType = response.TokenType,
      Scope = response.Scope,
      ExpiresIn = response.ExpiresIn
    };
  }
}