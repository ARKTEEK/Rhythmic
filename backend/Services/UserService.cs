using backend.DataEntity.Auth;
using backend.Entity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class UserService : IUserService {
  private readonly UserManager<User> _userManager;
  private readonly AppDbContext _dbContext;

  public UserService(UserManager<User> userManager, AppDbContext dbContext) {
    _userManager = userManager;
    _dbContext = dbContext;
  }

  public async Task SaveGoogleTokens(string userId, GoogleTokenResponse response) {
    var user = await _userManager.FindByIdAsync(userId);

    if (user == null)
      throw new Exception("User not found");

    var existingConnection = await _dbContext.UserConnections
      .FirstOrDefaultAsync(c => c.UserId == userId && c.Provider == "Google");

    if (existingConnection != null) {
      existingConnection.AccessToken = response.AccessToken;
      existingConnection.RefreshToken =
        response.RefreshToken ??
        existingConnection.RefreshToken;
      existingConnection.ExpiresAt = DateTime.UtcNow.AddSeconds(response.ExpiresIn);
      existingConnection.Scope = response.Scope;
      existingConnection.TokenType = response.TokenType;
    }
    else {
      var connection = new UserConnection {
        UserId = userId,
        Provider = "Google",
        AccessToken = response.AccessToken,
        RefreshToken = response.RefreshToken,
        ExpiresAt = DateTime.UtcNow.AddSeconds(response.ExpiresIn),
        Scope = response.Scope,
        TokenType = response.TokenType
      };
      _dbContext.UserConnections.Add(connection);
    }

    await _dbContext.SaveChangesAsync();
  }
}