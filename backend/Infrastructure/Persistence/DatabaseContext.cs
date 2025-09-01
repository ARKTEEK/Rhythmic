using backend.Domain.Entity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Persistence;

public class DatabaseContext : IdentityDbContext<User> {
  public DatabaseContext(DbContextOptions<DatabaseContext> options) : base(options) {
  }

  public DbSet<AccountToken?> AccountTokens { get; set; }

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

    builder.Entity<AccountToken>()
      .HasOne(uc => uc.User)
      .WithMany(u => u.AccountTokens)
      .HasForeignKey(uc => uc.UserId);

    builder.Entity<AccountToken>()
      .Property(uc => uc.Provider)
      .HasConversion<string>();

    builder.Entity<AccountToken>()
      .HasIndex(uc => new { uc.UserId, uc.Provider })
      .IsUnique();
  }
}