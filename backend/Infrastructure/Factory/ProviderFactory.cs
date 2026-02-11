using backend.Application.Interface.ExternalProvider;
using backend.Domain.Enum;

namespace backend.Infrastructure.Factory;

public class ProviderFactory : IProviderFactory {
  private readonly IEnumerable<IProviderClient> _clients;

  public ProviderFactory(IEnumerable<IProviderClient> clients) {
    _clients = clients;
  }

  public IProviderClient GetClient(OAuthProvider provider) {
    IProviderClient? client = _clients.FirstOrDefault(x => x.Provider == provider);
    if (client == null) {
      throw new NotSupportedException(
        string.Format("Provider {0} is not supported", provider));
    }

    return client;
  }
}