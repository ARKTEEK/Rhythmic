using backend.Domain.Entity;
using backend.Domain.Enum;
using backend.Domain.Interfaces;
using backend.Infrastructure.Persistence;

using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Repository;

public class AccountTokenRepository : IAccountTokenRepository {
  private readonly DatabaseContext _db;

  public AccountTokenRepository(DatabaseContext db) {
    _db = db;
  }

  public async Task<AccountToken?> GetByAccessTokenAsync(string accessToken,
    OAuthProvider provider) {
    return await _db.AccountTokens
      .FirstOrDefaultAsync(x =>
        x.AccessToken == accessToken &&
        x.Provider == provider);
  }

  public async Task<AccountToken?> GetByProviderAsync(string providerId, OAuthProvider provider) {
    return await _db.AccountTokens
      .FirstOrDefaultAsync(x =>
        x.Id == providerId &&
        x.Provider == provider);
  }

  public async Task<List<AccountToken>> GetByUserIdAsync(string userId) {
    return await _db.AccountTokens
      .Where(x => x.UserId == userId)
      .ToListAsync();
  }

  public async Task<List<AccountToken>> GetByUserIdAsync(string userId, OAuthProvider provider) {
    return await _db.AccountTokens
      .Where(x => x.UserId == userId && x.Provider == provider)
      .ToListAsync();
  }

  public async Task AddAsync(AccountToken token) {
    _db.AccountTokens.Add(token);
    await _db.SaveChangesAsync();
  }

  public async Task UpdateAsync(AccountToken token) {
    _db.AccountTokens.Update(token);
    await _db.SaveChangesAsync();
  }

  public async Task DeleteAsync(AccountToken token) {
    _db.AccountTokens.Remove(token);
    await _db.SaveChangesAsync();
  }
}