using System.ComponentModel.DataAnnotations;
using backend.Application.Interface;
using backend.Application.Model;
using backend.Domain.Entity;
using backend.Domain.Enum;

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
}