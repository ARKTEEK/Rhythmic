using backend.DataEntity.Auth;
using backend.Entity;
using backend.Enums;
using Microsoft.AspNetCore.Identity;

namespace backend.Services;

public class UserService : IUserService {
  private readonly IGoogleAuthService _googleAuthService;
  private readonly IUserConnectionService _userConnectionService;
  private readonly UserManager<User> _userManager;

  public UserService(UserManager<User> userManager, IGoogleAuthService googleAuthService,
    IUserConnectionService userConnectionService) {
    _userConnectionService = userConnectionService;
    _googleAuthService = googleAuthService;
    _userManager = userManager;
  }

  public async Task SaveGoogleTokensAsync(string userId, GoogleTokenResponse response) {
    User? user = await _userManager.FindByIdAsync(userId);

    if (user == null) {
      throw new Exception("User not found");
    }

    await _userConnectionService.SaveOrUpdateUserConnectionAsync(userId, response);
  }

  public async Task RefreshGoogleTokensAsync(string userId) {
    User? user = await _userManager.FindByIdAsync(userId);

    if (user == null) {
      throw new Exception($"User with ID {userId} not found.");
    }

    UserConnection? connection =
      await _userConnectionService.GetUserConnectionAsync(userId, OAuthProvider.Google);

    if (connection.ExpiresAt > DateTime.UtcNow.AddSeconds(60)) {
      return;
    }

    if (connection?.RefreshToken == null) {
      throw new Exception("Refresh token is missing.");
    }

    GoogleTokenResponse newToken =
      await _googleAuthService.RefreshTokenAsync(connection.RefreshToken);

    await _userConnectionService.SaveOrUpdateUserConnectionAsync(userId, newToken);
  }
}