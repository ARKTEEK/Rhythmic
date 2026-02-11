using backend.Application.Interface.ExternalAuth;
using backend.Application.Interface.ExternalProvider;
using backend.Application.Model.Provider;
using backend.Domain.Entity;
using backend.Domain.Enum;
using backend.Domain.Interfaces;
using backend.Infrastructure.Mapper.Google;

namespace backend.Application.Service.ExternalAuth;

public class AccountTokensService : IAccountTokensService {
  private readonly IProviderFactory _providerFactory;
  private readonly IAccountTokenRepository _repository;

  public AccountTokensService(
    IAccountTokenRepository repository,
    IProviderFactory providerFactory) {
    _repository = repository;
    _providerFactory = providerFactory;
  }

  public async Task<AccountToken> GetAccountTokenByAccessTokenAsync(
    string accessToken,
    OAuthProvider provider) {
    if (string.IsNullOrWhiteSpace(accessToken)) {
      throw new ArgumentException(nameof(accessToken));
    }

    AccountToken token = await _repository.GetByAccessTokenAsync(accessToken, provider)
                         ?? throw new InvalidOperationException("Account token not found.");

    if (token.ExpiresAt <= DateTime.UtcNow) {
      await RefreshInternalAsync(token);
    }

    return token;
  }

  public async Task<AccountToken> GetAccountToken(
    string providerId,
    OAuthProvider provider) {
    return await _repository.GetByProviderAsync(providerId, provider)
           ?? throw new InvalidOperationException("Account token not found.");
  }

  public async Task<List<AccountToken>> GetAccountTokens(string userId) {
    return await _repository.GetByUserIdAsync(userId);
  }

  public async Task<List<AccountToken>> GetAccountTokens(
    string userId,
    OAuthProvider provider) {
    return await _repository.GetByUserIdAsync(userId, provider);
  }

  public async Task<List<AccountToken>> GetValidAccountTokens(string userId) {
    List<AccountToken> tokens = await _repository.GetByUserIdAsync(userId);

    foreach (AccountToken token in tokens) {
      if (token.ExpiresAt <= DateTime.UtcNow) {
        await RefreshInternalAsync(token);
      }
    }

    return tokens;
  }

  public async Task SaveOrUpdateAsync(AccountToken token) {
    AccountToken? existing = await _repository.GetByProviderAsync(
      token.Id,
      token.Provider);

    if (existing == null) {
      await _repository.AddAsync(token);
      return;
    }

    existing.AccessToken = token.AccessToken;
    existing.RefreshToken = token.RefreshToken;
    existing.ExpiresAt = token.ExpiresAt;
    existing.Scope = token.Scope;
    existing.TokenType = token.TokenType;
    existing.UpdatedAt = DateTime.UtcNow;

    await _repository.UpdateAsync(existing);
  }

  public async Task DeleteAsync(string providerId, OAuthProvider provider) {
    AccountToken? token = await _repository.GetByProviderAsync(providerId, provider);
    if (token != null) {
      await _repository.DeleteAsync(token);
    }
  }

  public async Task<TokenInfo> RefreshAsync(
    string providerId,
    OAuthProvider provider) {
    AccountToken? token = await _repository.GetByProviderAsync(providerId, provider)
                          ?? throw new InvalidOperationException("Account token not found.");

    if (token.ExpiresAt > DateTime.UtcNow) {
      return GoogleOAuthMapper.ToTokenInfo(token);
    }

    await RefreshInternalAsync(token);

    return GoogleOAuthMapper.ToTokenInfo(token);
  }

  private async Task RefreshInternalAsync(AccountToken token) {
    IProviderClient client = _providerFactory.GetClient(token.Provider);
    TokenRefreshInfo refreshed = await client.RefreshTokenAsync(token.RefreshToken);

    token.AccessToken = refreshed.AccessToken;
    token.RefreshToken = refreshed.RefreshToken;
    token.ExpiresAt = DateTime.UtcNow.AddSeconds(refreshed.ExpiresIn);
    token.UpdatedAt = DateTime.UtcNow;

    await _repository.UpdateAsync(token);
  }
}