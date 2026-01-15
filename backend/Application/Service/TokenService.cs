using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using backend.Application.Interface;
using backend.Domain.Entity;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace backend.Application.Service;

public class TokenService : ITokenService {
  private readonly IConfiguration _config;
  private readonly SymmetricSecurityKey _key;
  private readonly UserManager<User> _userManager;

  public TokenService(IConfiguration config, UserManager<User> userManager) {
    _config = config;
    _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JWT:SigningKey"]));
    _userManager = userManager;
  }

  public string CreateToken(User user) {
    List<Claim> claims = new() {
      new Claim(JwtRegisteredClaimNames.Email, user.Email),
      new Claim(JwtRegisteredClaimNames.GivenName, user.UserName),
      new Claim(ClaimTypes.NameIdentifier, user.Id)
    };

    // Add roles to claims
    var roles = _userManager.GetRolesAsync(user).Result;
    foreach (var role in roles) {
      claims.Add(new Claim(ClaimTypes.Role, role));
    }

    SigningCredentials encryptedKey = new(_key, SecurityAlgorithms.HmacSha512Signature);

    SecurityTokenDescriptor tokenDescriptor = new() {
      Subject = new ClaimsIdentity(claims),
      Expires = DateTime.Now.AddDays(14),
      SigningCredentials = encryptedKey,
      Issuer = _config["JWT:Issuer"],
      Audience = _config["JWT:Audience"]
    };

    JwtSecurityTokenHandler tokenHandler = new();
    SecurityToken? token = tokenHandler.CreateToken(tokenDescriptor);

    return tokenHandler.WriteToken(token);
  }

  public string? GetClaimFromToken(string jwt, string claimType) {
    JwtSecurityTokenHandler handler = new();
    JwtSecurityToken? token = handler.ReadJwtToken(jwt);
    return token.Claims.FirstOrDefault(c => c.Type == claimType)?.Value;
  }

  public string CreateCodeVerifier() {
    byte[] bytes = new byte[32];
    RandomNumberGenerator.Fill(bytes);
    return Base64UrlEncode(bytes);
  }

  public string CreateCodeChallenge(string codeVerifier) {
    using var sha = SHA256.Create();
    byte[] hash = sha.ComputeHash(Encoding.ASCII.GetBytes(codeVerifier));
    return Base64UrlEncode(hash);
  }

  public string Base64UrlEncode(byte[] input) {
    return Convert.ToBase64String(input)
      .Replace("+", "-")
      .Replace("/", "_")
      .Replace("=", "");
  }
}
