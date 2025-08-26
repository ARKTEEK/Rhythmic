using backend.DataEntity.OAuth;
using backend.Entity;
using backend.Enums;
using backend.Services.Core;

namespace backend.Services.User;

public interface IUserConnectionService {
  Task RefreshTokenAsync<TUserInfo, TTokenResponse>(
    string userId,
    OAuthProvider provider,
    IOAuthService<TUserInfo, TTokenResponse> oauthService)
    where TTokenResponse : OAuthTokenResponse;

  Task DeleteUserConnectionAsync(string userId, OAuthProvider provider);

  Task<UserConnection?> GetUserConnectionAsync(string userId, OAuthProvider provider);

  Task<List<UserConnection?>> GetAllUserConnectionsAsync(string userId);

  Task SaveUserConnectionAsync<TTokenResponse>(
    string userId,
    TTokenResponse token,
    OAuthProvider provider)
    where TTokenResponse : OAuthTokenResponse;
}