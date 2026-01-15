using backend.Application.Interface;
using backend.Application.Model;
using backend.Domain.Entity;
using backend.Domain.Enum;
using backend.Infrastructure.Persistence;

using Microsoft.EntityFrameworkCore;

namespace backend.Application.Service;

public class PlaylistSyncService : IPlaylistSyncService {
  private readonly DatabaseContext _context;
  private readonly IPlaylistService _playlistService;
  private readonly IPlaylistSnapshotService _snapshotService;
  private readonly IScheduledJobService _jobService;

  public PlaylistSyncService(
    DatabaseContext context,
    IPlaylistService playlistService,
    IPlaylistSnapshotService snapshotService,
    IScheduledJobService jobService) {
    _context = context;
    _playlistService = playlistService;
    _snapshotService = snapshotService;
    _jobService = jobService;
  }

  public async Task<PlaylistSyncGroupDto> CreateSyncGroupAsync(string userId, CreateSyncGroupRequest request) {
    var syncGroup = new PlaylistSyncGroup {
      UserId = userId,
      Name = request.Name,
      MasterPlaylistId = request.MasterPlaylistId,
      MasterProvider = request.MasterProvider,
      MasterProviderAccountId = request.MasterProviderAccountId,
      SyncEnabled = true,
      CreatedAt = DateTime.UtcNow,
      UpdatedAt = DateTime.UtcNow
    };

    _context.PlaylistSyncGroups.Add(syncGroup);
    await _context.SaveChangesAsync();

    foreach (var childRequest in request.Children) {
      var child = new PlaylistSyncChild {
        SyncGroupId = syncGroup.Id,
        ChildPlaylistId = childRequest.ChildPlaylistId,
        Provider = childRequest.Provider,
        ProviderAccountId = childRequest.ProviderAccountId
      };
      _context.PlaylistSyncChildren.Add(child);
    }

    await _context.SaveChangesAsync();

    await _jobService.CreateScheduledJobAsync(
      userId,
      "PlaylistSync",
      "PlaylistSyncGroup",
      syncGroup.Id,
      60);

    return await GetSyncGroupAsync(userId, syncGroup.Id) ?? throw new InvalidOperationException("Failed to create sync group");
  }

  public async Task<PlaylistSyncGroupDto?> GetSyncGroupAsync(string userId, int syncGroupId) {
    var syncGroup = await _context.PlaylistSyncGroups
      .Include(sg => sg.Children)
      .FirstOrDefaultAsync(sg => sg.Id == syncGroupId && sg.UserId == userId);

    if (syncGroup == null) {
      return null;
    }

    return MapToDto(syncGroup);
  }

  public async Task<List<PlaylistSyncGroupDto>> GetSyncGroupsAsync(string userId) {
    var syncGroups = await _context.PlaylistSyncGroups
      .Include(sg => sg.Children)
      .Where(sg => sg.UserId == userId)
      .OrderByDescending(sg => sg.CreatedAt)
      .ToListAsync();

    return syncGroups.Select(MapToDto).ToList();
  }

  public async Task<PlaylistSyncGroupDto> UpdateSyncGroupAsync(string userId, int syncGroupId, string? name, bool? syncEnabled) {
    var syncGroup = await _context.PlaylistSyncGroups
      .FirstOrDefaultAsync(sg => sg.Id == syncGroupId && sg.UserId == userId);

    if (syncGroup == null) {
      throw new InvalidOperationException("Sync group not found");
    }

    if (name != null) {
      syncGroup.Name = name;
    }

    if (syncEnabled.HasValue) {
      syncGroup.SyncEnabled = syncEnabled.Value;
    }

    syncGroup.UpdatedAt = DateTime.UtcNow;
    await _context.SaveChangesAsync();

    return await GetSyncGroupAsync(userId, syncGroupId) ?? throw new InvalidOperationException("Failed to update sync group");
  }

  public async Task DeleteSyncGroupAsync(string userId, int syncGroupId) {
    var syncGroup = await _context.PlaylistSyncGroups
      .Include(sg => sg.Children)
      .FirstOrDefaultAsync(sg => sg.Id == syncGroupId && sg.UserId == userId);

    if (syncGroup == null) {
      throw new InvalidOperationException("Sync group not found");
    }

    var jobs = await _context.ScheduledJobs
      .Where(j => j.UserId == userId &&
                  j.JobType == "PlaylistSync" &&
                  j.TargetType == "PlaylistSyncGroup" &&
                  j.TargetId == syncGroupId)
      .ToListAsync();

    foreach (var job in jobs) {
      await _jobService.DeleteScheduledJobAsync(job.Id);
    }

    _context.PlaylistSyncGroups.Remove(syncGroup);
    await _context.SaveChangesAsync();
  }

