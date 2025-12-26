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

  public PlaylistService(IPlaylistProviderFactory clientFactory,
    IAccountTokensService tokensService,
    IPlaylistProviderFactory factory, IProviderFactory providerFactory) {
    _clientFactory = clientFactory;
    _tokensService = tokensService;
    _factory = factory;
    _providerFactory = providerFactory;
  }

  public async Task<ProviderPlaylist> CreatePlaylistAsync(
    OAuthProvider provider,
    string accessToken,
    PlaylistCreateRequest request) {
    throw new NotImplementedException();
  }

  public async Task UpdatePlaylistAsync(OAuthProvider provider, string providerAccountId,
    PlaylistUpdateRequest request) {
    AccountToken token = await _tokensService.GetAccountToken(providerAccountId, provider);

    IPlaylistProviderClient client = _factory.GetClient(provider);

    await client.UpdatePlaylistAsync(token.AccessToken, request);
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

    await client.DeletePlaylistAsync(token.AccessToken, playlistId);
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
  }

}
