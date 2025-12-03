using backend.Domain.Enum;

namespace backend.Application.Model;

public class JobRequest {
  public string JobId { get; init; } = Guid.NewGuid().ToString("N");
  public OAuthProvider Provider { get; set; }
  public string ProviderAccountId { get; init; }
  public string PlaylistId { get; init; }
  public JobType JobType { get; init; }
}