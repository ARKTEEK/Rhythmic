using backend.Domain.Enum;

public sealed class StartFindDuplicatesRequest {
  public OAuthProvider Provider { get; init; }
  public string ProviderAccountId { get; init; }
  public string PlaylistId { get; init; }
}
