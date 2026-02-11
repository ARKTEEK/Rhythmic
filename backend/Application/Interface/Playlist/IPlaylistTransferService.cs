using backend.Application.Model.Provider;
using backend.Domain.Enum;

namespace backend.Application.Interface.Playlist;

public interface IPlaylistTransferService {
  Task TransferPlaylistAsync(
    OAuthProvider sourceProvider,
    OAuthProvider destinationProvider,
    string sourceAccountId,
    string destinationAccountId,
    string sourcePlaylistId,
    Func<int, ProviderTrack, bool, Task> onProgress,
    CancellationToken ct);
}