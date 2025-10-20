using backend.Application.Model;
using backend.Domain.Enum;
using backend.Infrastructure.DTO.Spotify;

namespace backend.Infrastructure.Mapper.Spotify;

public static class SpotifyPlaylistMapper {
  public static List<ProviderPlaylist> ToProviderPlaylists(SpotifyPlaylistsResponse response) {
    if (response?.Items == null) {
      return new List<ProviderPlaylist>();
    }

    return response.Items.Select(item => new ProviderPlaylist {
      Id = item.Id,
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
}