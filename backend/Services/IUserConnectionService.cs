using backend.DataEntity.Auth;
using backend.Entity;
using backend.Enums;

namespace backend.Services;

public interface IUserConnectionService {
  Task RefreshGoogleTokenAsync(string userId);
  Task DeleteUserConnectionAsync(string userId, OAuthProvider provider);
  Task<UserConnection?> GetUserConnectionAsync(string userId, OAuthProvider provider);
  Task SaveUserConnectionAsync(string userId, GoogleTokenResponse response);
}