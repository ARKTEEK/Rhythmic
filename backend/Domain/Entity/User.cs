using Microsoft.AspNetCore.Identity;

namespace backend.Domain.Entity;

public class User : IdentityUser {
  public ICollection<AccountToken> AccountTokens { get; set; }
}