using backend.Domain.Entity;
using backend.Domain.Enum;

namespace backend.Domain.Interfaces;

public interface IAccountTokenRepository {
  Task<AccountToken?> GetByAccessTokenAsync(string accessToken, OAuthProvider provider);
  Task<AccountToken?> GetByProviderAsync(string providerId, OAuthProvider provider);
  Task<List<AccountToken>> GetByUserIdAsync(string userId);
  Task<List<AccountToken>> GetByUserIdAsync(string userId, OAuthProvider provider);
  Task AddAsync(AccountToken token);
  Task UpdateAsync(AccountToken token);
  Task DeleteAsync(AccountToken token);
}