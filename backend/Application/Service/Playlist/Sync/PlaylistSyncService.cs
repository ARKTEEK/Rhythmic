using backend.Application.Interface.Job;
using backend.Application.Interface.Playlist;
using backend.Application.Interface.Playlist.Sync;
using backend.Application.Mapper;
using backend.Application.Model.Playlists.Requests;
using backend.Application.Model.Playlists.Sync;
using backend.Application.Model.Provider;
using backend.Domain.Entity;
using backend.Domain.Enum;
using backend.Domain.Interfaces;

namespace backend.Application.Service.Playlist.Sync;

public class PlaylistSyncService : IPlaylistSyncService {
  private readonly IPlaylistComparisonService _comparisonService;
  private readonly IScheduledJobService _jobService;
  private readonly IPlaylistService _playlistService;
  private readonly IPlaylistSyncProcessor _processor;
  private readonly IPlaylistSyncRepository _repository;

  public PlaylistSyncService(
    IPlaylistSyncProcessor processor,
    IPlaylistSyncRepository repository,
    IPlaylistService playlistService,
    IScheduledJobService jobService,
    IPlaylistComparisonService comparisonService) {
    _processor = processor;
    _repository = repository;
    _playlistService = playlistService;
    _jobService = jobService;
    _comparisonService = comparisonService;
  }

  public async Task<PlaylistSyncGroupDto> CreateSyncGroupAsync(
    string userId,
    CreateSyncGroupRequest request) {
    PlaylistSyncGroup syncGroup = PlaylistSyncMapper.ToEntity(request, userId);
    syncGroup = await _repository.CreateSyncGroupAsync(syncGroup);

    await _jobService.CreateScheduledJobAsync(userId, "PlaylistSync", "PlaylistSyncGroup",
      syncGroup.Id, 60);
    return PlaylistSyncMapper.ToDto(syncGroup);
  }

  public async Task<PlaylistSyncGroupDto?> GetSyncGroupAsync(string userId, int syncGroupId) {
    PlaylistSyncGroup? syncGroup = await _repository.GetSyncGroupByIdAsync(userId, syncGroupId);

    if (syncGroup == null) {
      return null;
    }

    return PlaylistSyncMapper.ToDto(syncGroup);
  }

  public async Task<List<PlaylistSyncGroupDto>> GetSyncGroupsAsync(string userId) {
    List<PlaylistSyncGroup> syncGroups = await _repository.GetSyncGroupsByUserIdAsync(userId);
    return syncGroups.Select(PlaylistSyncMapper.ToDto).ToList();
  }

  public async Task<PlaylistSyncGroupDto> UpdateSyncGroupAsync(
    string userId,
    int syncGroupId,
    string? name,
    bool? syncEnabled) {
    PlaylistSyncGroup? syncGroup = await _repository.GetSyncGroupByIdAsync(userId, syncGroupId);

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
    await _repository.UpdateSyncGroupAsync(syncGroup);

    return await GetSyncGroupAsync(userId, syncGroupId) ??
           throw new InvalidOperationException("Failed to update sync group");
  }

  public async Task DeleteSyncGroupAsync(string userId, int syncGroupId) {
    PlaylistSyncGroup syncGroup =
      await _repository.GetSyncGroupByIdAsync(userId, syncGroupId)
      ?? throw new InvalidOperationException("Not found");

    List<ScheduledJob> jobs =
      await _repository.GetScheduledJobsForSyncGroupAsync(userId, syncGroupId);
    foreach (ScheduledJob job in jobs) {
      await _jobService.DeleteScheduledJobAsync(job.Id);
    }

    await _repository.DeleteSyncGroupAsync(syncGroup);
  }

  public async Task<PlaylistSyncGroupDto> AddChildPlaylistAsync(string userId, int syncGroupId,
    AddChildPlaylistRequest request) {
    PlaylistSyncGroup? syncGroup = await _repository.GetSyncGroupByIdAsync(userId, syncGroupId);

    if (syncGroup == null) {
      throw new InvalidOperationException("Sync group not found");
    }

    PlaylistSyncChild child = new() {
      SyncGroupId = syncGroupId,
      ChildPlaylistId = request.ChildPlaylistId,
      Provider = request.Provider,
      ProviderAccountId = request.ProviderAccountId
    };

    await _repository.AddChildPlaylistAsync(child);

    syncGroup.UpdatedAt = DateTime.UtcNow;
    await _repository.UpdateSyncGroupAsync(syncGroup);

    return await GetSyncGroupAsync(userId, syncGroupId) ??
           throw new InvalidOperationException("Failed to add child playlist");
  }

  public async Task RemoveChildPlaylistAsync(string userId, int syncGroupId, int childId) {
    PlaylistSyncGroup? syncGroup = await _repository.GetSyncGroupByIdAsync(userId, syncGroupId);

    if (syncGroup == null) {
      throw new InvalidOperationException("Sync group not found");
    }

    PlaylistSyncChild? child = syncGroup.Children.FirstOrDefault(c => c.Id == childId);
    if (child == null) {
      throw new InvalidOperationException("Child playlist not found");
    }

    await _repository.RemoveChildPlaylistAsync(child);

    syncGroup.UpdatedAt = DateTime.UtcNow;
    await _repository.UpdateSyncGroupAsync(syncGroup);
  }

  public async Task<SyncResultDto> SyncGroupAsync(string userId, int syncGroupId,
    bool forceSync = false) {
    PlaylistSyncGroup syncGroup =
      await _repository.GetSyncGroupByIdAsync(userId, syncGroupId)
      ?? throw new InvalidOperationException("Sync group not found");

    if (!syncGroup.SyncEnabled && !forceSync) {
      throw new InvalidOperationException("Sync is disabled");
    }

    SyncResultDto result = await _processor.ProcessSyncGroupAsync(userId, syncGroup, forceSync);

    syncGroup.LastSyncedAt = DateTime.UtcNow;
    syncGroup.UpdatedAt = DateTime.UtcNow;
    await _repository.UpdateSyncGroupAsync(syncGroup);

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

      return _comparisonService.AreIdentical(
        masterTracks,
        childTracks
      );
    } catch {
      return false;
    }
  }
}