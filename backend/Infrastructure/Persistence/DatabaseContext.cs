using backend.Domain.Entity;

using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Persistence;

public class DatabaseContext : IdentityDbContext<User> {
  public DatabaseContext(DbContextOptions<DatabaseContext> options) : base(options) {
  }

  public DbSet<AccountToken> AccountTokens { get; set; }
  public DbSet<AccountProfile> AccountProfiles { get; set; }
  public DbSet<PlaylistSnapshot> PlaylistSnapshots { get; set; }
  public DbSet<AuditLog> AuditLogs { get; set; }

  protected override void OnModelCreating(ModelBuilder builder) {
    base.OnModelCreating(builder);

    builder.Entity<IdentityRole>().HasData(new List<IdentityRole> {
      new() {
        Id = "288fd75c-0471-4c64-9d8e-af206019088e",
        Name = "Admin",
        NormalizedName = "ADMIN"
      },
      new() {
        Id = "020d4c18-5d3a-4380-836e-346b7b1a38ff",
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

    builder.Entity<AccountProfile>()
      .HasOne(uc => uc.User)
      .WithMany(u => u.AccountProfiles)
      .HasForeignKey(uc => uc.UserId);

    builder.Entity<AccountProfile>()
      .Property(uc => uc.Provider)
      .HasConversion<string>();

    builder.Entity<AuditLog>()
      .HasOne(ps => ps.user)
      .WithMany()
      .HasForeignKey(ps => ps.UserId);

    builder.Entity<AuditLog>()
      .Property(uc => uc.Type)
      .HasConversion<string>();

    builder.Entity<PlaylistSnapshot>()
      .HasOne(ps => ps.User)
      .WithMany()
      .HasForeignKey(ps => ps.UserId);

    builder.Entity<PlaylistSnapshot>()
      .Property(ps => ps.Provider)
      .HasConversion<string>();

    builder.Entity<PlaylistSnapshot>()
      .HasIndex(ps => new { ps.UserId, ps.Provider, ps.PlaylistId, ps.CreatedAt });
  }
}
