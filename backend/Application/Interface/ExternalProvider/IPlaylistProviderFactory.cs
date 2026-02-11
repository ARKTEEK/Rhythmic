using backend.Domain.Enum;

namespace backend.Application.Interface.ExternalProvider;

public interface IPlaylistProviderFactory {
  IPlaylistProviderClient GetClient(OAuthProvider provider);
}