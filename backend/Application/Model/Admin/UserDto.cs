namespace backend.Application.Model.Admin;

public class UserDto {
  public string Id { get; set; }
  public string Username { get; set; }
  public string Email { get; set; }
  public List<string> Roles { get; set; }
  public DateTime CreatedAt { get; set; }
  public int ActionsCount { get; set; }
  public int TokensCount { get; set; }
}