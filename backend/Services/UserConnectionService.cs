using backend.DataEntity.Auth;
using backend.Entity;
using backend.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class UserConnectionService : IUserConnectionService {
  private readonly AppDbContext _dbContext;

  public UserConnectionService(AppDbContext dbContext) {
    _dbContext = dbContext;
  }

  public async Task<UserConnection?> GetUserConnectionAsync(string userId, OAuthProvider provider) {
    return await _dbContext.UserConnections
      .FirstOrDefaultAsync(c => c != null && c.UserId == userId && c.Provider == provider);
  }

  public async Task SaveOrUpdateUserConnectionAsync(string userId, GoogleTokenResponse response) {
    var existingConnection = await GetUserConnectionAsync(userId, OAuthProvider.Google);

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