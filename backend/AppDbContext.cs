using backend.Entity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace backend;

public class AppDbContext : IdentityDbContext<User> {
  public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {
  }

  public DbSet<UserConnection> UserConnections { get; set; }

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

    builder.Entity<UserConnection>()
      .HasOne(uc => uc.User)
      .WithMany(u => u.Connections)
      .HasForeignKey(uc => uc.UserId);

    builder.Entity<UserConnection>()
      .Property(uc => uc.Provider)
      .HasConversion<string>();
  }
}