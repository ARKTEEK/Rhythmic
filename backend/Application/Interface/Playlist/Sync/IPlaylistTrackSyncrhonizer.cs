using backend.Application.Model.Provider;
using backend.Domain.Enum;

namespace backend.Application.Interface.Playlist.Sync;

public interface IPlaylistTrackSynchronizer {
  Task SynchronizeTracksAsync(OAuthProvider provider, string playlistId, string providerAccountId,
    List<ProviderTrack> masterTracks);
}