using backend.Application.Interface.InternalAuth;
using backend.Application.Model.Provider;
using backend.Domain.Entity;

using Microsoft.AspNetCore.Identity;

namespace backend.Application.Service.InternalAuth;

public class UserProfileService : IUserProfileService {
  private readonly UserManager<User> _userManager;

  public UserProfileService(UserManager<User> userManager) {
    _userManager = userManager;
  }

  public async Task<bool> UpdateProfileAsync(string userId, UpdateProfileRequest request) {
    User user = await _userManager.FindByIdAsync(userId);
    if (user == null) {
      return false;
    }

    bool updated = false;

    if (!string.IsNullOrWhiteSpace(request.Username) && request.Username != user.UserName) {
      IdentityResult setUsernameResult =
        await _userManager.SetUserNameAsync(user, request.Username);
      if (!setUsernameResult.Succeeded) {
        throw new Exception(
          $"Failed to update username: {string.Join(", ", setUsernameResult.Errors.Select(e => e.Description))}");
      }

      updated = true;
    }

    if (!string.IsNullOrWhiteSpace(request.Email) && request.Email != user.Email) {
      IdentityResult setEmailResult = await _userManager.SetEmailAsync(user, request.Email);
      if (!setEmailResult.Succeeded) {
        throw new Exception(
          $"Failed to update email: {string.Join(", ", setEmailResult.Errors.Select(e => e.Description))}");
      }

      updated = true;
    }

    return updated;
  }

  public async Task<bool> ChangePasswordAsync(string userId, ChangePasswordRequest request) {
    User user = await _userManager.FindByIdAsync(userId);
    if (user == null) {
      return false;
    }

    IdentityResult result =
      await _userManager.ChangePasswordAsync(user, request.CurrentPassword,
        request.NewPassword);
    if (!result.Succeeded) {
      throw new Exception(
        $"Failed to change password: {string.Join(", ", result.Errors.Select(e => e.Description))}");
    }

    return true;
  }
}