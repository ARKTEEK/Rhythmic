using System.Text.Json;

using backend.Application.Interface;
using backend.Application.Model;
using backend.Domain.Entity;
using backend.Domain.Enum;
using backend.Infrastructure.Persistence;

using Microsoft.EntityFrameworkCore;

namespace backend.Application.Service;

public class PlaylistSnapshotService : IPlaylistSnapshotService {
  private readonly DatabaseContext _context;
  private readonly IPlaylistService _playlistService;
  private static readonly JsonSerializerOptions JsonOptions = new() {
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
  };

  public PlaylistSnapshotService(DatabaseContext context, IPlaylistService playlistService) {
    _context = context;
    _playlistService = playlistService;
  }

  public async Task CreateSnapshotAsync(
    string userId,
    OAuthProvider provider,
    string playlistId,
    string providerAccountId,
    List<ProviderTrack> tracks) {
    string tracksJson = JsonSerializer.Serialize(tracks, JsonOptions);

    var snapshot = new PlaylistSnapshot {
      UserId = userId,
      Provider = provider,
      PlaylistId = playlistId,
      ProviderAccountId = providerAccountId,
      TracksJson = tracksJson,
      CreatedAt = DateTime.UtcNow
    };

    _context.PlaylistSnapshots.Add(snapshot);
    await _context.SaveChangesAsync();
  }

  public async Task CreateSnapshotIfChangedAsync(
    string userId,
    OAuthProvider provider,
    string playlistId,
    string providerAccountId,
    List<ProviderTrack> tracks) {
    PlaylistSnapshot? latestSnapshot = await _context.PlaylistSnapshots
      .Where(s => s.UserId == userId &&
                  s.Provider == provider &&
                  s.PlaylistId == playlistId)
      .OrderByDescending(s => s.CreatedAt)
      .FirstOrDefaultAsync();

    if (latestSnapshot == null) {
      await CreateSnapshotAsync(userId, provider, playlistId, providerAccountId, tracks);
      return;
    }

    List<ProviderTrack> latestTracks = JsonSerializer.Deserialize<List<ProviderTrack>>(
      latestSnapshot.TracksJson, JsonOptions) ?? new();

    if (ArePlaylistsDifferent(latestTracks, tracks)) {
      await CreateSnapshotAsync(userId, provider, playlistId, providerAccountId, tracks);
    }
  }

  private bool ArePlaylistsDifferent(List<ProviderTrack> snapshot, List<ProviderTrack> current) {
    if (snapshot.Count != current.Count) {
      return true;
    }

    string GetTrackKey(ProviderTrack track) {
      if (!string.IsNullOrWhiteSpace(track.TrackUrl)) {
        return track.TrackUrl.ToLowerInvariant().Trim();
      }
      if (!string.IsNullOrWhiteSpace(track.Id)) {
        return track.Id.ToLowerInvariant().Trim();
      }
      return $"{track.Title?.ToLowerInvariant().Trim() ?? ""}|{track.Artist?.ToLowerInvariant().Trim() ?? ""}";
    }

    var snapshotKeys = new HashSet<string>(snapshot.Select(GetTrackKey));
    var currentKeys = new HashSet<string>(current.Select(GetTrackKey));

    return !snapshotKeys.SetEquals(currentKeys);
  }

  public async Task<List<PlaylistSnapshotDto>> GetSnapshotHistoryAsync(
    string userId,
    OAuthProvider provider,
    string playlistId) {
    List<PlaylistSnapshot> snapshots = await _context.PlaylistSnapshots
      .Where(s => s.UserId == userId &&
                  s.Provider == provider &&
                  s.PlaylistId == playlistId)
      .OrderByDescending(s => s.CreatedAt)
      .ToListAsync();

    return snapshots.Select(s => {
      List<ProviderTrack>? tracks = JsonSerializer.Deserialize<List<ProviderTrack>>(s.TracksJson, JsonOptions);
      return new PlaylistSnapshotDto {
        Id = s.Id,
        Provider = s.Provider,
        PlaylistId = s.PlaylistId,
        CreatedAt = s.CreatedAt,
        TrackCount = tracks?.Count ?? 0
      };
    }).ToList();
  }

  public async Task<PlaylistSnapshotDto?> GetSnapshotAsync(int snapshotId) {
    PlaylistSnapshot? snapshot = await _context.PlaylistSnapshots
      .FirstOrDefaultAsync(s => s.Id == snapshotId);

    if (snapshot == null) {
      return null;
    }

    List<ProviderTrack>? tracks = JsonSerializer.Deserialize<List<ProviderTrack>>(snapshot.TracksJson, JsonOptions);

    return new PlaylistSnapshotDto {
      Id = snapshot.Id,
      Provider = snapshot.Provider,
      PlaylistId = snapshot.PlaylistId,
      CreatedAt = snapshot.CreatedAt,
      TrackCount = tracks?.Count ?? 0
    };
  }

