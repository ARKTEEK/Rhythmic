using backend.Domain.Enum;

namespace backend.Application.Interface;

public interface IPlaylistProviderFactory {
    IPlaylistProviderClient GetClient(OAuthProvider provider);
}
