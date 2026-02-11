using backend.Domain.Entity;
using backend.Domain.Enum;

namespace backend.Domain.Interfaces;

public interface IAccountProfileRepository {
  Task<AccountProfile?> GetByProviderAsync(
    string providerId,
    OAuthProvider provider);

  Task<AccountProfile?> GetByCompositeKeyAsync(
    string userId,
    string providerId,
    OAuthProvider provider);

  Task<List<AccountProfile>> GetAllByUserIdAsync(string userId);

  Task AddAsync(AccountProfile profile);

  Task UpdateAsync(AccountProfile profile);

  Task DeleteAsync(AccountProfile profile);
}