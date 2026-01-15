using backend.Application.Interface;
using backend.Application.Model;
using backend.Domain.Entity;
using backend.Domain.Enum;

using F23.StringSimilarity;

namespace backend.Application.Service;

public class PlaylistService : IPlaylistService {
  private readonly IProviderFactory _providerFactory;
  private readonly IPlaylistProviderFactory _clientFactory;
  private readonly IAccountTokensService _tokensService;
  private readonly IPlaylistProviderFactory _factory;
  private readonly IAuditLogService _auditService;

  public PlaylistService(IPlaylistProviderFactory clientFactory,
    IAccountTokensService tokensService,
    IPlaylistProviderFactory factory,
    IProviderFactory providerFactory,
    IAuditLogService auditService) {
    _clientFactory = clientFactory;
    _tokensService = tokensService;
    _factory = factory;
    _providerFactory = providerFactory;
    _auditService = auditService;
  }

  public async Task<ProviderPlaylist> CreatePlaylistAsync(
    OAuthProvider provider,
    string providerAccountId,
    PlaylistCreateRequest request) {
    AccountToken token = await _tokensService.GetAccountToken(providerAccountId, provider);
    IPlaylistProviderClient client = _factory.GetClient(provider);

    var createdPlaylist = await client.CreatePlaylistAsync(token, request);

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

    var playlists = await client.GetPlaylistsAsync(token.Id, token.AccessToken);
    var playlist = playlists.FirstOrDefault(p => p.Id == request.Id);
    string playlistTitle = playlist?.Title ?? request.Id;

    await client.UpdatePlaylistAsync(token.AccessToken, request);

    string description = "";
    if (request.AddItems?.Any() == true && request.RemoveItems?.Any() == true) {
      description = $"Updated playlist: {playlistTitle} (Added {request.AddItems.Count} track(s), Removed {request.RemoveItems.Count} track(s))";
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
      description = $"Removed {request.RemoveItems.Count} track(s) from playlist: {playlistTitle}";
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

    var playlists = await client.GetPlaylistsAsync(token.Id, token.AccessToken);
    var playlist = playlists.FirstOrDefault(p => p.Id == playlistId);
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
    double similarityThreshold = 0.9;

    List<ProviderTrack> tracks = await GetTracksByPlaylistIdAsync(
      provider,
      playlistId,
      providerAccountId
    );

    var jaroWinkler = new JaroWinkler();
    var duplicateIndexes = new HashSet<int>();

    for (int i = 0; i < tracks.Count; i++) {
      ct.ThrowIfCancellationRequested();

      for (int j = i + 1; j < tracks.Count; j++) {
        bool isDuplicate = (!string.IsNullOrEmpty(tracks[i].TrackUrl) &&
                            tracks[i].TrackUrl == tracks[j].TrackUrl) ||
                           (jaroWinkler.Similarity(tracks[i].Title, tracks[j].Title) >=
                            similarityThreshold &&
                            jaroWinkler.Similarity(tracks[i].Artist, tracks[j].Artist) >=
                            similarityThreshold);

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

      Console.WriteLine(sourceProvider + " " + destinationProvider);

      const double similarityThreshold = 0.85;
      const int maxSearchResults = 10;

      var jaro = new JaroWinkler();

      List<ProviderTrack> sourceTracks = await GetTracksByPlaylistIdAsync(
          sourceProvider,
          sourcePlaylistId,
          sourceAccountId
      );

      AccountToken destToken = await _tokensService.GetAccountToken(destinationAccountId, destinationProvider);

      IPlaylistProviderClient destClient = _factory.GetClient(destinationProvider);

      ProviderPlaylist destPlaylist = await destClient.CreatePlaylistAsync(
          destToken,
          new PlaylistCreateRequest {
            Title = $"• {DateTime.UtcNow:yyyy-MM-dd HH:mm}",
            Description = $"Playlist transferred using Rhythmic.",
            Visibility = PlaylistVisibility.Public
          }
      );

      foreach (var (source, index) in sourceTracks.Select((t, i) => (t, i))) {
        ct.ThrowIfCancellationRequested();

        bool added = false;
        string searchQuery = $"{source.Title} {source.Artist}";

        List<ProviderTrack> candidates = await GetSearchResultsAsync(destinationProvider, destinationAccountId, searchQuery);

        if (destinationProvider == OAuthProvider.Google) {
          var videoIds = candidates.Select(t => t.Id).Where(id => !string.IsNullOrEmpty(id)).ToList();
          var durations = await destClient.GetVideoDurationsAsync(destToken.AccessToken, videoIds);

          foreach (var track in candidates) {
            if (durations.TryGetValue(track.Id, out var durationMs)) {
              track.DurationMs = durationMs;
            }
          }
        }

        ProviderTrack? bestMatch = null;
        double bestScore = 0.0;

        foreach (var candidate in candidates.Take(maxSearchResults)) {
          double titleScore = jaro.Similarity(source.Title.ToLowerInvariant(), candidate.Title.ToLowerInvariant());
          double artistScore = jaro.Similarity(source.Artist.ToLowerInvariant(), candidate.Artist.ToLowerInvariant());

          double durationScore = 0.0;
          if (source.DurationMs > 0 && candidate.DurationMs > 0) {
            double diff = Math.Abs(source.DurationMs - candidate.DurationMs);
            double rel = diff / source.DurationMs;

            if (rel <= 0.02) durationScore = 1.0;
            else if (rel <= 0.05) durationScore = 0.5;
          }

          double totalScore = (0.5 * titleScore) + (0.3 * artistScore) + (0.2 * durationScore);

          Console.WriteLine("[SCORE] " + totalScore);

          if (totalScore > bestScore) {
            bestScore = totalScore;
            bestMatch = candidate;
          }
        }

        if (bestMatch != null && bestScore >= similarityThreshold) {
          await UpdatePlaylistAsync(
              destinationProvider,
              destToken.Id,
              new PlaylistUpdateRequest {
                Id = destPlaylist.Id,
                AddItems = new List<ProviderTrack> { bestMatch },
                Provider = destinationProvider
              }
          );

          added = true;
        }

        await onProgress(index + 1, source, added);
        await Task.Delay(30, ct);
      }

      AccountToken sourceToken = await _tokensService.GetAccountToken(sourceAccountId, sourceProvider);
      IPlaylistProviderClient sourceClient = _factory.GetClient(sourceProvider);
      var sourcePlaylists = await sourceClient.GetPlaylistsAsync(sourceToken.Id, sourceToken.AccessToken);
      var sourcePlaylist = sourcePlaylists.FirstOrDefault(p => p.Id == sourcePlaylistId);

      string sourcePlaylistTitle = sourcePlaylist?.Title ?? sourcePlaylistId;
      string sourceProviderName = sourceProvider.ToString();
      string destProviderName = destinationProvider.ToString();

      await _auditService.SaveAuditLog(new AuditLogModal {
        UserId = destToken.UserId,
        Executor = ExecutorType.USER,
        Type = AuditType.PlaylistTrasnferred,
        Description = $"Transferred playlist \"{sourcePlaylistTitle}\" from {sourceProviderName} to {destProviderName}"
      });
    }
  }

  public async Task<List<ProviderPlaylist>> SplitPlaylistAsync(
    OAuthProvider provider,
    string playlistId,
    string providerAccountId,
    string destinationAccountId,
    PlaylistSplitRequest request) {
    AccountToken sourceToken = await _tokensService.GetAccountToken(providerAccountId, provider);
    AccountToken destToken = await _tokensService.GetAccountToken(destinationAccountId, provider);
    IPlaylistProviderClient client = _factory.GetClient(provider);

    List<ProviderTrack> tracks = await GetTracksByPlaylistIdAsync(
      provider, playlistId, providerAccountId);

    if (tracks.Count == 0) {
      throw new InvalidOperationException("Playlist is empty");
    }

    var sourcePlaylists = await client.GetPlaylistsAsync(sourceToken.Id, sourceToken.AccessToken);
    var sourcePlaylist = sourcePlaylists.FirstOrDefault(p => p.Id == playlistId);
    string baseName = request.BaseName ?? sourcePlaylist?.Title ?? "Split Playlist";

    List<List<ProviderTrack>> splitGroups = SplitTracksByStrategy(tracks, request);
    List<string> playlistNames = GeneratePlaylistNames(splitGroups, baseName, request);

    var createdPlaylists = new List<ProviderPlaylist>();
    for (int i = 0; i < splitGroups.Count; i++) {
      string playlistName = playlistNames[i];

      ProviderPlaylist newPlaylist = await client.CreatePlaylistAsync(
        destToken,
        new PlaylistCreateRequest {
          Title = playlistName,
          Description = $"Split from {baseName}",
          Visibility = PlaylistVisibility.Public
        }
      );

      if (splitGroups[i].Any()) {
        var tracksWithResetPositions = splitGroups[i].Select((track, index) => {
          return new ProviderTrack {
            Id = track.Id,
            Title = track.Title,
            Artist = track.Artist,
            Album = track.Album,
            DurationMs = track.DurationMs,
            TrackUrl = track.TrackUrl,
            ThumbnailUrl = track.ThumbnailUrl,
            Position = index,
            PlaylistId = track.PlaylistId,
            Provider = track.Provider
          };
        }).ToList();

        try {
          await UpdatePlaylistAsync(
            provider,
            destToken.Id,
            new PlaylistUpdateRequest {
              Id = newPlaylist.Id,
              Provider = provider,
              AddItems = tracksWithResetPositions,
              RemoveItems = null,
              ReplaceAll = false
            }
          );
        } catch (Exception ex) {
          Console.WriteLine($"Error adding tracks to playlist {newPlaylist.Id}: {ex.Message}");
          throw;
        }
      }

      createdPlaylists.Add(newPlaylist);
    }

    string splitDescription = createdPlaylists.Count > 1
      ? $"Split playlist \"{baseName}\" into {createdPlaylists.Count} playlists: {string.Join(", ", createdPlaylists.Select(p => $"\"{p.Title}\""))}"
      : $"Split playlist \"{baseName}\" (no split needed)";

