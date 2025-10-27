using backend.Domain.Enum;

namespace backend.Application.Model;

public class ProviderPlaylist {
  public string Id { get; set; } = string.Empty;
  public string Title { get; set; } = string.Empty;
  public string Description { get; set; } = string.Empty;
  public string? ThumbnailUrl { get; set; }
  public string? ChannelId { get; set; }
  public string? ChannelTitle { get; set; }
  public DateTime CreatedAt { get; set; }
  public int ItemCount { get; set; }
  public string? PrivacyStatus { get; set; }
  public string ProviderId { get; set; } = string.Empty;
  public OAuthProvider Provider { get; set; }
}