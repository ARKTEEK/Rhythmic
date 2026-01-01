using backend.Domain.Enum;

namespace backend.Application.Model;

public class PlaylistSplitRequest {
  public OAuthProvider Provider { get; set; }
  public string PlaylistId { get; set; } = string.Empty;
  public string ProviderAccountId { get; set; } = string.Empty;
  public string DestinationProviderAccountId { get; set; } = string.Empty;
  public PlaylistSplitType SplitType { get; set; }
  public string? SplitValue { get; set; }
  public string? BaseName { get; set; }
}

public enum PlaylistSplitType {
  ByArtist,
  InHalf,
  ByNumber,
  ByCustomNumber
}
