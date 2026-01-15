using backend.Application.Interface;
using backend.Application.Model;
using backend.Infrastructure.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Api.Controller;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase {
  private readonly IUserProfileService _userProfileService;

  public UserController(IUserProfileService userProfileService) {
    _userProfileService = userProfileService;
  }

  [HttpPut("profile")]
  public async Task<ActionResult> UpdateProfile([FromBody] UpdateProfileRequest request) {
    try {
      var userId = User.GetUserIdClaim();
      var success = await _userProfileService.UpdateProfileAsync(userId, request);

      if (!success) {
        return NotFound(new { error = "User not found" });
      }

      return Ok(new { message = "Profile updated successfully" });
    } catch (Exception ex) {
      return BadRequest(new { error = ex.Message });
    }
  }

  [HttpPost("change-password")]
  public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordRequest request) {
    try {
      var userId = User.GetUserIdClaim();
      var success = await _userProfileService.ChangePasswordAsync(userId, request);

      if (!success) {
        return NotFound(new { error = "User not found" });
      }

      return Ok(new { message = "Password changed successfully" });
    } catch (Exception ex) {
      return BadRequest(new { error = ex.Message });
    }
  }
}

