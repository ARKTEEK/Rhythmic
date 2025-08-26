using backend.DataEntity;
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

  public async Task<List<UserConnection?>> GetAllUserConnectionsAsync(string userId) {
    return await _dbContext.UserConnections
      .Where(c => c != null && c.UserId == userId).ToListAsync();
  }

  public async Task DeleteUserConnectionAsync(string userId, OAuthProvider provider) {
    UserConnection? existingConnection = await GetUserConnectionAsync(userId, provider);

    if (existingConnection == null) {
      return;
    }

    _dbContext.UserConnections.Remove(existingConnection);
    await _dbContext.SaveChangesAsync();
  }

  public async Task RefreshTokenAsync<TUserInfo, TTokenResponse>(
    string userId,
    OAuthProvider provider,
    IOAuthService<TUserInfo, TTokenResponse> oauthService)
    where TTokenResponse : OAuthTokenResponse {
    UserConnection? userConnection = await GetUserConnectionAsync(userId, provider);
    if (userConnection == null) {
      return;
    }

    if (userConnection.ExpiresAt > DateTime.UtcNow.AddSeconds(60)) {
      return;
    }

    if (string.IsNullOrWhiteSpace(userConnection.RefreshToken)) {
      throw new Exception("Refresh token is missing");
    }

    TTokenResponse newToken = await oauthService.RefreshTokenAsync(userConnection.RefreshToken);
    await SaveUserConnectionAsync(userId, newToken, provider);
  }

  public async Task SaveUserConnectionAsync<TTokenResponse>(
    string userId,
    TTokenResponse token,
    OAuthProvider provider)
    where TTokenResponse : OAuthTokenResponse {
    UserConnection? existingConnection = await GetUserConnectionAsync(userId, provider);

    if (existingConnection != null) {
      existingConnection.AccessToken = token.AccessToken;
      existingConnection.RefreshToken = token.RefreshToken;
      existingConnection.ExpiresAt = DateTime.UtcNow.AddSeconds(token.ExpiresIn);
      existingConnection.Scope = token.Scope;
      existingConnection.TokenType = token.TokenType;
    } else {
      UserConnection connection = new() {
        UserId = userId,
        Provider = provider,
        AccessToken = token.AccessToken,
        RefreshToken = token.RefreshToken,
        ExpiresAt = DateTime.UtcNow.AddSeconds(token.ExpiresIn),
        Scope = token.Scope,
        TokenType = token.TokenType
      };
      _dbContext.UserConnections.Add(connection);
    }

    await _dbContext.SaveChangesAsync();
  }
}