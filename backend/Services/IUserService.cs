using backend.DataEntity.Auth;

namespace backend.Services;

public interface IUserService {
  Task SaveGoogleTokens(string userId, GoogleTokenResponse response);
}