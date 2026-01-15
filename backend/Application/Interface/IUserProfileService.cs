using backend.Application.Model;

namespace backend.Application.Interface;

public interface IUserProfileService {
  Task<bool> UpdateProfileAsync(string userId, UpdateProfileRequest request);
  Task<bool> ChangePasswordAsync(string userId, ChangePasswordRequest request);
}

