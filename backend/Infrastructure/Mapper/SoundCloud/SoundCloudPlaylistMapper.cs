using backend.Application.Model;
using backend.Domain.Enum;

public static class SoundCloudPlaylistMapper {
  public static ProviderPlaylist ToProviderPlaylist(SoundCloudPlaylist sc) {
    return new ProviderPlaylist {
      Id = sc.Urn,
      Title = sc.Title,
      Description = sc.Description ?? string.Empty,
      ThumbnailUrl = sc.ArtworkUrl,
      ChannelId = sc.User?.Urn,
      ChannelTitle = sc.User?.Username,
      CreatedAt = sc.CreatedAt,
      ItemCount = sc.TrackCount,
      PrivacyStatus = sc.Sharing,
      Provider = OAuthProvider.SoundCloud,
      ProviderId = sc.Urn
    };
  }

  public static ProviderTrack ToProviderTrack(
      SoundCloudTrack sc,
      string? playlistId = null,
      int? position = null) {
    return new ProviderTrack {
      Id = sc.Urn,
      PlaylistId = playlistId,
      Position = position,
      TrackUrl = sc.PermalinkUrl,
      Title = sc.Title,
      Artist = sc.User?.Username ?? "Unknown Artist",
      Album = "Single",
      ThumbnailUrl = sc.ArtworkUrl,
      DurationMs = sc.Duration,
      Provider = OAuthProvider.SoundCloud
    };
  }

  public static SoundCloudPlaylistUpdateRequest ToUpdateRequest(
          SoundCloudPlaylist current,
          List<string> trackUrns) {
    return new SoundCloudPlaylistUpdateRequest {
      Playlist = new SoundCloudPlaylistUpdateData {
        Title = current.Title,
        Description = current.Description,
        Sharing = current.Sharing,
        Tracks = trackUrns.Select(u => new SoundCloudTrackUrn { Urn = u }).ToList()
      }
    };
  }

  public static SoundCloudPlaylistUpdateRequest ToCreateRequest(PlaylistCreateRequest request) {
    return new SoundCloudPlaylistUpdateRequest {
      Playlist = new SoundCloudPlaylistUpdateData {
        Title = request.Title,
        Description = request.Description ?? string.Empty,
        Sharing = request.Visibility == PlaylistVisibility.Private ? "private" : "public",
        Tracks = request.TrackIds?.Select(id => new SoundCloudTrackUrn {
          Urn = id.StartsWith("soundcloud:tracks:") ? id : $"soundcloud:tracks:{id}"
        }).ToList() ?? new List<SoundCloudTrackUrn>()
      }
    };
  }
}
