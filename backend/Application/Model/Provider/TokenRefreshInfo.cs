namespace backend.Application.Model.Provider;

public class TokenRefreshInfo {
  public string AccessToken { get; set; }
  public string? RefreshToken { get; set; }
  public string TokenType { get; set; }
  public string Scope { get; set; }
  public int ExpiresIn { get; set; }
}