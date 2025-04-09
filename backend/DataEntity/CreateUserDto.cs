using System.ComponentModel.DataAnnotations;

namespace backend.DataEntity;

public class CreateUserDto {
  [Required]
  [MinLength(5, ErrorMessage = "Email must be at least 5 characters.")]
  [MaxLength(320, ErrorMessage = "Email can't be longer than 320 characters.")]
  public string Email { get; set; }

  [Required]
  [MinLength(5, ErrorMessage = "Password must be at least 5 characters.")]
  [MaxLength(64, ErrorMessage = "Password can't be longer than 64 characters.")]
  public string Pasword { get; set; }
}