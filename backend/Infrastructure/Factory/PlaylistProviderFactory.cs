using backend.Application.Interface;
using backend.Domain.Enum;

namespace backend.Infrastructure.Factory;

public class PlaylistProviderFactory(IEnumerable<IPlaylistProviderClient> clients)
  : IPlaylistProviderFactory {
  private readonly IEnumerable<IPlaylistProviderClient> _clients = clients;

  public IPlaylistProviderClient GetClient(OAuthProvider provider) {
    var client = _clients.FirstOrDefault(x => x.Provider == provider);
    if (client == null) {
      throw new NotSupportedException($"Playlist provider {provider} is not supported");
    }

    return client;
  }
}