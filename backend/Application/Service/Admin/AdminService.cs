using System.Text.Json;

using backend.Application.Interface.Admin;
using backend.Application.Model.Admin;
using backend.Domain.Entity;
using backend.Domain.Enum;
using backend.Infrastructure.Persistence;

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Service.Admin;

public class AdminService : IAdminService {
  private readonly DatabaseContext _context;
  private readonly UserManager<User> _userManager;

  public AdminService(UserManager<User> userManager, DatabaseContext context) {
    _userManager = userManager;
    _context = context;
  }

  public async Task<List<UserDto>> GetAllUsersAsync() {
    List<User> users = await _userManager.Users
      .Include(u => u.AccountTokens)
      .Include(u => u.PlaylistSyncGroups)
      .ToListAsync();

    List<UserDto> userDtos = new();

    foreach (User user in users) {
      IList<string> roles = await _userManager.GetRolesAsync(user);

      int actionsCount = await _context.AuditLogs.CountAsync(a => a.UserId == user.Id);

      userDtos.Add(new UserDto {
        Id = user.Id,
        Username = user.UserName,
        Email = user.Email,
        Roles = roles.ToList(),
        CreatedAt = user.CreatedAt,
        ActionsCount = actionsCount,
        TokensCount = user.AccountTokens?.Count ?? 0
      });
    }

    return userDtos;
  }

  public async Task<UserDto> CreateUserAsync(CreateUserRequest request) {
    User user = new() { UserName = request.Username, Email = request.Email };

    IdentityResult result = await _userManager.CreateAsync(user, request.Password);
    if (!result.Succeeded) {
      throw new Exception(
        $"Failed to create user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
    }

    List<string> rolesToAdd = request.Roles.Any() ? request.Roles : new List<string> { "User" };
    foreach (string role in rolesToAdd) {
      IdentityResult roleResult = await _userManager.AddToRoleAsync(user, role);
      if (!roleResult.Succeeded) {
        Console.WriteLine(
          $"Failed to add role {role} to user: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}");
      }
    }

    IList<string> roles = await _userManager.GetRolesAsync(user);
    return new UserDto {
      Id = user.Id,
      Username = user.UserName,
      Email = user.Email,
      Roles = roles.ToList(),
      CreatedAt = user.CreatedAt,
      ActionsCount = 0,
      TokensCount = 0
    };
  }

  public async Task<bool> UpdateUserRolesAsync(string userId, UpdateUserRolesRequest request) {
    User? user = await _userManager.FindByIdAsync(userId);
    if (user == null) {
      return false;
    }

    IList<string> currentRoles = await _userManager.GetRolesAsync(user);

    IdentityResult removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
    if (!removeResult.Succeeded) {
      throw new Exception(
        $"Failed to remove roles: {string.Join(", ", removeResult.Errors.Select(e => e.Description))}");
    }

    IdentityResult addResult = await _userManager.AddToRolesAsync(user, request.Roles);
    if (!addResult.Succeeded) {
      throw new Exception(
        $"Failed to add roles: {string.Join(", ", addResult.Errors.Select(e => e.Description))}");
    }

    return true;
  }

  public async Task<bool> SendPasswordResetEmailAsync(string userId) {
    User? user = await _userManager.FindByIdAsync(userId);
    if (user == null) {
      return false;
    }

    string resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);

    Console.WriteLine($"Password reset token for {user.Email}: {resetToken}");

    return true;
  }

