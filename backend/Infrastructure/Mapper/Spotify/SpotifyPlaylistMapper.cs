using backend.Application.Model;
using backend.Domain.Enum;
using backend.Infrastructure.DTO.Spotify;

namespace backend.Infrastructure.Mapper.Spotify;

public static class SpotifyPlaylistMapper {
  public static List<ProviderPlaylist> ToProviderPlaylists(string providerId, SpotifyPlaylistsResponse response) {
    if (response?.Items == null) {
      return new List<ProviderPlaylist>();
    }

    return response.Items.Select(item => new ProviderPlaylist {
      Id = item.Id,
      ProviderId = providerId,
      Title = item.Name,
      Description = item.Description,
      ThumbnailUrl = item.Images?.FirstOrDefault()?.Url,
      ChannelId = item.Owner?.Id,
      ChannelTitle = item.Owner?.DisplayName,
      CreatedAt = DateTime.UtcNow,
      ItemCount = item.Tracks?.Total ?? 0,
      PrivacyStatus = item.Public.HasValue
        ? item.Public.Value ? "public" : "private"
        : "unknown",
      Provider = OAuthProvider.Spotify
    }).ToList();
  }

  public static List<ProviderTrack> ToProviderTracks(List<SpotifyPlaylistTrackItem> items) {
    var tracks = new List<ProviderTrack>();

    foreach (var item in items) {
      var t = item.Track;
      if (t == null) continue;

      tracks.Add(new ProviderTrack {
        Id = t.Id,
        Title = t.Name,
        Artist = string.Join(", ", t.Artists?.Select(a => a.Name) ?? []),
        Album = t.Album?.Name,
        ThumbnailUrl = t.Album?.Images?.FirstOrDefault()?.Url,
        DurationMs = t.DurationMs,
        Provider = OAuthProvider.Spotify
      });
    }

    return tracks;
  }
}