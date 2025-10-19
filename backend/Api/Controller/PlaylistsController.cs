using backend.Application.Interface;
using backend.Application.Model;
using backend.Domain.Entity;
using backend.Domain.Enum;
using backend.Infrastructure.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Api.Controller;

[ApiController]
[Route("api")]
public class PlaylistsController : ControllerBase {
  private readonly IAccountTokensService _tokensService;
  private readonly IPlaylistProviderFactory _factory;
  private readonly UserManager<User> _userManager;

  public PlaylistsController(UserManager<User> userManager, IPlaylistProviderFactory factory,
    IProviderFactory providerFactory, IAccountTokensService tokensService) {
    _userManager = userManager;
    _factory = factory;
    _tokensService = tokensService;
  }

  [Authorize]
  [HttpGet("playlists")]
  public async Task<IActionResult> GetPlaylistsAsync() {
    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    List<ProviderPlaylist> playlists = new List<ProviderPlaylist>();

    List<AccountToken> tokens =
      await _tokensService.GetValidAccountTokens(user.Id);

    foreach (AccountToken token in tokens) {
      IPlaylistProviderClient client = _factory.GetClient(token.Provider);
      List<ProviderPlaylist> providerPlaylists = await client.GetPlaylistsAsync(token.AccessToken);
      playlists.AddRange(providerPlaylists);
    }

    return Ok(playlists);
  }
}