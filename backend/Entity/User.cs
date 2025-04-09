using System.ComponentModel.DataAnnotations;

namespace backend.Entity;

public class User {
  public int Id { get; set; }

  [MaxLength(100, ErrorMessage = "Email can't be longer than 100 characters.")]
  public string Email { get; set; }

  [MaxLength(60, ErrorMessage = "Password can't be longer than 60 characters.")]
  public string Password { get; set; }
}