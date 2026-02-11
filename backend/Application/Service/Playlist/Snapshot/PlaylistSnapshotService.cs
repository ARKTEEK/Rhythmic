using backend.Application.Interface.Playlist;
using backend.Application.Mapper;
using backend.Application.Model.Playlists.Requests;
using backend.Application.Model.Playlists.Snapshot;
using backend.Application.Model.Provider;
using backend.Application.Serializer;
using backend.Domain.Entity;
using backend.Domain.Enum;
using backend.Domain.Interfaces;

namespace backend.Application.Service.Playlist.Snapshot;

public class PlaylistSnapshotService : IPlaylistSnapshotService {
  private readonly IPlaylistComparisonService _comparisonService;
  private readonly IPlaylistService _playlistService;
  private readonly IPlaylistSnapshotRepository _repository;

  public PlaylistSnapshotService(
    IPlaylistSnapshotRepository repository,
    IPlaylistService playlistService,
    IPlaylistComparisonService comparisonService) {
    _repository = repository;
    _playlistService = playlistService;
    _comparisonService = comparisonService;
  }

  public async Task CreateSnapshotIfChangedAsync(
    string userId,
    OAuthProvider provider,
    string playlistId,
    string providerAccountId,
    List<ProviderTrack> tracks) {
    PlaylistSnapshot? latest = await _repository.GetLatestAsync(userId, provider, playlistId);

    if (latest == null) {
      await _repository.AddAsync(new PlaylistSnapshot {
        UserId = userId,
        Provider = provider,
        PlaylistId = playlistId,
        ProviderAccountId = providerAccountId,
        TracksJson = PlaylistSnapshotSerializer.SerializeTracks(tracks),
        CreatedAt = DateTime.UtcNow
      });
      return;
    }

    List<ProviderTrack> snapshotTracks =
      PlaylistSnapshotSerializer.DeserializeTracks(latest.TracksJson);

    bool areIdentical = _comparisonService.AreIdentical(
      snapshotTracks,
      tracks,
      PlaylistComparisonMode.SetBased
    );

    if (!areIdentical) {
      await _repository.AddAsync(new PlaylistSnapshot {
        UserId = userId,
        Provider = provider,
        PlaylistId = playlistId,
        ProviderAccountId = providerAccountId,
        TracksJson = PlaylistSnapshotSerializer.SerializeTracks(tracks),
        CreatedAt = DateTime.UtcNow
      });
    }
  }

  public async Task<List<PlaylistSnapshotDto>> GetSnapshotHistoryAsync(
    string userId,
    OAuthProvider provider,
    string playlistId) {
    List<PlaylistSnapshot> snapshots =
      await _repository.GetHistoryAsync(userId, provider, playlistId);
    return PlaylistSnapshotMapper.ToDtoList(snapshots);
  }

  public async Task<PlaylistSnapshotDto?> GetSnapshotAsync(int snapshotId) {
    PlaylistSnapshot? snapshot = await _repository.GetByIdAsync(snapshotId);
    return snapshot == null ? null : PlaylistSnapshotMapper.ToDto(snapshot);
  }

  public async Task<PlaylistSnapshotComparisonDto> CompareSnapshotAsync(
    string userId,
    OAuthProvider provider,
    string playlistId,
    string providerAccountId,
    int snapshotId) {
    PlaylistSnapshot snapshot = await _repository.GetByIdAsync(snapshotId)
                                ?? throw new InvalidOperationException("Snapshot not found");

    List<ProviderTrack> snapshotTracks =
      PlaylistSnapshotSerializer.DeserializeTracks(snapshot.TracksJson);
    List<ProviderTrack> currentTracks = await _playlistService.GetTracksByPlaylistIdAsync(
      provider,
      playlistId,
      providerAccountId
    );

    PlaylistDiff diff = _comparisonService.CalculateDiff(
      snapshotTracks,
      currentTracks,
      PlaylistComparisonMode.SetBased
    );

    return new PlaylistSnapshotComparisonDto {
      Snapshot = PlaylistSnapshotMapper.ToDto(snapshot),
      SnapshotTracks = snapshotTracks,
      CurrentTracks = currentTracks,
      AddedTracks = diff.ToAdd.Select(x => x.track).ToList(),
      RemovedTracks = diff.ToRemove
    };
  }

  public async Task RevertToSnapshotAsync(
    OAuthProvider provider,
    string playlistId,
    string providerAccountId,
    int snapshotId) {
    PlaylistSnapshot snapshot = await _repository.GetByIdAsync(snapshotId)
                                ?? throw new InvalidOperationException("Snapshot not found");

    List<ProviderTrack> snapshotTracks =
      PlaylistSnapshotSerializer.DeserializeTracks(snapshot.TracksJson);
    List<ProviderTrack> currentTracks = await _playlistService.GetTracksByPlaylistIdAsync(
      provider,
      playlistId,
      providerAccountId
    );

    PlaylistDiff diff = _comparisonService.CalculateDiff(
      snapshotTracks,
      currentTracks,
      PlaylistComparisonMode.SetBased
    );

    if (diff.HasChanges) {
      await _playlistService.UpdatePlaylistAsync(provider, providerAccountId,
        new PlaylistUpdateRequest {
          Id = playlistId,
          Provider = provider,
          AddItems = diff.ToAdd.Any() ? diff.ToAdd.Select(x => x.track).ToList() : null,
          RemoveItems = diff.ToRemove.Any() ? diff.ToRemove : null
        });
    }
  }

  public async Task DeleteSnapshotAsync(string userId, int snapshotId) {
    PlaylistSnapshot? snapshot = await _repository.GetByIdAsync(snapshotId);

    if (snapshot == null || snapshot.UserId != userId) {
      throw new InvalidOperationException("Snapshot not found or access denied");
    }

    await _repository.DeleteAsync(snapshot);
  }
}