  public async Task<PlaylistSyncGroupDto> AddChildPlaylistAsync(string userId, int syncGroupId, AddChildPlaylistRequest request) {
    var syncGroup = await _context.PlaylistSyncGroups
      .FirstOrDefaultAsync(sg => sg.Id == syncGroupId && sg.UserId == userId);

    if (syncGroup == null) {
      throw new InvalidOperationException("Sync group not found");
    }

    var child = new PlaylistSyncChild {
      SyncGroupId = syncGroupId,
      ChildPlaylistId = request.ChildPlaylistId,
      Provider = request.Provider,
      ProviderAccountId = request.ProviderAccountId
    };

    _context.PlaylistSyncChildren.Add(child);
    syncGroup.UpdatedAt = DateTime.UtcNow;
    await _context.SaveChangesAsync();

    return await GetSyncGroupAsync(userId, syncGroupId) ?? throw new InvalidOperationException("Failed to add child playlist");
  }

  public async Task RemoveChildPlaylistAsync(string userId, int syncGroupId, int childId) {
    var syncGroup = await _context.PlaylistSyncGroups
      .Include(sg => sg.Children)
      .FirstOrDefaultAsync(sg => sg.Id == syncGroupId && sg.UserId == userId);

    if (syncGroup == null) {
      throw new InvalidOperationException("Sync group not found");
    }

    var child = syncGroup.Children.FirstOrDefault(c => c.Id == childId);
    if (child == null) {
      throw new InvalidOperationException("Child playlist not found");
    }

    _context.PlaylistSyncChildren.Remove(child);
    syncGroup.UpdatedAt = DateTime.UtcNow;
    await _context.SaveChangesAsync();
  }

  public async Task<SyncResultDto> SyncGroupAsync(string userId, int syncGroupId, bool forceSync = false) {
    var syncGroup = await _context.PlaylistSyncGroups
      .Include(sg => sg.Children)
      .FirstOrDefaultAsync(sg => sg.Id == syncGroupId && sg.UserId == userId);

    if (syncGroup == null) {
      throw new InvalidOperationException("Sync group not found");
    }

    if (!syncGroup.SyncEnabled && !forceSync) {
      throw new InvalidOperationException("Sync is disabled for this group");
    }

    var result = new SyncResultDto {
      SyncGroupId = syncGroupId,
      SyncGroupName = syncGroup.Name,
      Success = true,
      ChildrenSynced = 0,
      ChildrenSkipped = 0,
      ChildrenFailed = 0
    };

    try {
      List<ProviderTrack> masterTracks = await _playlistService.GetTracksByPlaylistIdAsync(
        syncGroup.MasterProvider,
        syncGroup.MasterPlaylistId,
        syncGroup.MasterProviderAccountId);

      var lastSnapshot = await _context.PlaylistSnapshots
        .Where(s => s.UserId == userId &&
                   s.Provider == syncGroup.MasterProvider &&
                   s.PlaylistId == syncGroup.MasterPlaylistId)
        .OrderByDescending(s => s.CreatedAt)
        .FirstOrDefaultAsync();

      bool shouldCreateSnapshot = false;
      if (lastSnapshot == null) {
        shouldCreateSnapshot = true;
      } else {
        var timeSinceLastSnapshot = DateTime.UtcNow - lastSnapshot.CreatedAt;
        if (timeSinceLastSnapshot.TotalMinutes >= 30) {
          shouldCreateSnapshot = true;
        }
      }

      if (shouldCreateSnapshot) {
        await _snapshotService.CreateSnapshotIfChangedAsync(
          userId,
          syncGroup.MasterProvider,
          syncGroup.MasterPlaylistId,
          syncGroup.MasterProviderAccountId,
          masterTracks);
      }

      foreach (var child in syncGroup.Children) {
        var childResult = new ChildSyncResultDto {
          ChildPlaylistId = child.ChildPlaylistId
        };

        try {
          List<ProviderTrack> childTracks = await _playlistService.GetTracksByPlaylistIdAsync(
            child.Provider,
            child.ChildPlaylistId,
            child.ProviderAccountId);

          await _snapshotService.CreateSnapshotIfChangedAsync(
            userId,
            child.Provider,
            child.ChildPlaylistId,
            child.ProviderAccountId,
            childTracks);

          bool isIdentical = await ArePlaylistsIdenticalAsync(
            child.Provider,
            child.ChildPlaylistId,
            child.ProviderAccountId,
            masterTracks);

          if (isIdentical && !forceSync) {
            childResult.Skipped = true;
            childResult.SkipReason = "Playlists are identical";
            result.ChildrenSkipped++;
          } else {
            await SyncPlaylistAsync(
              child.Provider,
              child.ChildPlaylistId,
              child.ProviderAccountId,
              masterTracks);

            childResult.Success = true;
            result.ChildrenSynced++;

            child.LastSyncedAt = DateTime.UtcNow;
          }
        } catch (Exception ex) {
          childResult.Success = false;
          childResult.ErrorMessage = ex.Message;
          result.ChildrenFailed++;
          result.Success = false;
        }

        result.ChildResults.Add(childResult);
      }

      syncGroup.LastSyncedAt = DateTime.UtcNow;
      syncGroup.UpdatedAt = DateTime.UtcNow;
      await _context.SaveChangesAsync();

    } catch (Exception ex) {
      result.Success = false;
      result.ErrorMessage = ex.Message;
    }

    return result;
  }

