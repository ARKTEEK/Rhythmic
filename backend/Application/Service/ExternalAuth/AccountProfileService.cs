using backend.Application.Interface.ExternalAuth;
using backend.Domain.Entity;
using backend.Domain.Enum;
using backend.Domain.Interfaces;

namespace backend.Application.Service.ExternalAuth;

public class AccountProfileService : IAccountProfileService {
  private readonly IAccountProfileRepository _repository;

  public AccountProfileService(IAccountProfileRepository repository) {
    _repository = repository;
  }

  public async Task SaveOrUpdateAsync(AccountProfile profile) {
    AccountProfile? existing = await _repository.GetByCompositeKeyAsync(
      profile.UserId,
      profile.Id,
      profile.Provider);

    if (existing != null) {
      existing.Email = profile.Email;
      existing.Displayname = profile.Displayname;
      existing.UpdatedAt = DateTime.UtcNow;

      await _repository.UpdateAsync(existing);
    } else {
      await _repository.AddAsync(profile);
    }
  }

  public async Task DeleteAsync(string providerId, OAuthProvider provider) {
    AccountProfile existing = await _repository.GetByProviderAsync(
      providerId,
      provider);

    if (existing != null) {
      await _repository.DeleteAsync(existing);
    }
  }

  public async Task<List<AccountProfile>> GetAllAsync(string userId) {
    return await _repository.GetAllByUserIdAsync(userId);
  }
}