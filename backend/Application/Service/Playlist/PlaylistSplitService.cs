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

public class PlaylistSplitService : IPlaylistSplitService {
  private readonly IAuditLogService _auditService;
  private readonly IPlaylistProviderFactory _factory;
  private readonly IPlaylistService _playlistService;
  private readonly IAccountTokensService _tokensService;

  public PlaylistSplitService(
    IPlaylistService playlistService,
    IAccountTokensService tokensService,
    IPlaylistProviderFactory factory,
    IAuditLogService auditService) {
    _playlistService = playlistService;
    _tokensService = tokensService;
    _factory = factory;
    _auditService = auditService;
  }

  public async Task<List<ProviderPlaylist>> SplitPlaylistAsync(
    OAuthProvider provider,
    string playlistId,
    string providerAccountId,
    string destinationAccountId,
    PlaylistSplitRequest request) {
    AccountToken sourceToken =
      await _tokensService.GetAccountToken(providerAccountId, provider);
    AccountToken destToken =
      await _tokensService.GetAccountToken(destinationAccountId, provider);
    IPlaylistProviderClient client = _factory.GetClient(provider);

    List<ProviderTrack> tracks = await _playlistService.GetTracksByPlaylistIdAsync(
      provider, playlistId, providerAccountId);

    if (tracks.Count == 0) {
      throw new InvalidOperationException("Playlist is empty");
    }

    List<ProviderPlaylist> sourcePlaylists =
      await client.GetPlaylistsAsync(sourceToken.Id, sourceToken.AccessToken);
    ProviderPlaylist sourcePlaylist = sourcePlaylists.FirstOrDefault(p => p.Id == playlistId);
    string baseName = request.BaseName ?? sourcePlaylist?.Title ?? "Split Playlist";

    List<List<ProviderTrack>> splitGroups = SplitTracksByStrategy(tracks, request);
    List<string> playlistNames = GeneratePlaylistNames(splitGroups, baseName, request);

    List<ProviderPlaylist> createdPlaylists = new();
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
        List<ProviderTrack> tracksWithResetPositions = splitGroups[i]
          .Select((track, index) => {
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
          await _playlistService.UpdatePlaylistAsync(
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
          Console.WriteLine(
            $"Error adding tracks to playlist {newPlaylist.Id}: {ex.Message}");
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
    List<string> names = new();

    if (request.SplitType == PlaylistSplitType.ByArtist &&
        string.IsNullOrWhiteSpace(request.SplitValue)) {
      for (int i = 0; i < splitGroups.Count; i++) {
        List<ProviderTrack> group = splitGroups[i];
        if (group.Any()) {
          string artistName = group.First().Artist?.Trim() ?? "Unknown Artist";
          names.Add($"{baseName} - {artistName}");
        } else {
          names.Add($"{baseName} - Part {i + 1}");
        }
      }
    } else if (request.SplitType == PlaylistSplitType.ByArtist &&
               !string.IsNullOrWhiteSpace(request.SplitValue)) {
      for (int i = 0; i < splitGroups.Count; i++) {
        List<ProviderTrack> group = splitGroups[i];
        if (group.Any()) {
          string artistName = group.First().Artist?.Trim() ?? "Unknown";
          if (artistName.Equals(request.SplitValue.Trim(),
                StringComparison.OrdinalIgnoreCase)) {
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

  private List<List<ProviderTrack>>
    SplitByArtist(List<ProviderTrack> tracks, string? artistName) {
    if (string.IsNullOrWhiteSpace(artistName)) {
      return tracks
        .GroupBy(t => t.Artist?.ToLowerInvariant().Trim() ?? "Unknown")
        .Select(g => g.ToList())
        .ToList();
    }

    List<ProviderTrack> artistTracks = tracks.Where(t =>
      t.Artist?.ToLowerInvariant().Trim() == artistName.ToLowerInvariant().Trim()).ToList();
    List<ProviderTrack> otherTracks = tracks.Except(artistTracks).ToList();

    List<List<ProviderTrack>> result = new();

    if (artistTracks.Any()) {
      result.Add(artistTracks);
    }

    if (otherTracks.Any()) {
      result.Add(otherTracks);
    }

    return result;
  }

  private List<List<ProviderTrack>> SplitInHalf(List<ProviderTrack> tracks) {
    int mid = tracks.Count / 2;
    return new List<List<ProviderTrack>> { tracks.Take(mid).ToList(), tracks.Skip(mid).ToList() };
  }

  private List<List<ProviderTrack>> SplitByNumber(List<ProviderTrack> tracks, string? numberStr) {
    if (!int.TryParse(numberStr, out int numberOfPlaylists) || numberOfPlaylists < 2) {
      throw new ArgumentException("Invalid number of playlists");
    }

    int tracksPerPlaylist = (int)Math.Ceiling((double)tracks.Count / numberOfPlaylists);
    List<List<ProviderTrack>> result = new();

    for (int i = 0; i < numberOfPlaylists; i++) {
      List<ProviderTrack> chunk =
        tracks.Skip(i * tracksPerPlaylist).Take(tracksPerPlaylist).ToList();
      if (chunk.Any()) {
        result.Add(chunk);
      }
    }

    return result;
  }

  private List<List<ProviderTrack>> SplitByCustomNumber(List<ProviderTrack> tracks,
    string? numberStr) {
    if (!int.TryParse(numberStr, out int tracksPerPlaylist) || tracksPerPlaylist < 1) {
      throw new ArgumentException("Invalid tracks per playlist");
    }

    List<List<ProviderTrack>> result = new();
    for (int i = 0; i < tracks.Count; i += tracksPerPlaylist) {
      List<ProviderTrack> chunk = tracks.Skip(i).Take(tracksPerPlaylist).ToList();
      if (chunk.Any()) {
        result.Add(chunk);
      }
    }

    return result;
  }
}