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
  public DbSet<PlaylistSyncGroup> PlaylistSyncGroups { get; set; }
  public DbSet<PlaylistSyncChild> PlaylistSyncChildren { get; set; }
  public DbSet<ScheduledJob> ScheduledJobs { get; set; }
  public DbSet<JobExecution> JobExecutions { get; set; }

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

    var hasher = new PasswordHasher<User>();
    var adminUser = new User {
      Id = "admin-default-user-id",
      UserName = "admin",
      NormalizedUserName = "ADMIN",
      Email = "admin@rhythmic.local",
      NormalizedEmail = "ADMIN@RHYTHMIC.LOCAL",
      EmailConfirmed = true,
      SecurityStamp = "be4b0db7-bbb7-484d-89f7-37d8e7194d56",
      ConcurrencyStamp = "44dc068a-60c7-4917-b7ea-7c699824cbdf"
    };
    adminUser.PasswordHash = hasher.HashPassword(adminUser, "Admin123!");

    builder.Entity<User>().HasData(adminUser);

    builder.Entity<IdentityUserRole<string>>().HasData(new IdentityUserRole<string> {
      RoleId = "288fd75c-0471-4c64-9d8e-af206019088e",
      UserId = "admin-default-user-id"
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

    builder.Entity<PlaylistSyncGroup>()
      .HasOne(psg => psg.User)
      .WithMany(u => u.PlaylistSyncGroups)
      .HasForeignKey(psg => psg.UserId);

    builder.Entity<PlaylistSyncGroup>()
      .Property(psg => psg.MasterProvider)
      .HasConversion<string>();

    builder.Entity<PlaylistSyncChild>()
      .HasOne(psc => psc.SyncGroup)
      .WithMany(psg => psg.Children)
      .HasForeignKey(psc => psc.SyncGroupId)
      .OnDelete(DeleteBehavior.Cascade);

    builder.Entity<PlaylistSyncChild>()
      .Property(psc => psc.Provider)
      .HasConversion<string>();

    builder.Entity<ScheduledJob>()
      .HasOne(sj => sj.User)
      .WithMany(u => u.ScheduledJobs)
      .HasForeignKey(sj => sj.UserId);

    builder.Entity<JobExecution>()
      .HasOne(je => je.ScheduledJob)
      .WithMany(sj => sj.Executions)
      .HasForeignKey(je => je.ScheduledJobId)
      .OnDelete(DeleteBehavior.Cascade);
  }
}
