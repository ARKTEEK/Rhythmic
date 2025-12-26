using backend.Domain.Enum;

namespace backend.Application.Model;

public abstract class JobRequest {
  public string JobId { get; init; } = Guid.NewGuid().ToString("N");
  public JobType JobType { get; init; }
}

public sealed class FindDuplicatesJob : JobRequest {
  public OAuthProvider Provider { get; init; }
  public string ProviderAccountId { get; init; }
  public string PlaylistId { get; init; }

  public FindDuplicatesJob() {
    JobType = JobType.FindDuplicateTracks;
  }
}

public sealed class TransferPlaylistJob : JobRequest {
  public OAuthProvider SourceProvider { get; init; }
  public string SourceAccountId { get; init; }
  public string SourcePlaylistId { get; init; }

  public OAuthProvider DestinationProvider { get; init; }
  public string DestinationAccountId { get; init; }
  public string DestinationPlaylistId { get; init; }

  public TransferPlaylistJob() {
    JobType = JobType.TransferPlaylist;
  }
}
