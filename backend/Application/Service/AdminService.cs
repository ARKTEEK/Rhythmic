using backend.Application.Interface;
using backend.Application.Model.Admin;
using backend.Domain.Entity;
using backend.Domain.Enum;
using backend.Infrastructure.Persistence;

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Service;

public class AdminService : IAdminService {
  private readonly UserManager<User> _userManager;
  private readonly DatabaseContext _context;

  public AdminService(UserManager<User> userManager, DatabaseContext context) {
    _userManager = userManager;
    _context = context;
  }

  public async Task<List<UserDto>> GetAllUsersAsync() {
    var users = await _userManager.Users
      .Include(u => u.AccountTokens)
      .Include(u => u.PlaylistSyncGroups)
      .ToListAsync();

    var userDtos = new List<UserDto>();

    foreach (var user in users) {
      var roles = await _userManager.GetRolesAsync(user);

      var actionsCount = await _context.AuditLogs.CountAsync(a => a.UserId == user.Id);

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
    var user = new User {
      UserName = request.Username,
      Email = request.Email
    };

    var result = await _userManager.CreateAsync(user, request.Password);
    if (!result.Succeeded) {
      throw new Exception($"Failed to create user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
    }

    var rolesToAdd = request.Roles.Any() ? request.Roles : new List<string> { "User" };
    foreach (var role in rolesToAdd) {
      var roleResult = await _userManager.AddToRoleAsync(user, role);
      if (!roleResult.Succeeded) {
        Console.WriteLine($"Failed to add role {role} to user: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}");
      }
    }

    var roles = await _userManager.GetRolesAsync(user);
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
    var user = await _userManager.FindByIdAsync(userId);
    if (user == null) {
      return false;
    }

    var currentRoles = await _userManager.GetRolesAsync(user);

    var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
    if (!removeResult.Succeeded) {
      throw new Exception($"Failed to remove roles: {string.Join(", ", removeResult.Errors.Select(e => e.Description))}");
    }

    var addResult = await _userManager.AddToRolesAsync(user, request.Roles);
    if (!addResult.Succeeded) {
      throw new Exception($"Failed to add roles: {string.Join(", ", addResult.Errors.Select(e => e.Description))}");
    }

    return true;
  }

  public async Task<bool> SendPasswordResetEmailAsync(string userId) {
    var user = await _userManager.FindByIdAsync(userId);
    if (user == null) {
      return false;
    }

    var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);

    Console.WriteLine($"Password reset token for {user.Email}: {resetToken}");

    return true;
  }

  public async Task<SystemStatisticsDto> GetSystemStatisticsAsync() {
    var now = DateTime.UtcNow;
    var today = now.Date;
    var weekAgo = today.AddDays(-7);
    var monthAgo = today.AddMonths(-1);

    var totalUsers = await _userManager.Users.CountAsync();

    var dailyActiveUsers = await _context.AuditLogs
      .Where(a => a.CreatedAt >= today)
      .Select(a => a.UserId)
      .Distinct()
      .CountAsync();

    var weeklyActiveUsers = await _context.AuditLogs
      .Where(a => a.CreatedAt >= weekAgo)
      .Select(a => a.UserId)
      .Distinct()
      .CountAsync();

    var monthlyActiveUsers = await _context.AuditLogs
      .Where(a => a.CreatedAt >= monthAgo)
      .Select(a => a.UserId)
      .Distinct()
      .CountAsync();

    var userRegistrations = new List<DailyCount>();

    var allSyncGroups = await _context.PlaylistSyncGroups.Include(g => g.Children).ToListAsync();
    var totalPlaylists = allSyncGroups.Sum(g => 1 + g.Children.Count);
    var spotifyPlaylists = allSyncGroups.Count(g => g.MasterProvider == OAuthProvider.Spotify) +
                          allSyncGroups.SelectMany(g => g.Children).Count(c => c.Provider == OAuthProvider.Spotify);
    var youtubePlaylists = allSyncGroups.Count(g => g.MasterProvider == OAuthProvider.Google) +
                          allSyncGroups.SelectMany(g => g.Children).Count(c => c.Provider == OAuthProvider.Google);

    var recentSnapshots = await _context.PlaylistSnapshots
      .OrderByDescending(s => s.CreatedAt)
      .Take(100)
      .ToListAsync();

    var totalTracks = 0;
    foreach (var snapshot in recentSnapshots) {
      try {
        var tracks = System.Text.Json.JsonSerializer.Deserialize<List<object>>(snapshot.TracksJson);
        totalTracks += tracks?.Count ?? 0;
      } catch {
      }
    }

    var playlistsCreated = await _context.AuditLogs
      .Where(a => a.Type == AuditType.PlaylistCreated && a.CreatedAt >= monthAgo)
      .GroupBy(a => a.CreatedAt.Date)
      .Select(g => new DailyCount {
        Date = g.Key,
        Count = g.Count()
      })
      .OrderBy(x => x.Date)
      .ToListAsync();

    var syncGroups = await _context.PlaylistSyncGroups.ToListAsync();
    var totalSyncGroups = syncGroups.Count;
    var activeSyncGroups = syncGroups.Count(g => g.SyncEnabled);

    var allAuditLogs = await _context.AuditLogs
      .Where(a => a.Description != null)
      .ToListAsync();

    var totalSyncs = allAuditLogs
      .Count(a => a.Description.Contains("sync", StringComparison.OrdinalIgnoreCase));

    var syncsToday = allAuditLogs
      .Where(a => a.CreatedAt >= today)
      .Count(a => a.Description.Contains("sync", StringComparison.OrdinalIgnoreCase));

    var syncsThisWeek = allAuditLogs
      .Where(a => a.CreatedAt >= weekAgo)
      .Count(a => a.Description.Contains("sync", StringComparison.OrdinalIgnoreCase));

    var syncsThisMonth = allAuditLogs
      .Where(a => a.CreatedAt >= monthAgo)
      .Count(a => a.Description.Contains("sync", StringComparison.OrdinalIgnoreCase));

    var dailySyncs = allAuditLogs
      .Where(a => a.Description.Contains("sync", StringComparison.OrdinalIgnoreCase) && a.CreatedAt >= monthAgo)
      .GroupBy(a => a.CreatedAt.Date)
      .Select(g => new DailyCount {
        Date = g.Key,
        Count = g.Count()
      })
      .OrderBy(x => x.Date)
      .ToList();

    var totalActions = await _context.AuditLogs.CountAsync();
    var actionsToday = await _context.AuditLogs.CountAsync(a => a.CreatedAt >= today);
    var actionsThisWeek = await _context.AuditLogs.CountAsync(a => a.CreatedAt >= weekAgo);
    var actionsThisMonth = await _context.AuditLogs.CountAsync(a => a.CreatedAt >= monthAgo);

    var actionsByType = await _context.AuditLogs
      .GroupBy(a => a.Type)
      .Select(g => new { Type = g.Key.ToString(), Count = g.Count() })
      .ToDictionaryAsync(x => x.Type, x => x.Count);

    return new SystemStatisticsDto {
      Users = new UserStatistics {
        TotalUsers = totalUsers,
        DailyActiveUsers = dailyActiveUsers,
        WeeklyActiveUsers = weeklyActiveUsers,
        MonthlyActiveUsers = monthlyActiveUsers,
        UserRegistrations = userRegistrations
      },
      Playlists = new PlaylistStatistics {
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

