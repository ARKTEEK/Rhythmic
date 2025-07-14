using backend.DataEntity.Auth;
using backend.Entity;
using Microsoft.AspNetCore.Identity;

namespace backend.Services;

public class UserService : IUserService {
  private readonly IUserConnectionService _userConnectionService;
  private readonly UserManager<User> _userManager;

  public UserService(UserManager<User> userManager,
    IUserConnectionService userConnectionService) {
    _userConnectionService = userConnectionService;
    _userManager = userManager;
  }

  public async Task SaveGoogleTokensAsync(string userId, GoogleTokenResponse response) {
    User? user = await _userManager.FindByIdAsync(userId);

    if (user == null) {
      throw new Exception("User not found");
    }

    await _userConnectionService.SaveOrUpdateUserConnectionAsync(userId, response);
  }
}