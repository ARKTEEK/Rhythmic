using backend.Application.Context;
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

public class PlaylistTransferService : IPlaylistTransferService {
  private readonly IAuditLogService _auditService;
  private readonly IPlaylistProviderFactory _playlistFactory;
  private readonly IPlaylistService _playlistService;
  private readonly IAccountTokensService _tokensService;
  private readonly ITrackMatchingService _trackMatchingService;

  public PlaylistTransferService(
    IPlaylistService playlistService,
    IAccountTokensService tokensService,
    IPlaylistProviderFactory playlistFactory,
    IAuditLogService auditService,
    ITrackMatchingService trackMatchingService) {
    _playlistService = playlistService;
    _tokensService = tokensService;
    _playlistFactory = playlistFactory;
    _auditService = auditService;
    _trackMatchingService = trackMatchingService;
  }

  public async Task TransferPlaylistAsync(
    OAuthProvider sourceProvider,
    OAuthProvider destinationProvider,
    string sourceAccountId,
    string destinationAccountId,
    string sourcePlaylistId,
    Func<int, ProviderTrack, bool, Task> onProgress,
    CancellationToken ct
  ) {
    using (AuditContext.BeginScope(AuditType.PlaylistTrasnferred)) {
      List<ProviderTrack> sourceTracks = await _playlistService.GetTracksByPlaylistIdAsync(
        sourceProvider,
        sourcePlaylistId,
        sourceAccountId
      );

      AccountToken destToken =
        await _tokensService.GetAccountToken(destinationAccountId, destinationProvider);

      IPlaylistProviderClient destClient = _playlistFactory.GetClient(destinationProvider);

      ProviderPlaylist destPlaylist = await destClient.CreatePlaylistAsync(
        destToken,
        new PlaylistCreateRequest {
          Title = $"• {DateTime.UtcNow:yyyy-MM-dd HH:mm}",
          Description = "Playlist transferred using Rhythmic.",
          Visibility = PlaylistVisibility.Public
        }
      );

      foreach ((ProviderTrack? source, int index) in sourceTracks.Select((t, i) => (t, i))) {
        ct.ThrowIfCancellationRequested();

        bool added = false;
        string searchQuery = $"{source.Title} {source.Artist}";

        List<ProviderTrack> candidates = await _playlistService.GetSearchResultsAsync(
          destinationProvider,
          destinationAccountId,
          searchQuery
        );

        if (destinationProvider == OAuthProvider.Google) {
          List<string> videoIds = candidates
            .Select(t => t.Id)
            .Where(id => !string.IsNullOrEmpty(id))
            .ToList();

          Dictionary<string, int> durations = await destClient.GetVideoDurationsAsync(
            destToken.AccessToken,
            videoIds
          );

          foreach (ProviderTrack track in candidates) {
            if (durations.TryGetValue(track.Id, out int durationMs)) {
              track.DurationMs = durationMs;
            }
          }
        }

        (ProviderTrack? bestMatch, double score)? matchResult =
          _trackMatchingService.FindBestMatch(
            source,
            candidates
          );

        if (matchResult.HasValue) {
          await _playlistService.UpdatePlaylistAsync(
            destinationProvider,
            destToken.Id,
            new PlaylistUpdateRequest {
              Id = destPlaylist.Id,
              AddItems = new List<ProviderTrack> { matchResult.Value.bestMatch },
              Provider = destinationProvider
            }
          );

          added = true;
        }

        await onProgress(index + 1, source, added);
        await Task.Delay(30, ct);
      }

      AccountToken sourceToken =
        await _tokensService.GetAccountToken(sourceAccountId, sourceProvider);
      IPlaylistProviderClient sourceClient = _playlistFactory.GetClient(sourceProvider);
      List<ProviderPlaylist> sourcePlaylists = await sourceClient.GetPlaylistsAsync(
        sourceToken.Id,
        sourceToken.AccessToken
      );
      ProviderPlaylist sourcePlaylist =
        sourcePlaylists.FirstOrDefault(p => p.Id == sourcePlaylistId);

      string sourcePlaylistTitle = sourcePlaylist?.Title ?? sourcePlaylistId;
      string sourceProviderName = sourceProvider.ToString();
      string destProviderName = destinationProvider.ToString();

      await _auditService.SaveAuditLog(new AuditLogModal {
        UserId = destToken.UserId,
        Executor = ExecutorType.USER,
        Type = AuditType.PlaylistTrasnferred,
        Description =
          $"Transferred playlist \"{sourcePlaylistTitle}\" from {sourceProviderName} to {destProviderName}"
      });
    }
  }
}