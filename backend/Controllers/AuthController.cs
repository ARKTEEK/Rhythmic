using backend.DataEntity.Auth;
using backend.Entity;
using backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SignInResult = Microsoft.AspNetCore.Identity.SignInResult;

namespace backend.Controllers;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase {
  private readonly SignInManager<User> _signInManager;
  private readonly ITokenService _tokenService;
  private readonly UserManager<User> _userManager;

  public AuthController(UserManager<User> userManager, ITokenService tokenService,
    SignInManager<User> signInManager) {
    _userManager = userManager;
    _tokenService = tokenService;
    _signInManager = signInManager;
  }

  [HttpPost("register")]
  public async Task<IActionResult> Register([FromBody] RegisterDto registerDto) {
    try {
      if (!ModelState.IsValid) return BadRequest(ModelState);

      User user = new() {
        UserName = registerDto.Username,
        Email = registerDto.Email
      };

      IdentityResult createdUser = await _userManager.CreateAsync(user, registerDto.Password);

      if (createdUser.Succeeded) {
        IdentityResult roleResult = await _userManager.AddToRoleAsync(user, "User");

        if (roleResult.Succeeded)
          return Ok(
            new AuthorizedUserDto {
              UserName = user.UserName,
              Email = user.Email,
              Token = _tokenService.CreateToken(user)
            });

        return StatusCode(500, roleResult.Errors);
      }

      return StatusCode(500, createdUser.Errors);
    } catch (Exception ex) {
      return StatusCode(500, ex);
    }
  }

  [HttpPost("login")]
  public async Task<IActionResult> Login(LoginDto loginDto) {
    if (!ModelState.IsValid) return BadRequest(ModelState);

    User? user = await _userManager.Users.FirstOrDefaultAsync(x => x.Email == loginDto.Email);

    if (user == null) return Unauthorized("Invalid login information.");

    SignInResult result =
      await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

    if (!result.Succeeded) return Unauthorized("Invalid login information.");

    return Ok(new AuthorizedUserDto {
      UserName = user.UserName,
      Email = user.Email,
      Token = _tokenService.CreateToken(user)
    });
  }
}