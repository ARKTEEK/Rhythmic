using backend.Application.Model.Playlists.Requests;
using backend.Application.Model.Provider;
using backend.Domain.Enum;

namespace backend.Application.Interface.Playlist;

public interface IPlaylistSplitService {
  Task<List<ProviderPlaylist>> SplitPlaylistAsync(
    OAuthProvider provider,
    string playlistId,
    string providerAccountId,
    string destinationAccountId,
    PlaylistSplitRequest request);
}