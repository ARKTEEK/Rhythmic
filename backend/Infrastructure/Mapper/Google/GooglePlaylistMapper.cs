using backend.Application.Model;
using backend.Domain.Enum;
using backend.Infrastructure.DTO.Google;
using backend.Infrastructure.Utils;

namespace backend.Infrastructure.Mapper.Google;

public static class GooglePlaylistMapper {
  public static List<ProviderPlaylist> ToProviderPlaylists(string providerId,
    YoutubePlaylistsResponse response) {
    if (response.Items == null || response.Items.Count == 0) {
      return new List<ProviderPlaylist>();
    }

    return response.Items
      .Where(item => item.Snippet != null)
      .Select(item => new ProviderPlaylist {
        Id = item.Id ?? string.Empty,
        ProviderId = providerId,
        Title = item.Snippet?.Title ?? string.Empty,
        Description = item.Snippet?.Description ?? string.Empty,
        ThumbnailUrl = item.Snippet?.Thumbnails?.High?.Url
                       ?? item.Snippet?.Thumbnails?.Medium?.Url
                       ?? item.Snippet?.Thumbnails?.Default?.Url,
        ChannelId = item.Snippet?.ChannelId,
        ChannelTitle = item.Snippet?.ChannelTitle,
        CreatedAt = item.Snippet?.PublishedAt ?? DateTime.MinValue,
        ItemCount = item.ContentDetails?.ItemCount ?? 0,
        PrivacyStatus = item.Status?.PrivacyStatus,
        Provider = OAuthProvider.Google
      })
      .ToList();
  }

  public static List<ProviderTrack> ToProviderTracks(GooglePlaylistTracksResponse response) {
    if (response.Items == null || response.Items.Count == 0) {
      return new List<ProviderTrack>();
    }

    return response.Items
      .Where(item => item.Snippet != null && item.ContentDetails != null)
      .Select(item => {
        string title = item.Snippet!.Title ?? string.Empty;
        (string artist, string track) = MappingUtils.ParseAndClean(title);

        if (string.IsNullOrWhiteSpace(artist)) {
          artist = item.Snippet.VideoOwnerChannelTitle ?? string.Empty;
          artist = MappingUtils.CleanArtist(artist);
        }

        return new ProviderTrack {
          Id = item.ContentDetails?.VideoId ?? string.Empty,
          TrackUrl = "https://www.youtube.com/watch?v=" + item.ContentDetails.VideoId,
          Title = track,
          Artist = artist,
          Album = string.Empty,
          ThumbnailUrl = item.Snippet.Thumbnails?.High?.Url
                         ?? item.Snippet.Thumbnails?.Medium?.Url
                         ?? item.Snippet.Thumbnails?.Default?.Url,
          DurationMs = 0,
          Provider = OAuthProvider.Google
        };
      })
      .ToList();
  }

  public static List<ProviderTrack> ToProviderTracksFromSearch(YouTubeSearchResult searchResult) {
    return searchResult.Items.Select(item => new ProviderTrack {
      Id = item.Id.VideoId,
      TrackUrl = $"https://www.youtube.com/watch?v={item.Id.VideoId}",
      Title = item.Snippet.Title,
      Artist = item.Snippet.ChannelTitle,
      Album = string.Empty,
      ThumbnailUrl = item.Snippet.Thumbnails.Default?.Url,
      DurationMs = 0,
      Provider = OAuthProvider.Google
    }).ToList();
  }

  public static string ToYouTubeUri(ProviderTrack track) {
    if (string.IsNullOrEmpty(track.Id)) {
      throw new InvalidOperationException("ProviderTrackId must contain YouTube track id.");
    }

    return track.Id;
  }

  public static object CreatePlaylistItemInsertBody(string playlistId, string videoId) {
    return new {
      snippet = new {
        playlistId = playlistId,
        resourceId = new {
          kind = "youtube#video",
          videoId = videoId
        }
      }
    };
  }
}