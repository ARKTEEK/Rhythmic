using backend.Application.Model;
using backend.Domain.Entity;
using backend.Domain.Enum;

namespace backend.Application.Interface;

public interface IAccountTokensService {
  Task<AccountToken> GetAccountToken(string userId, OAuthProvider provider);
  Task<List<AccountToken>> GetAccountTokens(string userId);
  Task SaveOrUpdateAsync(AccountToken accountToken);
  Task DeleteAsync(string userId, OAuthProvider provider);
  Task<TokenInfo> RefreshAsync(string userId, OAuthProvider provider);
}