    await _auditService.SaveAuditLog(new AuditLogModal {
      UserId = sourceToken.UserId,
      Executor = ExecutorType.USER,
      Type = AuditType.PlaylistSplit,
      Description = splitDescription
    });

    return createdPlaylists;
  }

  private List<List<ProviderTrack>> SplitTracksByStrategy(
    List<ProviderTrack> tracks,
    PlaylistSplitRequest request) {
    return request.SplitType switch {
      PlaylistSplitType.ByArtist => SplitByArtist(tracks, request.SplitValue),
      PlaylistSplitType.InHalf => SplitInHalf(tracks),
      PlaylistSplitType.ByNumber => SplitByNumber(tracks, request.SplitValue),
      PlaylistSplitType.ByCustomNumber => SplitByCustomNumber(tracks, request.SplitValue),
      _ => new List<List<ProviderTrack>> { tracks }
    };
  }

  private List<string> GeneratePlaylistNames(
    List<List<ProviderTrack>> splitGroups,
    string baseName,
    PlaylistSplitRequest request) {
    var names = new List<string>();

    if (request.SplitType == PlaylistSplitType.ByArtist && string.IsNullOrWhiteSpace(request.SplitValue)) {
      for (int i = 0; i < splitGroups.Count; i++) {
        var group = splitGroups[i];
        if (group.Any()) {
          string artistName = group.First().Artist?.Trim() ?? "Unknown Artist";
          names.Add($"{baseName} - {artistName}");
        } else {
          names.Add($"{baseName} - Part {i + 1}");
        }
      }
    } else if (request.SplitType == PlaylistSplitType.ByArtist && !string.IsNullOrWhiteSpace(request.SplitValue)) {
      for (int i = 0; i < splitGroups.Count; i++) {
        var group = splitGroups[i];
        if (group.Any()) {
          string artistName = group.First().Artist?.Trim() ?? "Unknown";
          if (artistName.Equals(request.SplitValue.Trim(), StringComparison.OrdinalIgnoreCase)) {
            names.Add($"{baseName} - {artistName}");
          } else {
            names.Add($"{baseName} - Others");
          }
        } else {
          names.Add($"{baseName} - Part {i + 1}");
        }
      }
    } else {
      for (int i = 0; i < splitGroups.Count; i++) {
        names.Add(splitGroups.Count > 1
          ? $"{baseName} - Part {i + 1}"
          : baseName);
      }
    }

    return names;
  }

  private List<List<ProviderTrack>> SplitByArtist(List<ProviderTrack> tracks, string? artistName) {
    if (string.IsNullOrWhiteSpace(artistName)) {
      return tracks
        .GroupBy(t => t.Artist?.ToLowerInvariant().Trim() ?? "Unknown")
        .Select(g => g.ToList())
        .ToList();
    }

    var artistTracks = tracks.Where(t =>
      t.Artist?.ToLowerInvariant().Trim() == artistName.ToLowerInvariant().Trim()).ToList();
    var otherTracks = tracks.Except(artistTracks).ToList();

    var result = new List<List<ProviderTrack>>();
    if (artistTracks.Any()) result.Add(artistTracks);
    if (otherTracks.Any()) result.Add(otherTracks);
    return result;
  }

  private List<List<ProviderTrack>> SplitInHalf(List<ProviderTrack> tracks) {
    int mid = tracks.Count / 2;
    return new List<List<ProviderTrack>> {
      tracks.Take(mid).ToList(),
      tracks.Skip(mid).ToList()
    };
  }

  private List<List<ProviderTrack>> SplitByNumber(List<ProviderTrack> tracks, string? numberStr) {
    if (!int.TryParse(numberStr, out int numberOfPlaylists) || numberOfPlaylists < 2) {
      throw new ArgumentException("Invalid number of playlists");
    }

    int tracksPerPlaylist = (int)Math.Ceiling((double)tracks.Count / numberOfPlaylists);
    var result = new List<List<ProviderTrack>>();

    for (int i = 0; i < numberOfPlaylists; i++) {
      var chunk = tracks.Skip(i * tracksPerPlaylist).Take(tracksPerPlaylist).ToList();
      if (chunk.Any()) {
        result.Add(chunk);
      }
    }

    return result;
  }

  private List<List<ProviderTrack>> SplitByCustomNumber(List<ProviderTrack> tracks, string? numberStr) {
    if (!int.TryParse(numberStr, out int tracksPerPlaylist) || tracksPerPlaylist < 1) {
      throw new ArgumentException("Invalid tracks per playlist");
    }

    var result = new List<List<ProviderTrack>>();
    for (int i = 0; i < tracks.Count; i += tracksPerPlaylist) {
      var chunk = tracks.Skip(i).Take(tracksPerPlaylist).ToList();
      if (chunk.Any()) {
        result.Add(chunk);
      }
    }

    return result;
  }
}
