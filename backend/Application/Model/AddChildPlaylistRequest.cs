using backend.Domain.Enum;

namespace backend.Application.Model;

public class AddChildPlaylistRequest {
  public string ChildPlaylistId { get; set; } = string.Empty;
  public OAuthProvider Provider { get; set; }
  public string ProviderAccountId { get; set; } = string.Empty;
}

