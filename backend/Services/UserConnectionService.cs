using backend.DataEntity.Auth;
using backend.Entity;
using backend.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class UserConnectionService : IUserConnectionService {
  private readonly IGoogleAuthService _googleAuthService;
  private readonly AppDbContext _dbContext;

  public UserConnectionService(AppDbContext dbContext, IGoogleAuthService googleAuthService) {
    _dbContext = dbContext;
    _googleAuthService = googleAuthService;
  }

  public async Task<UserConnection?> GetUserConnectionAsync(string userId, OAuthProvider provider) {
    return await _dbContext.UserConnections
      .FirstOrDefaultAsync(c => c != null && c.UserId == userId && c.Provider == provider);
  }

  public async Task DeleteUserConnectionAsync(string userId, OAuthProvider provider) {
    UserConnection? existingConnection = await GetUserConnectionAsync(userId, OAuthProvider.Google);

    if (existingConnection == null) {
      return;
    }

    _dbContext.UserConnections.Remove(existingConnection);
  }

  public async Task RefreshGoogleTokenAsync(string userId) {
    UserConnection? userConnection = await GetUserConnectionAsync(userId, OAuthProvider.Google);

    if (userConnection == null) {
      return;
    }

    if (userConnection.ExpiresAt > DateTime.UtcNow.AddSeconds(60)) {
      return;
    }

    if (userConnection.RefreshToken == null) {
      throw new Exception("Refresh token is missing");
    }

    GoogleTokenResponse newToken =
      await _googleAuthService.RefreshTokenAsync(userConnection.RefreshToken);

    await SaveUserConnectionAsync(userId, newToken);
  }

  public async Task SaveUserConnectionAsync(string userId, GoogleTokenResponse response) {
    UserConnection? existingConnection = await GetUserConnectionAsync(userId, OAuthProvider.Google);

    if (existingConnection != null) {
      existingConnection.AccessToken = response.AccessToken;
      existingConnection.RefreshToken =
        response.RefreshToken ??
        existingConnection.RefreshToken;
      existingConnection.ExpiresAt = DateTime.UtcNow.AddSeconds(response.ExpiresIn);
      existingConnection.Scope = response.Scope;
      existingConnection.TokenType = response.TokenType;
    } else {
      UserConnection? connection = new() {
        UserId = userId,
        Provider = OAuthProvider.Google,
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