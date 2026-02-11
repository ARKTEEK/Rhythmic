using backend.Application.Model.Provider;

namespace backend.Application.Interface.InternalAuth;

public interface IUserProfileService {
  Task<bool> UpdateProfileAsync(string userId, UpdateProfileRequest request);
  Task<bool> ChangePasswordAsync(string userId, ChangePasswordRequest request);
}