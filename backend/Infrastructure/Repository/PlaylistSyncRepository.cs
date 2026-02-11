using backend.Domain.Entity;
using backend.Domain.Enum;
using backend.Domain.Interfaces;
using backend.Infrastructure.Persistence;

using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Repository;

public class PlaylistSyncRepository : IPlaylistSyncRepository {
  private readonly DatabaseContext _context;

  public PlaylistSyncRepository(DatabaseContext context) {
    _context = context;
  }

  public async Task<PlaylistSyncGroup> CreateSyncGroupAsync(PlaylistSyncGroup syncGroup) {
    _context.PlaylistSyncGroups.Add(syncGroup);
    await _context.SaveChangesAsync();
    return syncGroup;
  }

  public async Task<PlaylistSyncGroup?> GetSyncGroupByIdAsync(string userId, int syncGroupId) {
    return await _context.PlaylistSyncGroups
      .Include(sg => sg.Children)
      .FirstOrDefaultAsync(sg => sg.Id == syncGroupId && sg.UserId == userId);
  }

  public async Task<List<PlaylistSyncGroup>> GetSyncGroupsByUserIdAsync(string userId) {
    return await _context.PlaylistSyncGroups
      .Include(sg => sg.Children)
      .Where(sg => sg.UserId == userId)
      .OrderByDescending(sg => sg.CreatedAt)
      .ToListAsync();
  }

  public async Task<PlaylistSyncGroup> UpdateSyncGroupAsync(PlaylistSyncGroup syncGroup) {
    _context.PlaylistSyncGroups.Update(syncGroup);
    await _context.SaveChangesAsync();
    return syncGroup;
  }

  public async Task DeleteSyncGroupAsync(PlaylistSyncGroup syncGroup) {
    _context.PlaylistSyncGroups.Remove(syncGroup);
    await _context.SaveChangesAsync();
  }

  public async Task<PlaylistSyncChild> AddChildPlaylistAsync(PlaylistSyncChild child) {
    _context.PlaylistSyncChildren.Add(child);
    await _context.SaveChangesAsync();
    return child;
  }

  public async Task RemoveChildPlaylistAsync(PlaylistSyncChild child) {
    _context.PlaylistSyncChildren.Remove(child);
    await _context.SaveChangesAsync();
  }

  public async Task<PlaylistSnapshot?> GetLatestSnapshotAsync(string userId,
    OAuthProvider provider, string playlistId) {
    return await _context.PlaylistSnapshots
      .Where(s => s.UserId == userId &&
                  s.Provider == provider &&
                  s.PlaylistId == playlistId)
      .OrderByDescending(s => s.CreatedAt)
      .FirstOrDefaultAsync();
  }

  public async Task<List<ScheduledJob>> GetScheduledJobsForSyncGroupAsync(string userId,
    int syncGroupId) {
    return await _context.ScheduledJobs
      .Where(j => j.UserId == userId &&
                  j.JobType == "PlaylistSync" &&
                  j.TargetType == "PlaylistSyncGroup" &&
                  j.TargetId == syncGroupId)
      .ToListAsync();
  }

  public async Task SaveChangesAsync() {
    await _context.SaveChangesAsync();
  }
}