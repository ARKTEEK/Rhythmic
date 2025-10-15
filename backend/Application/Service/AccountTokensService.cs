using backend.Application.Interface;
using backend.Application.Model;
using backend.Domain.Entity;
using backend.Domain.Enum;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Service;

public class AccountTokensService : IAccountTokensService {
  private readonly DatabaseContext _db;
  private readonly IProviderFactory _providerFactory;

  public AccountTokensService(DatabaseContext db, IProviderFactory providerFactory) {
    _db = db;
    _providerFactory = providerFactory;
  }

  public async Task<AccountToken> GetAccountToken(string providerId, OAuthProvider provider) {
    AccountToken? accountToken =
      await _db.AccountTokens.FirstOrDefaultAsync(x =>
        x.Id == providerId && x.Provider == provider);
    if (accountToken == null) {
      throw new NullReferenceException($"Account token {providerId} not found");
    }

    return accountToken;
  }

  public async Task<List<AccountToken>> GetAccountTokens(string userId) {
    List<AccountToken> accountTokens =
      await _db.AccountTokens.Where(x => x.UserId == userId).ToListAsync();
    return accountTokens;
  }

  public async Task<List<AccountToken>> GetAccountTokens(string userId, OAuthProvider provider) {
    List<AccountToken> accountTokens =
      await _db.AccountTokens.Where(x => x.UserId == userId && x.Provider == provider)
        .ToListAsync();
    return accountTokens;
  }

  public async Task SaveOrUpdateAsync(AccountToken accountToken) {
    AccountToken? existing = await _db.AccountTokens
      .FirstOrDefaultAsync(x =>
        x.UserId == accountToken.UserId &&
        x.Provider == accountToken.Provider &&
        x.Id == accountToken.Id);

    if (existing != null) {
      existing.AccessToken = accountToken.AccessToken;
      existing.RefreshToken = accountToken.RefreshToken;
      existing.ExpiresAt = accountToken.ExpiresAt;
      existing.Scope = accountToken.Scope;
      existing.TokenType = accountToken.TokenType;
      existing.CreatedAt = DateTime.UtcNow;
      existing.UpdatedAt = DateTime.UtcNow;

      _db.Update(existing);
    } else {
      _db.Add(accountToken);
    }

    await _db.SaveChangesAsync();
  }

  public async Task DeleteAsync(string providerId, OAuthProvider provider) {
    AccountToken? existing =
      await _db.AccountTokens.FirstOrDefaultAsync(x =>
        x.Id == providerId && x.Provider == provider);
    if (existing != null) {
      _db.AccountTokens.Remove(existing);
      await _db.SaveChangesAsync();
    }
  }

  public async Task<TokenInfo> RefreshAsync(string userId, OAuthProvider provider) {
    AccountToken? accountToken = await _db.AccountTokens
      .FirstOrDefaultAsync(x => x.UserId == userId && x.Provider == provider);

    if (accountToken == null) {
      throw new InvalidOperationException("No account token found for this provider.");
    }

    if (accountToken.ExpiresAt > DateTime.UtcNow) {
      return new TokenInfo {
        AccessToken = accountToken.AccessToken,
        RefreshToken = accountToken.RefreshToken,
        ExpiresIn = (int)(accountToken.ExpiresAt - DateTime.UtcNow).TotalSeconds,
        Scope = accountToken.Scope,
        TokenType = accountToken.TokenType
      };
    }

    IProviderClient client = _providerFactory.GetClient(provider);
    TokenInfo newTokens = await client.RefreshTokenAsync(accountToken.RefreshToken);

    accountToken.AccessToken = newTokens.AccessToken;
    accountToken.RefreshToken = newTokens.RefreshToken;
    accountToken.ExpiresAt = DateTime.UtcNow.AddSeconds(newTokens.ExpiresIn);
    accountToken.UpdatedAt = DateTime.UtcNow;

    _db.Update(accountToken);
    await _db.SaveChangesAsync();

    return newTokens;
  }
}