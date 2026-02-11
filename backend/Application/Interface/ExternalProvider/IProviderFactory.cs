using backend.Domain.Enum;

namespace backend.Application.Interface.ExternalProvider;

public interface IProviderFactory {
  IProviderClient GetClient(OAuthProvider provider);
}