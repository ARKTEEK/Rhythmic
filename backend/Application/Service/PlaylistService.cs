using System.ComponentModel.DataAnnotations;
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
    IPlaylistProviderClient client = _clientFactory.GetClient(provider);

    if (!client.SupportedVisibilities.Contains(request.Visibility)) {
      throw new ValidationException(
        $"The visibility '{request.Visibility}' is not supported by {provider}."
      );
    }

    return await client.CreatePlaylistAsync(accessToken, request);
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
}