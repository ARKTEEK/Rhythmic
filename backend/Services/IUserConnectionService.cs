using backend.DataEntity.Auth;
using backend.Entity;
using backend.Enums;

namespace backend.Services;

public interface IUserConnectionService {
  Task<UserConnection?> GetUserConnectionAsync(string userId, OAuthProvider provider);
  Task SaveOrUpdateUserConnectionAsync(string userId, GoogleTokenResponse response);
}