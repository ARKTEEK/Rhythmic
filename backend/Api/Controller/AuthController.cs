using backend.Api.DTO.Auth;
using backend.Application.Model;
using backend.Application.Service.InternalAuth;

using Microsoft.AspNetCore.Mvc;

namespace backend.Api.Controller;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase {
  private readonly AuthService _authService;

  public AuthController(AuthService authService) {
    _authService = authService;
  }

  [HttpPost("register")]
  public async Task<IActionResult> Register([FromBody] RegisterRequest request) {
    if (!ModelState.IsValid) {
      return BadRequest(ModelState);
    }

    AuthResult authResult = await _authService.RegisterAsync(request);

    if (!authResult.Success) {
      return StatusCode(500, authResult.Errors);
    }

    return Ok(authResult.User);
  }

  [HttpPost("login")]
  public async Task<IActionResult> Login([FromBody] LoginRequest request) {
    if (!ModelState.IsValid) {
      return BadRequest(ModelState);
    }

    AuthResult authResult = await _authService.LoginAsync(request);

    if (!authResult.Success) {
      return Unauthorized("Invalid login information.");
    }

    Response.Cookies.Append("jwt", authResult.User!.Token,
      new CookieOptions {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.Lax,
        Expires = DateTimeOffset.UtcNow.AddDays(14)
      });

    return Ok(authResult.User);
  }
}