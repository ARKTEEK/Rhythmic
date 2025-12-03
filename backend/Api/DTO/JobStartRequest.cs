using backend.Domain.Enum;

namespace backend.Api.DTO;

public class JobStartRequest {
  public OAuthProvider Provider { get; set; }
  public string ProviderAccountId { get; set; }
  public string PlaylistId { get; set; }
  public JobType JobType { get; set; }
}