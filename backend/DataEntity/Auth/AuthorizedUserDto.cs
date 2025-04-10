namespace backend.DataEntity.Auth;

public class AuthorizedUserDto {
  public string UserName { get; set; }
  public string Email { get; set; }
  public string Token { get; set; }
}