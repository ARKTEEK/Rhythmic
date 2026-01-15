using backend.Domain.Enum;

namespace backend.Application.Model;

public class CreateSyncGroupRequest {
  public string Name { get; set; } = string.Empty;
  public string MasterPlaylistId { get; set; } = string.Empty;
  public OAuthProvider MasterProvider { get; set; }
  public string MasterProviderAccountId { get; set; } = string.Empty;
  public List<AddChildPlaylistRequest> Children { get; set; } = new();
}

