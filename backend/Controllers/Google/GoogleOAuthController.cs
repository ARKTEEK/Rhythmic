using backend.DataEntity;
using backend.DataEntity.Auth;
using backend.Entity;
using backend.Enums;
using backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/oauth/google")]
public class
  GoogleOAuthController : OAuthControllerBase<GoogleUserInfoResponse, GoogleTokenResponse> {
  public GoogleOAuthController(
    IUserConnectionService userConnectionService,
    IOAuthService<GoogleUserInfoResponse, GoogleTokenResponse> googleService,
    UserManager<User> userManager)
    : base(userConnectionService, googleService, userManager, OAuthProvider.Google) {
  }
}