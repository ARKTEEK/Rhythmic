using backend.DataEntity.Auth;
using backend.Entity;
using backend.Enums;
using backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

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