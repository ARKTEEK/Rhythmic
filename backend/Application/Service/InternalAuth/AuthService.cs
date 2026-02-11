using backend.Api.DTO.Auth;
using backend.Application.Interface.InternalAuth;
using backend.Application.Model;
using backend.Domain.Entity;

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Service.InternalAuth;

public class AuthService {
  private readonly SignInManager<User> _signInManager;
  private readonly ITokenService _tokenService;
  private readonly UserManager<User> _userManager;

  public AuthService(
    UserManager<User> userManager,
    SignInManager<User> signInManager,
    ITokenService tokenService) {
    _userManager = userManager;
    _signInManager = signInManager;
    _tokenService = tokenService;
  }

  public async Task<AuthResult> RegisterAsync(RegisterRequest request) {
    User user = new() { UserName = request.Username, Email = request.Email };
    IdentityResult created = await _userManager.CreateAsync(user, request.Password);

    if (!created.Succeeded) {
      return new AuthResult(false, null, created.Errors.Select(e => e.Description));
    }

    IdentityResult roleResult = await _userManager.AddToRoleAsync(user, "User");
    if (!roleResult.Succeeded) {
      return new AuthResult(false, null, roleResult.Errors.Select(e => e.Description));
    }

    return new AuthResult(true,
      new AuthResponse {
        Username = user.UserName, Email = user.Email, Token = _tokenService.CreateToken(user)
      });
  }

  public async Task<AuthResult> LoginAsync(LoginRequest request) {
    User user = await _userManager.Users.FirstOrDefaultAsync(x => x.Email == request.Email);
    if (user == null) {
      return new AuthResult(false, null);
    }

    SignInResult result =
      await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
    if (!result.Succeeded) {
      return new AuthResult(false, null);
    }

    string token = _tokenService.CreateToken(user);

    return new AuthResult(true,
      new AuthResponse { Username = user.UserName, Email = user.Email, Token = token });
  }
}