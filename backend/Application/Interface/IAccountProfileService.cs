using backend.Domain.Entity;
using backend.Domain.Enum;

namespace backend.Application.Interface;

public interface IAccountProfileService {
  Task SaveOrUpdateAsync(AccountProfile profile);
  Task DeleteAsync(string userId, OAuthProvider provider);
}