  public async Task<PlaylistSnapshotComparisonDto> CompareSnapshotAsync(
    string userId,
    OAuthProvider provider,
    string playlistId,
    string providerAccountId,
    int snapshotId) {
    PlaylistSnapshot? snapshot = await _context.PlaylistSnapshots
      .FirstOrDefaultAsync(s => s.Id == snapshotId &&
                                 s.UserId == userId &&
                                 s.Provider == provider &&
                                 s.PlaylistId == playlistId);

    if (snapshot == null) {
      throw new InvalidOperationException("Snapshot not found");
    }

    List<ProviderTrack> snapshotTracks = JsonSerializer.Deserialize<List<ProviderTrack>>(
      snapshot.TracksJson, JsonOptions) ?? new();

    List<ProviderTrack> currentTracks = await _playlistService.GetTracksByPlaylistIdAsync(
      provider, playlistId, providerAccountId);

    string GetTrackKey(ProviderTrack track) {
      if (!string.IsNullOrWhiteSpace(track.TrackUrl)) {
        return track.TrackUrl.ToLowerInvariant().Trim();
      }
      if (!string.IsNullOrWhiteSpace(track.Id)) {
        return track.Id.ToLowerInvariant().Trim();
      }
      return $"{track.Title?.ToLowerInvariant().Trim() ?? ""}|{track.Artist?.ToLowerInvariant().Trim() ?? ""}";
    }

    var snapshotTrackKeys = new HashSet<string>(snapshotTracks.Select(GetTrackKey));
    var currentTrackKeys = new HashSet<string>(currentTracks.Select(GetTrackKey));

    List<ProviderTrack> addedTracks = currentTracks
      .Where(t => !snapshotTrackKeys.Contains(GetTrackKey(t)))
      .ToList();

    List<ProviderTrack> removedTracks = snapshotTracks
      .Where(t => !currentTrackKeys.Contains(GetTrackKey(t)))
      .ToList();

    return new PlaylistSnapshotComparisonDto {
      Snapshot = new PlaylistSnapshotDto {
        Id = snapshot.Id,
        Provider = snapshot.Provider,
        PlaylistId = snapshot.PlaylistId,
        CreatedAt = snapshot.CreatedAt,
        TrackCount = snapshotTracks.Count
      },
      CurrentTracks = currentTracks,
      SnapshotTracks = snapshotTracks,
      AddedTracks = addedTracks,
      RemovedTracks = removedTracks
    };
  }

  public async Task RevertToSnapshotAsync(
    OAuthProvider provider,
    string playlistId,
    string providerAccountId,
    int snapshotId) {
    PlaylistSnapshot? snapshot = await _context.PlaylistSnapshots
      .FirstOrDefaultAsync(s => s.Id == snapshotId);

    if (snapshot == null) {
      throw new InvalidOperationException("Snapshot not found");
    }

    List<ProviderTrack> snapshotTracks = JsonSerializer.Deserialize<List<ProviderTrack>>(
      snapshot.TracksJson, JsonOptions) ?? new();

    List<ProviderTrack> currentTracks = await _playlistService.GetTracksByPlaylistIdAsync(
      provider, playlistId, providerAccountId);

    string GetTrackKey(ProviderTrack track) {
      if (!string.IsNullOrWhiteSpace(track.TrackUrl)) {
        return track.TrackUrl.ToLowerInvariant().Trim();
      }
      if (!string.IsNullOrWhiteSpace(track.Id)) {
        return track.Id.ToLowerInvariant().Trim();
      }
      return $"{track.Title?.ToLowerInvariant().Trim() ?? ""}|{track.Artist?.ToLowerInvariant().Trim() ?? ""}";
    }

    var snapshotTrackKeys = new HashSet<string>(snapshotTracks.Select(GetTrackKey));
    var currentTrackKeys = new HashSet<string>(currentTracks.Select(GetTrackKey));

    List<ProviderTrack> tracksToAdd = snapshotTracks
      .Where(t => !currentTrackKeys.Contains(GetTrackKey(t)))
      .ToList();

    List<ProviderTrack> tracksToRemove = currentTracks
      .Where(t => !snapshotTrackKeys.Contains(GetTrackKey(t)))
      .ToList();

    var updateRequest = new PlaylistUpdateRequest {
      Id = playlistId,
      Provider = provider,
      AddItems = tracksToAdd.Any() ? tracksToAdd : null,
      RemoveItems = tracksToRemove.Any() ? tracksToRemove : null
    };

    if (tracksToAdd.Any() || tracksToRemove.Any()) {
      await _playlistService.UpdatePlaylistAsync(provider, providerAccountId, updateRequest);
    }
  }
}

