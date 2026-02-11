using backend.Application.Interface.ExternalProvider;
using backend.Domain.Enum;

namespace backend.Infrastructure.Factory;

public class PlaylistProviderFactory(IEnumerable<IPlaylistProviderClient> clients)
  : IPlaylistProviderFactory {
  public IPlaylistProviderClient GetClient(OAuthProvider provider) {
    IPlaylistProviderClient? client = clients.FirstOrDefault(x => x.Provider == provider);
    if (client == null) {
      throw new NotSupportedException($"Playlist provider {provider} is not supported");
    }

    return client;
  }
}