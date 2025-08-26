namespace backend.DataEntity.OAuth;

public class OAuthCallbackDto {
  public string Code { get; set; }
  public string State { get; set; }
}