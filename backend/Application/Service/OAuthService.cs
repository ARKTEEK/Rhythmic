using backend.Api.DTO.OAuth;
using backend.Application.Interface;
using backend.Application.Mapper;
using backend.Application.Model;
using backend.Domain.Entity;
using backend.Domain.Enum;

namespace backend.Application.Service;

public class OAuthService : IOAuthService {
  private readonly IProviderFactory _factory;
  private readonly IAccountTokensService _accountTokensService;

  public OAuthService(IProviderFactory factory,
    IAccountTokensService accountTokensService) {
    _factory = factory;
    _accountTokensService = accountTokensService;
  }

  public async Task<OAuthLoginResponseDto> LoginAsync(string userId, OAuthProvider provider,
    string code) {
    IProviderClient client = _factory.GetClient(provider);

    TokenInfo tokens = await client.ExchangeCodeAsync(code);

    AccountToken accountToken = tokens.ToEntity(userId, provider);
    await _accountTokensService.SaveOrUpdateAsync(accountToken);

    return new OAuthLoginResponseDto(
      tokens.AccessToken,
      tokens.RefreshToken,
      tokens.ExpiresIn
    );
  }

  public string GetLoginUrl(OAuthProvider provider) {
    IProviderClient client = _factory.GetClient(provider);
    string url = client.GetLoginUrl();
    return url;
  }
}