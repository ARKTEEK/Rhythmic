using backend.Domain.Entity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Persistence;

public class DatabaseContext : IdentityDbContext<User> {
  public DatabaseContext(DbContextOptions<DatabaseContext> options) : base(options) {
  }

  protected override void OnModelCreating(ModelBuilder builder) {
    base.OnModelCreating(builder);

    builder.Entity<IdentityRole>().HasData(new List<IdentityRole> {
      new() {
        Name = "Admin",
        NormalizedName = "ADMIN"
      },
      new() {
        Name = "User",
        NormalizedName = "USER"
      }
    });
  }
}