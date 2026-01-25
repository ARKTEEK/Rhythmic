using backend.Application.Model;

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
      TokenType = response.TokenType,
      Scope = response.Scope,
      ExpiresIn = response.ExpiresIn
    };
  }
}
