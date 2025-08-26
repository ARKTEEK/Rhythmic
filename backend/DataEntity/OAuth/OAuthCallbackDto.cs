namespace backend.DataEntity.Auth;

public class OAuthCallbackDto {
  public string Code { get; set; }
  public string State { get; set; }
}