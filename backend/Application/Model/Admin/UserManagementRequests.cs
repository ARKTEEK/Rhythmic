namespace backend.Application.Model.Admin;

public class CreateUserRequest {
  public required string Username { get; set; }
  public required string Email { get; set; }
  public required string Password { get; set; }
  public List<string> Roles { get; set; } = new();
}

public class UpdateUserRolesRequest {
  public required List<string> Roles { get; set; }
}

