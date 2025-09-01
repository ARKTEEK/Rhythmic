using backend.Application.Interface;
using backend.Domain.Entity;
using backend.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Service;

public class AccountTokensService : IAccountTokensService {
  private readonly DatabaseContext _context;

  public AccountTokensService(DatabaseContext context) {
    _context = context;
  }

  public async Task SaveOrUpdateAsync(AccountToken accountToken) {
    AccountToken? existing = await _context.AccountTokens
      .FirstOrDefaultAsync(x =>
        x.UserId == accountToken.UserId && x.Provider == accountToken.Provider);

    if (existing != null) {
      existing.AccessToken = accountToken.AccessToken;
      existing.RefreshToken = accountToken.RefreshToken;
      existing.ExpiresAt = accountToken.ExpiresAt;
      existing.Scope = accountToken.Scope;
      existing.TokenType = accountToken.TokenType;
      existing.CreatedAt = DateTime.UtcNow;
      existing.UpdatedAt = DateTime.UtcNow;

      _context.Update(existing);
    } else {
      _context.Add(accountToken);
    }

    await _context.SaveChangesAsync();
  }
}