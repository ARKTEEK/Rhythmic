using backend.Domain.Entity;
using backend.Domain.Enum;
using backend.Domain.Interfaces;
using backend.Infrastructure.Persistence;

using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Repository;

public class AccountProfileRepository : IAccountProfileRepository {
  private readonly DatabaseContext _db;

  public AccountProfileRepository(DatabaseContext db) {
    _db = db;
  }

  public async Task<AccountProfile?> GetByProviderAsync(
    string providerId,
    OAuthProvider provider) {
    return await _db.AccountProfiles
      .FirstOrDefaultAsync(x =>
        x.Provider == provider &&
        x.Id == providerId);
  }

  public async Task<AccountProfile?> GetByCompositeKeyAsync(
    string userId,
    string providerId,
    OAuthProvider provider) {
    return await _db.AccountProfiles
      .FirstOrDefaultAsync(x =>
        x.UserId == userId &&
        x.Provider == provider &&
        x.Id == providerId);
  }

  public async Task<List<AccountProfile>> GetAllByUserIdAsync(string userId) {
    return await _db.AccountProfiles
      .Where(x => x.UserId == userId)
      .ToListAsync();
  }

  public async Task AddAsync(AccountProfile profile) {
    _db.AccountProfiles.Add(profile);
    await _db.SaveChangesAsync();
  }

  public async Task UpdateAsync(AccountProfile profile) {
    _db.AccountProfiles.Update(profile);
    await _db.SaveChangesAsync();
  }

  public async Task DeleteAsync(AccountProfile profile) {
    _db.AccountProfiles.Remove(profile);
    await _db.SaveChangesAsync();
  }
}