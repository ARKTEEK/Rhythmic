using backend.Entity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace backend;

public class AppDbContext : IdentityDbContext<User> {
  public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {
  }

  protected override void OnModelCreating(ModelBuilder builder) {
    base.OnModelCreating(builder);

    List<IdentityRole> roles = new() {
      new IdentityRole {
        Name = "Admin",
        NormalizedName = "ADMIN"
      },
      new IdentityRole {
        Name = "User",
        NormalizedName = "USER"
      }
    };
    builder.Entity<IdentityRole>().HasData(roles);
  }
}