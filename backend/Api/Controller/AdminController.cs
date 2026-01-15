using backend.Application.Interface;
using backend.Application.Model.Admin;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Api.Controller;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase {
  private readonly IAdminService _adminService;

  public AdminController(IAdminService adminService) {
    _adminService = adminService;
  }

  [HttpGet("users")]
  public async Task<ActionResult<List<UserDto>>> GetAllUsers() {
    try {
      var users = await _adminService.GetAllUsersAsync();
      return Ok(users);
    } catch (Exception ex) {
      return StatusCode(500, new { error = ex.Message });
    }
  }

  [HttpPost("users")]
  public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserRequest request) {
    try {
      var user = await _adminService.CreateUserAsync(request);
      return Ok(user);
    } catch (Exception ex) {
      return BadRequest(new { error = ex.Message });
    }
  }

  [HttpPut("users/{userId}/roles")]
  public async Task<ActionResult> UpdateUserRoles(string userId, [FromBody] UpdateUserRolesRequest request) {
    try {
      var success = await _adminService.UpdateUserRolesAsync(userId, request);
      if (!success) {
        return NotFound(new { error = "User not found" });
      }
      return Ok(new { message = "User roles updated successfully" });
    } catch (Exception ex) {
      return BadRequest(new { error = ex.Message });
    }
  }

  [HttpPost("users/{userId}/reset-password")]
  public async Task<ActionResult> ResetUserPassword(string userId) {
    try {
      var success = await _adminService.SendPasswordResetEmailAsync(userId);
      if (!success) {
        return NotFound(new { error = "User not found" });
      }
      return Ok(new { message = "Password reset email sent successfully" });
    } catch (Exception ex) {
      return StatusCode(500, new { error = ex.Message });
    }
  }

  [HttpGet("statistics")]
  public async Task<ActionResult<SystemStatisticsDto>> GetStatistics() {
    try {
      var statistics = await _adminService.GetSystemStatisticsAsync();
      return Ok(statistics);
    } catch (Exception ex) {
      return StatusCode(500, new { error = ex.Message });
    }
  }
}

