namespace backend.Application.Model.Provider;

public class UpdateProfileRequest {
  public string? Username { get; set; }
  public string? Email { get; set; }
}

public class ChangePasswordRequest {
  public required string CurrentPassword { get; set; }
  public required string NewPassword { get; set; }
}