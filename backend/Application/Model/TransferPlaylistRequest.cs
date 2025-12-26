using backend.Domain.Enum;

public sealed class StartTransferPlaylistRequest {
  public OAuthProvider SourceProvider { get; init; }
  public string SourceAccountId { get; init; }
  public string SourcePlaylistId { get; init; }

  public OAuthProvider DestinationProvider { get; init; }
  public string DestinationAccountId { get; init; }
}