  public async Task<bool> ArePlaylistsIdenticalAsync(
    OAuthProvider provider,
    string playlistId,
    string providerAccountId,
    List<ProviderTrack> masterTracks) {
    try {
      List<ProviderTrack> childTracks = await _playlistService.GetTracksByPlaylistIdAsync(
        provider,
        playlistId,
        providerAccountId);

      return ArePlaylistsIdentical(masterTracks, childTracks);
    } catch {
      return false;
    }
  }

  private bool ArePlaylistsIdentical(List<ProviderTrack> master, List<ProviderTrack> child) {
    if (master.Count != child.Count) {
      return false;
    }

    static string GetTrackKey(ProviderTrack track) {
      if (!string.IsNullOrWhiteSpace(track.TrackUrl)) {
        return track.TrackUrl.ToLowerInvariant().Trim();
      }
      if (!string.IsNullOrWhiteSpace(track.Id)) {
        return track.Id.ToLowerInvariant().Trim();
      }
      return $"{track.Title?.ToLowerInvariant().Trim() ?? ""}|{track.Artist?.ToLowerInvariant().Trim() ?? ""}";
    }

    var masterByPosition = new Dictionary<int, string>();
    var childByPosition = new Dictionary<int, string>();

    foreach (var track in master) {
      int pos = track.Position ?? 0;
      masterByPosition[pos] = GetTrackKey(track);
    }

    foreach (var track in child) {
      int pos = track.Position ?? 0;
      childByPosition[pos] = GetTrackKey(track);
    }

    if (masterByPosition.Count != childByPosition.Count) {
      return false;
    }

    foreach (var (position, masterKey) in masterByPosition) {
      if (!childByPosition.TryGetValue(position, out var childKey) || masterKey != childKey) {
        return false;
      }
    }

    return true;
  }

