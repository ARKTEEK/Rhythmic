using backend.Application.Model;
using backend.Domain.Enum;
using backend.Infrastructure.DTO.Google;

namespace backend.Infrastructure.Mapper.Google;

public static class GooglePlaylistMapper {
  public static List<ProviderPlaylist> ToProviderPlaylists(YoutubePlaylistsResponse response) {
    if (response.Items == null || response.Items.Count == 0) {
      return new List<ProviderPlaylist>();
    }

    return response.Items
      .Where(item => item.Snippet != null)
      .Select(item => new ProviderPlaylist {
        Id = item.Id ?? string.Empty,
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
}