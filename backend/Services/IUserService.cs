using backend.DataEntity.Auth;

namespace backend.Services;

public interface IUserService {
  Task SaveGoogleTokensAsync(string userId, GoogleTokenResponse response);
}