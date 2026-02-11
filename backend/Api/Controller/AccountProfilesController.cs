using backend.Api.DTO;
using backend.Application.Interface.ExternalAuth;
using backend.Application.Mapper;
using backend.Domain.Entity;
using backend.Infrastructure.Extensions;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Api.Controller;

[ApiController]
[Route("api")]
public class AccountProfilesController : ControllerBase {
  private readonly IAccountProfileService _accountProfileService;
  private readonly UserManager<User> _userManager;

  public AccountProfilesController(
    IAccountProfileService accountProfileService,
    UserManager<User> userManager) {
    _accountProfileService = accountProfileService;
    _userManager = userManager;
  }

  [Authorize]
  [HttpGet("account-profiles")]
  public async Task<IActionResult> GetAllAsync() {
    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    List<AccountProfile> profiles = await _accountProfileService.GetAllAsync(user.Id);

    IEnumerable<AccountProfileResponse> profileDto =
      profiles.Select(AccountProfileMapper.ToProviderProfile);

    return Ok(profileDto);
  }
}