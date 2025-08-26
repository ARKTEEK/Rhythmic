using backend.Controllers.Core;
using backend.DataEntity.Google;
using backend.Entity;
using backend.Enums;
using backend.Services.Core;
using backend.Services.User;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers.Google;

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