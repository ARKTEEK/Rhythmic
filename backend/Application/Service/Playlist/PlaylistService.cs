using backend.Application.Interface;
using backend.Application.Interface.ExternalAuth;
using backend.Application.Interface.ExternalProvider;
using backend.Application.Interface.Playlist;
using backend.Application.Model.Audit;
using backend.Application.Model.Playlists.Requests;
using backend.Application.Model.Provider;
using backend.Domain.Entity;
using backend.Domain.Enum;

namespace backend.Application.Service.Playlist;

public class PlaylistService : IPlaylistService {
  private readonly IAuditLogService _auditService;
  private readonly IPlaylistProviderFactory _factory;
  private readonly IProviderFactory _providerFactory;
  private readonly IAccountTokensService _tokensService;
  private readonly ITrackMatchingService _trackMatchingService;

  public PlaylistService(
    IAccountTokensService tokensService,
    IPlaylistProviderFactory factory,
    IProviderFactory providerFactory,
    IAuditLogService auditService,
    ITrackMatchingService trackMatchingService) {
    _tokensService = tokensService;
    _factory = factory;
    _providerFactory = providerFactory;
    _auditService = auditService;
    _trackMatchingService = trackMatchingService;
  }

  public async Task<ProviderPlaylist> CreatePlaylistAsync(
    OAuthProvider provider,
    string providerAccountId,
    PlaylistCreateRequest request) {
    AccountToken token = await _tokensService.GetAccountToken(providerAccountId, provider);
    IPlaylistProviderClient client = _factory.GetClient(provider);

    ProviderPlaylist createdPlaylist = await client.CreatePlaylistAsync(token, request);

    await _auditService.SaveAuditLog(new AuditLogModal {
      UserId = token.UserId,
      Executor = ExecutorType.USER,
      Type = AuditType.PlaylistCreated,
      Description = $"Created playlist: {request.Title}"
    });

    return createdPlaylist;
  }

  public async Task UpdatePlaylistAsync(OAuthProvider provider, string providerAccountId,
    PlaylistUpdateRequest request) {
    AccountToken token = await _tokensService.GetAccountToken(providerAccountId, provider);

    IPlaylistProviderClient client = _factory.GetClient(provider);

    List<ProviderPlaylist> playlists =
      await client.GetPlaylistsAsync(token.Id, token.AccessToken);
    ProviderPlaylist playlist = playlists.FirstOrDefault(p => p.Id == request.Id);
    string playlistTitle = playlist?.Title ?? request.Id;

    await client.UpdatePlaylistAsync(token.AccessToken, request);

    string description = "";
    if (request.AddItems?.Any() == true && request.RemoveItems?.Any() == true) {
      description =
        $"Updated playlist: {playlistTitle} (Added {request.AddItems.Count} track(s), Removed {request.RemoveItems.Count} track(s))";
      await _auditService.SaveAuditLog(new AuditLogModal {
        UserId = token.UserId,
        Executor = ExecutorType.USER,
        Type = AuditType.PLaylistUpdated,
        Description = description
      });
    } else if (request.AddItems?.Any() == true) {
      description = $"Added {request.AddItems.Count} track(s) to playlist: {playlistTitle}";
      await _auditService.SaveAuditLog(new AuditLogModal {
        UserId = token.UserId,
        Executor = ExecutorType.USER,
        Type = AuditType.TrackAdded,
        Description = description
      });
    } else if (request.RemoveItems?.Any() == true) {
      description =
        $"Removed {request.RemoveItems.Count} track(s) from playlist: {playlistTitle}";
      await _auditService.SaveAuditLog(new AuditLogModal {
        UserId = token.UserId,
        Executor = ExecutorType.USER,
        Type = AuditType.TrackRemoved,
        Description = description
      });
    } else {
      description = $"Updated playlist: {playlistTitle}";
      await _auditService.SaveAuditLog(new AuditLogModal {
        UserId = token.UserId,
        Executor = ExecutorType.USER,
        Type = AuditType.PLaylistUpdated,
        Description = description
      });
    }
  }

  public async Task<List<ProviderPlaylist>> GetAllUserPlaylistsAsync(
    string userId) {
    List<ProviderPlaylist> playlists = new();

    List<AccountToken> tokens = await _tokensService.GetValidAccountTokens(userId);

    foreach (AccountToken token in tokens) {
      IPlaylistProviderClient client = _factory.GetClient(token.Provider);
      List<ProviderPlaylist> providerPlaylists =
        await client.GetPlaylistsAsync(token.Id, token.AccessToken);
      playlists.AddRange(providerPlaylists);
    }

    return playlists;
  }

  public async Task<List<ProviderTrack>> GetTracksByPlaylistIdAsync(
    OAuthProvider provider,
    string playlistId,
    string providerAccountId) {
    AccountToken token = await _tokensService.GetAccountToken(providerAccountId, provider);

    IPlaylistProviderClient client = _factory.GetClient(provider);

    List<ProviderTrack> tracks =
      await client.GetPlaylistTracksAsync(token.AccessToken, playlistId);

    return tracks;
  }

  public async Task DeletePlaylistAsync(
    OAuthProvider provider,
    string playlistId,
    string providerAccountId) {
    AccountToken token = await _tokensService.GetAccountToken(providerAccountId, provider);
    IPlaylistProviderClient client = _factory.GetClient(token.Provider);

    List<ProviderPlaylist> playlists =
      await client.GetPlaylistsAsync(token.Id, token.AccessToken);
    ProviderPlaylist playlist = playlists.FirstOrDefault(p => p.Id == playlistId);
    string playlistTitle = playlist?.Title ?? playlistId;

    await client.DeletePlaylistAsync(token.AccessToken, playlistId);

    await _auditService.SaveAuditLog(new AuditLogModal {
      UserId = token.UserId,
      Executor = ExecutorType.USER,
      Type = AuditType.PlaylistDeleted,
      Description = $"Deleted playlist: {playlistTitle}"
    });
  }

  public async Task<List<ProviderTrack>> GetSearchResultsAsync(
    OAuthProvider provider,
    string providerAccountId,
    string searchQuery
  ) {
    AccountToken token = await _tokensService.GetAccountToken(providerAccountId, provider);
    IProviderClient client = _providerFactory.GetClient(provider);

    List<ProviderTrack> tracks = await client.Search(token.AccessToken, searchQuery);

    return tracks;
  }

  public async Task FindDuplicateTracksAsync(
    OAuthProvider provider,
    string providerAccountId,
    string playlistId,
    Func<int, ProviderTrack, bool, Task> onProgress,
    CancellationToken ct
  ) {
    List<ProviderTrack> tracks = await GetTracksByPlaylistIdAsync(
      provider,
      playlistId,
      providerAccountId
    );

    HashSet<int> duplicateIndexes = new();

    for (int i = 0; i < tracks.Count; i++) {
      ct.ThrowIfCancellationRequested();

      for (int j = i + 1; j < tracks.Count; j++) {
        bool isDuplicate = _trackMatchingService.AreDuplicates(
          tracks[i],
          tracks[j]
        );

        if (isDuplicate) {
          duplicateIndexes.Add(i);
          duplicateIndexes.Add(j);
        }
      }
    }

    for (int i = 0; i < tracks.Count; i++) {
      bool isDuplicate = duplicateIndexes.Contains(i);
      await onProgress(i + 1, tracks[i], isDuplicate);
      await Task.Delay(30, ct);
    }
  }
}