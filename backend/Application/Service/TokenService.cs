using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Application.Interface;
using backend.Domain.Entity;
using Microsoft.IdentityModel.Tokens;

namespace backend.Application.Service;

public class TokenService : ITokenService {
  private readonly IConfiguration _config;
  private readonly SymmetricSecurityKey _key;

  public TokenService(IConfiguration config) {
    _config = config;
    _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JWT:SigningKey"]));
  }

  public string CreateToken(User user) {
    List<Claim> claims = new() {
      new Claim(JwtRegisteredClaimNames.Email, user.Email),
      new Claim(JwtRegisteredClaimNames.GivenName, user.UserName)
    };

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
}