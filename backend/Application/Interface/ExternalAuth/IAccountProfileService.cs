using backend.Domain.Entity;
using backend.Domain.Enum;

namespace backend.Application.Interface.ExternalAuth;

public interface IAccountProfileService {
  Task SaveOrUpdateAsync(AccountProfile profile);
  Task DeleteAsync(string providerId, OAuthProvider provider);
  Task<List<AccountProfile>> GetAllAsync(string userId);
}