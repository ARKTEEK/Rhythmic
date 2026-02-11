using backend.Api.DTO.OAuth;
using backend.Application.Interface.ExternalAuth;
using backend.Application.Interface.ExternalProvider;
using backend.Application.Mapper;
using backend.Application.Model.Provider;
using backend.Domain.Entity;
using backend.Domain.Enum;

namespace backend.Application.Service.ExternalAuth;

public class OAuthService : IOAuthService {
  private readonly IAccountProfileService _accountProfileService;
  private readonly IAccountTokensService _accountTokensService;
  private readonly IProviderFactory _factory;

  public OAuthService(IProviderFactory factory,
    IAccountTokensService accountTokensService,
    IAccountProfileService accountProfileService) {
    _factory = factory;
    _accountTokensService = accountTokensService;
    _accountProfileService = accountProfileService;
  }

  public async Task<OAuthLoginResponseDto> LoginAsync(
    string userId, OAuthProvider provider, string code) {
    List<AccountProfile> existingProfiles = await _accountProfileService.GetAllAsync(userId);
    int countForProvider = existingProfiles.Count(p => p.Provider == provider);
    if (countForProvider >= 3) {
      throw new InvalidOperationException($"Cannot add more than 3 accounts for {provider}.");
    }

    IProviderClient client = _factory.GetClient(provider);

    TokenInfo tokens = await client.ExchangeCodeAsync(code);

    AccountToken accountToken = tokens.ToEntity(userId, provider);
    await _accountTokensService.SaveOrUpdateAsync(accountToken);

    ProviderProfile providerProfile = await client.GetProfileAsync(accountToken.AccessToken);
    AccountProfile accountProfile = providerProfile.ToEntity(userId, provider);
    await _accountProfileService.SaveOrUpdateAsync(accountProfile);

    return new OAuthLoginResponseDto(
      tokens.AccessToken,
      tokens.RefreshToken,
      tokens.ExpiresIn
    );
  }

  public async Task DisconnectAsync(OAuthProvider provider, string providerId) {
    AccountToken accountToken =
      await _accountTokensService.GetAccountToken(providerId, provider);

    IProviderClient client = _factory.GetClient(provider);

    await client.DisconnectAsync(accountToken.RefreshToken);

    await _accountTokensService.DeleteAsync(providerId, provider);
    await _accountProfileService.DeleteAsync(providerId, provider);
  }

  public string GetLoginUrl(OAuthProvider provider) {
    IProviderClient client = _factory.GetClient(provider);
    string url = client.GetLoginUrl();
    return url;
  }
}