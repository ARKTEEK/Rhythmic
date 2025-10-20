using backend.Domain.Enum;

namespace backend.Api.DTO;

public class AccountProfileResponse {
  public string Id { get; set; }
  public OAuthProvider Provider { get; set; }
  public string Displayname { get; set; }
  public string Email { get; set; }
}