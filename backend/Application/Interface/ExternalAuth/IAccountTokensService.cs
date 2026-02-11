using backend.Application.Model.Provider;
using backend.Domain.Entity;
using backend.Domain.Enum;

namespace backend.Application.Interface.ExternalAuth;

public interface IAccountTokensService {
  Task<AccountToken> GetAccountToken(string providerId, OAuthProvider provider);

  Task<AccountToken>
    GetAccountTokenByAccessTokenAsync(string accessToken, OAuthProvider provider);

  Task<List<AccountToken>> GetAccountTokens(string userId);
  Task<List<AccountToken>> GetAccountTokens(string userId, OAuthProvider provider);
  Task<List<AccountToken>> GetValidAccountTokens(string userId);
  Task SaveOrUpdateAsync(AccountToken accountToken);
  Task DeleteAsync(string providerId, OAuthProvider provider);
  Task<TokenInfo> RefreshAsync(string providerId, OAuthProvider provider);
}