  public async Task<SystemStatisticsDto> GetSystemStatisticsAsync() {
    DateTime now = DateTime.UtcNow;
    DateTime today = now.Date;
    DateTime weekAgo = today.AddDays(-7);
    DateTime monthAgo = today.AddMonths(-1);

    int totalUsers = await _userManager.Users.CountAsync();

    int dailyActiveUsers = await _context.AuditLogs
      .Where(a => a.CreatedAt >= today)
      .Select(a => a.UserId)
      .Distinct()
      .CountAsync();

    int weeklyActiveUsers = await _context.AuditLogs
      .Where(a => a.CreatedAt >= weekAgo)
      .Select(a => a.UserId)
      .Distinct()
      .CountAsync();

    int monthlyActiveUsers = await _context.AuditLogs
      .Where(a => a.CreatedAt >= monthAgo)
      .Select(a => a.UserId)
      .Distinct()
      .CountAsync();

    List<DailyCount> userRegistrations = new();

    List<PlaylistSyncGroup> allSyncGroups =
      await _context.PlaylistSyncGroups.Include(g => g.Children).ToListAsync();
    int totalPlaylists = allSyncGroups.Sum(g => 1 + g.Children.Count);
    int spotifyPlaylists = allSyncGroups.Count(g => g.MasterProvider == OAuthProvider.Spotify) +
                           allSyncGroups.SelectMany(g => g.Children)
                             .Count(c => c.Provider == OAuthProvider.Spotify);
    int youtubePlaylists = allSyncGroups.Count(g => g.MasterProvider == OAuthProvider.Google) +
                           allSyncGroups.SelectMany(g => g.Children)
                             .Count(c => c.Provider == OAuthProvider.Google);

    List<PlaylistSnapshot> recentSnapshots = await _context.PlaylistSnapshots
      .OrderByDescending(s => s.CreatedAt)
      .Take(100)
      .ToListAsync();

    int totalTracks = 0;
    foreach (PlaylistSnapshot? snapshot in recentSnapshots) {
      try {
        List<object>? tracks =
          JsonSerializer.Deserialize<List<object>>(snapshot.TracksJson);
        totalTracks += tracks?.Count ?? 0;
      } catch {
      }
    }

    List<DailyCount> playlistsCreated = await _context.AuditLogs
      .Where(a => a.Type == AuditType.PlaylistCreated && a.CreatedAt >= monthAgo)
      .GroupBy(a => a.CreatedAt.Date)
      .Select(g => new DailyCount { Date = g.Key, Count = g.Count() })
      .OrderBy(x => x.Date)
      .ToListAsync();

    List<PlaylistSyncGroup> syncGroups = await _context.PlaylistSyncGroups.ToListAsync();
    int totalSyncGroups = syncGroups.Count;
    int activeSyncGroups = syncGroups.Count(g => g.SyncEnabled);

    List<AuditLog> allAuditLogs = await _context.AuditLogs
      .Where(a => a.Description != null)
      .ToListAsync();

    int totalSyncs = allAuditLogs
      .Count(a => a.Description.Contains("sync", StringComparison.OrdinalIgnoreCase));

    int syncsToday = allAuditLogs
      .Where(a => a.CreatedAt >= today)
      .Count(a => a.Description.Contains("sync", StringComparison.OrdinalIgnoreCase));

    int syncsThisWeek = allAuditLogs
      .Where(a => a.CreatedAt >= weekAgo)
      .Count(a => a.Description.Contains("sync", StringComparison.OrdinalIgnoreCase));

    int syncsThisMonth = allAuditLogs
      .Where(a => a.CreatedAt >= monthAgo)
      .Count(a => a.Description.Contains("sync", StringComparison.OrdinalIgnoreCase));

    List<DailyCount> dailySyncs = allAuditLogs
      .Where(a =>
        a.Description.Contains("sync", StringComparison.OrdinalIgnoreCase) &&
        a.CreatedAt >= monthAgo)
      .GroupBy(a => a.CreatedAt.Date)
      .Select(g => new DailyCount { Date = g.Key, Count = g.Count() })
      .OrderBy(x => x.Date)
      .ToList();

    int totalActions = await _context.AuditLogs.CountAsync();
    int actionsToday = await _context.AuditLogs.CountAsync(a => a.CreatedAt >= today);
    int actionsThisWeek = await _context.AuditLogs.CountAsync(a => a.CreatedAt >= weekAgo);
    int actionsThisMonth = await _context.AuditLogs.CountAsync(a => a.CreatedAt >= monthAgo);

    Dictionary<string, int> actionsByType = await _context.AuditLogs
      .GroupBy(a => a.Type)
      .Select(g => new { Type = g.Key.ToString(), Count = g.Count() })
      .ToDictionaryAsync(x => x.Type, x => x.Count);

    return new SystemStatisticsDto {
      Users =
        new UserStatistics {
          TotalUsers = totalUsers,
          DailyActiveUsers = dailyActiveUsers,
          WeeklyActiveUsers = weeklyActiveUsers,
          MonthlyActiveUsers = monthlyActiveUsers,
          UserRegistrations = userRegistrations
        },
      Playlists =
        new PlaylistStatistics {
          TotalPlaylists = totalPlaylists,
          SpotifyPlaylists = spotifyPlaylists,
          YouTubePlaylists = youtubePlaylists,
          TotalTracks = totalTracks,
          PlaylistsCreated = playlistsCreated
        },
      Syncs = new SyncStatistics {
        TotalSyncGroups = totalSyncGroups,
        ActiveSyncGroups = activeSyncGroups,
        TotalSyncs = totalSyncs,
        SyncsToday = syncsToday,
        SyncsThisWeek = syncsThisWeek,
        SyncsThisMonth = syncsThisMonth,
        DailySyncs = dailySyncs
      },
      Audits = new AuditStatistics {
        TotalActions = totalActions,
        ActionsToday = actionsToday,
        ActionsThisWeek = actionsThisWeek,
        ActionsThisMonth = actionsThisMonth,
        ActionsByType = actionsByType
      }
    };
  }
}