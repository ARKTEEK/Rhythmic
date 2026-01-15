using Microsoft.AspNetCore.Identity;

namespace backend.Domain.Entity;

public class User : IdentityUser {
  public ICollection<AccountToken> AccountTokens { get; set; }
  public ICollection<AccountProfile> AccountProfiles { get; set; }
  public ICollection<PlaylistSyncGroup> PlaylistSyncGroups { get; set; }
  public ICollection<ScheduledJob> ScheduledJobs { get; set; }
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