  private async Task SyncPlaylistAsync(
    OAuthProvider provider,
    string playlistId,
    string providerAccountId,
    List<ProviderTrack> masterTracks) {
    List<ProviderTrack> childTracks = await _playlistService.GetTracksByPlaylistIdAsync(
      provider,
      playlistId,
      providerAccountId);

    var (tracksToAdd, tracksToRemove) = CalculatePlaylistDiff(masterTracks, childTracks);

    var resolvedTracksToAdd = new List<(ProviderTrack track, int position)>();
    foreach (var (masterTrack, position) in tracksToAdd) {
      try {
        string searchQuery = $"{masterTrack.Artist} {masterTrack.Title}".Trim();
        var searchResults = await _playlistService.GetSearchResultsAsync(
          provider,
          providerAccountId,
          searchQuery);

        if (searchResults.Any()) {
          var foundTrack = searchResults.First();
          foundTrack.Position = position;
          resolvedTracksToAdd.Add((foundTrack, position));
        }
      } catch {
        continue;
      }
    }

    bool useReplaceAll = resolvedTracksToAdd.Count + tracksToRemove.Count > masterTracks.Count / 2;

    if (useReplaceAll) {
      var orderedResolvedTracks = resolvedTracksToAdd
        .OrderBy(t => t.position)
        .Select((item, index) => {
          item.track.Position = index;
          return item.track;
        })
        .ToList();

      var updateRequest = new PlaylistUpdateRequest {
        Id = playlistId,
        Provider = provider,
        AddItems = orderedResolvedTracks,
        RemoveItems = null,
        ReplaceAll = true
      };
      await _playlistService.UpdatePlaylistAsync(provider, providerAccountId, updateRequest);
    } else {
      if (tracksToRemove.Any()) {
        var sortedRemovals = tracksToRemove.OrderByDescending(t => t.Position ?? 0).ToList();
        var removeRequest = new PlaylistUpdateRequest {
          Id = playlistId,
          Provider = provider,
          AddItems = null,
          RemoveItems = sortedRemovals,
          ReplaceAll = false
        };
        await _playlistService.UpdatePlaylistAsync(provider, providerAccountId, removeRequest);
      }

      foreach (var (track, position) in resolvedTracksToAdd.OrderByDescending(x => x.position)) {
        track.Position = position;
        var addRequest = new PlaylistUpdateRequest {
          Id = playlistId,
          Provider = provider,
          AddItems = new List<ProviderTrack> { track },
          RemoveItems = null,
          ReplaceAll = false
        };
        await _playlistService.UpdatePlaylistAsync(provider, providerAccountId, addRequest);
      }
    }
  }

  private (List<(ProviderTrack track, int position)> toAdd, List<ProviderTrack> toRemove) CalculatePlaylistDiff(
    List<ProviderTrack> master,
    List<ProviderTrack> child) {
    static string GetTrackKey(ProviderTrack track) {
      if (!string.IsNullOrWhiteSpace(track.TrackUrl)) {
        return track.TrackUrl.ToLowerInvariant().Trim();
      }
      if (!string.IsNullOrWhiteSpace(track.Id)) {
        return track.Id.ToLowerInvariant().Trim();
      }
      return $"{track.Title?.ToLowerInvariant().Trim() ?? ""}|{track.Artist?.ToLowerInvariant().Trim() ?? ""}";
    }

    var masterByPosition = new Dictionary<int, ProviderTrack>();
    var childByPosition = new Dictionary<int, ProviderTrack>();
    var childByKey = new Dictionary<string, ProviderTrack>();

    foreach (var track in master) {
      int pos = track.Position ?? 0;
      masterByPosition[pos] = track;
    }

    foreach (var track in child) {
      int pos = track.Position ?? 0;
      childByPosition[pos] = track;
      childByKey[GetTrackKey(track)] = track;
    }

    var tracksToAdd = new List<(ProviderTrack track, int position)>();
    var tracksToRemove = new List<ProviderTrack>();

    foreach (var (position, masterTrack) in masterByPosition) {
      string masterKey = GetTrackKey(masterTrack);
      if (!childByPosition.TryGetValue(position, out var childTrack) || GetTrackKey(childTrack) != masterKey) {
        tracksToAdd.Add((masterTrack, position));
      }
    }

    foreach (var (position, childTrack) in childByPosition) {
      string childKey = GetTrackKey(childTrack);
      if (!masterByPosition.TryGetValue(position, out var masterTrack) || GetTrackKey(masterTrack) != childKey) {
        tracksToRemove.Add(childTrack);
      }
    }

    return (tracksToAdd, tracksToRemove);
  }

  private PlaylistSyncGroupDto MapToDto(PlaylistSyncGroup syncGroup) {
    return new PlaylistSyncGroupDto {
      Id = syncGroup.Id,
      Name = syncGroup.Name,
      MasterPlaylistId = syncGroup.MasterPlaylistId,
      MasterProvider = syncGroup.MasterProvider,
      MasterProviderAccountId = syncGroup.MasterProviderAccountId,
      SyncEnabled = syncGroup.SyncEnabled,
      LastSyncedAt = syncGroup.LastSyncedAt,
      CreatedAt = syncGroup.CreatedAt,
      UpdatedAt = syncGroup.UpdatedAt,
      Children = syncGroup.Children.Select(c => new PlaylistSyncChildDto {
        Id = c.Id,
        ChildPlaylistId = c.ChildPlaylistId,
        Provider = c.Provider,
        ProviderAccountId = c.ProviderAccountId,
        LastSyncedAt = c.LastSyncedAt
      }).ToList()
    };
  }
}

