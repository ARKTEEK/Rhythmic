using backend.Domain.Enum;

namespace backend.Application.Interface;

public interface IProviderFactory {
  public IProviderClient GetClient(OAuthProvider provider);
}