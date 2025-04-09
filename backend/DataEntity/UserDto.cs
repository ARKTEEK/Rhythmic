using System.ComponentModel.DataAnnotations;

namespace backend.DataEntity;

public class UserDto {
  public int Id { get; set; }

  [Required]
  [MinLength(5, ErrorMessage = "Email must be at least 5 characters.")]
  [MaxLength(320, ErrorMessage = "Email can't be longer than 320 characters.")]
  public string Email { get; set; }
}