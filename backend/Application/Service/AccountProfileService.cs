using backend.Application.Interface;
using backend.Domain.Entity;
using backend.Domain.Enum;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Service;

public class AccountProfileService : IAccountProfileService {
  private readonly DatabaseContext _db;
  private readonly IProviderFactory _factory;

  public AccountProfileService(DatabaseContext db, IProviderFactory factory) {
    _db = db;
    _factory = factory;
  }

  public async Task SaveOrUpdateAsync(AccountProfile profile) {
    AccountProfile? existing = await _db.AccountProfiles.FirstOrDefaultAsync(x =>
      x.UserId == profile.UserId &&
      x.Provider == profile.Provider &&
      x.Id == profile.Id);

    if (existing != null) {
      existing.Email = profile.Email;
      existing.Displayname = profile.Displayname;
      existing.UpdatedAt = DateTime.UtcNow;

      _db.Update(existing);
    } else {
      _db.Add(profile);
    }

    await _db.SaveChangesAsync();
  }

  public async Task DeleteAsync(string userId, OAuthProvider provider) {
    AccountProfile? existingProfile =
      await _db.AccountProfiles.FirstOrDefaultAsync(x =>
        x.UserId == userId && x.Provider == provider);
    if (existingProfile != null) {
      _db.AccountProfiles.Remove(existingProfile);
      await _db.SaveChangesAsync();
    }
  }

  public async Task<List<AccountProfile>> GetAllAsync(string userId) {
    List<AccountProfile> profiles =
      await _db.AccountProfiles.Where(x => x.UserId == userId).ToListAsync();
    return profiles;
  }
}