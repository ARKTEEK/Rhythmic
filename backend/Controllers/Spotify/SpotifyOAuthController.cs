using backend.Controllers.Core;
using backend.DataEntity.Spotify;
using backend.Entity;
using backend.Enums;
using backend.Services.Core;
using backend.Services.User;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers.Spotify;

[ApiController]
[Route("api/oauth/spotify")]
public class
  SpotifyOAuthController : OAuthControllerBase<SpotifyUserInfoResponse, SpotifyTokenResponse> {
  public SpotifyOAuthController(
    IUserConnectionService userConnectionService,
    IOAuthService<SpotifyUserInfoResponse, SpotifyTokenResponse> spotifyService,
    UserManager<User> userManager)
    : base(userConnectionService, spotifyService, userManager, OAuthProvider.Spotify) {
  }
}