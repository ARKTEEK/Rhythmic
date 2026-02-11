using backend.Domain.Entity;
using backend.Domain.Enum;
using backend.Domain.Interfaces;
using backend.Infrastructure.Persistence;

using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Repository;

public class PlaylistSnapshotRepository : IPlaylistSnapshotRepository {
  private readonly DatabaseContext _context;

  public PlaylistSnapshotRepository(DatabaseContext context) {
    _context = context;
  }

  public async Task AddAsync(PlaylistSnapshot snapshot) {
    _context.PlaylistSnapshots.Add(snapshot);
    await _context.SaveChangesAsync();
  }

  public async Task<PlaylistSnapshot?> GetLatestAsync(string userId, OAuthProvider provider,
    string playlistId) {
    return await _context.PlaylistSnapshots
      .Where(s => s.UserId == userId && s.Provider == provider && s.PlaylistId == playlistId)
      .OrderByDescending(s => s.CreatedAt)
      .FirstOrDefaultAsync();
  }

  public async Task<List<PlaylistSnapshot>> GetHistoryAsync(string userId, OAuthProvider provider,
    string playlistId) {
    return await _context.PlaylistSnapshots
      .Where(s => s.UserId == userId && s.Provider == provider && s.PlaylistId == playlistId)
      .OrderByDescending(s => s.CreatedAt)
      .ToListAsync();
  }

  public async Task<PlaylistSnapshot?> GetByIdAsync(int snapshotId) {
    return await _context.PlaylistSnapshots.FindAsync(snapshotId);
  }

  public async Task DeleteAsync(PlaylistSnapshot snapshot) {
    _context.PlaylistSnapshots.Remove(snapshot);
    await _context.SaveChangesAsync();
  }
}