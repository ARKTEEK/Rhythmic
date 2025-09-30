using backend.Domain.Entity;

namespace backend.Application.Interface;

public interface ITokenService {
  string CreateToken(User user);
  string? GetClaimFromToken(string jwt, string claimType);
}