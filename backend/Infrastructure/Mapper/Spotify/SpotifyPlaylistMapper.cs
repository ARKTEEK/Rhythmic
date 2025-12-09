using backend.Application.Model;
using backend.Domain.Enum;
using backend.Infrastructure.DTO.Spotify;

namespace backend.Infrastructure.Mapper.Spotify;

public static class SpotifyPlaylistMapper {
  public static List<ProviderPlaylist> ToProviderPlaylists(string providerId,
    SpotifyPlaylistsResponse response) {
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
    List<ProviderTrack> tracks = new List<ProviderTrack>();

    for (int i = 0; i < items.Count; i++) {
      SpotifyTrack t = items[i].Track;
      if (t == null) continue;

      tracks.Add(new ProviderTrack {
        Id = t.Id,
        TrackUrl = "https://open.spotify.com/track/" + t.Id,
        Title = t.Name,
        Position = i,
        Artist = string.Join(", ", t.Artists?.Select(a => a.Name) ?? Array.Empty<string>()),
        Album = t.Album?.Name,
        ThumbnailUrl = t.Album?.Images?.FirstOrDefault()?.Url,
        DurationMs = t.DurationMs,
        Provider = OAuthProvider.Spotify
      });
    }

    return tracks;
  }


  public static List<ProviderTrack> ToProviderTracksFromSearch(SpotifySearchResult searchResult) {
    List<ProviderTrack> providerTracks = new List<ProviderTrack>();

    foreach (var item in searchResult.Tracks.Items) {
      string id = item.Id;
      string title = item.Name;
      string artist = string.Join(", ", item.Artists.Select(a => a.Name));
      string album = item.Album.Name;
      string? thumbnail = item.Album.Images.FirstOrDefault()?.Url;
      int durationMs = item.DurationMs;

      providerTracks.Add(new ProviderTrack {
        Id = id,
        TrackUrl = $"https://open.spotify.com/track/{id}",
        Title = title,
        Artist = artist,
        Album = album,
        ThumbnailUrl = thumbnail,
        DurationMs = durationMs,
        Provider = OAuthProvider.Spotify
      });
    }

    return providerTracks;
  }

  public static object ToSpotifyDeleteBody(IEnumerable<ProviderTrack> tracks) {
    return new {
      tracks = tracks.Select(t => new {
        uri = ToSpotifyUri(t),
        positions = new[] { t.Position }
      }).ToList()
    };
  }

  public static string ToSpotifyUri(ProviderTrack track) {
    if (string.IsNullOrEmpty(track.Id)) {
      throw new InvalidOperationException("ProviderTrackId must contain Spotify track id.");
    }

    return $"spotify:track:{track.Id}";
  }
}
