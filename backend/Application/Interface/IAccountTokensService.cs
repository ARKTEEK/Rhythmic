using backend.Application.Model;
using backend.Domain.Entity;
using backend.Domain.Enum;

namespace backend.Application.Interface;

public interface IAccountTokensService {
  Task<AccountToken> GetAccountToken(string providerId, OAuthProvider provider);
  Task<List<AccountToken>> GetAccountTokens(string userId);
  Task<List<AccountToken>> GetAccountTokens(string userId, OAuthProvider provider);
  Task<List<AccountToken>> GetValidAccountTokens(string userId);
  Task SaveOrUpdateAsync(AccountToken accountToken);
  Task DeleteAsync(string providerId, OAuthProvider provider);
  Task<TokenInfo> RefreshAsync(string providerId, OAuthProvider provider);
}