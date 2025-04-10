using backend.Entity;

namespace backend.Services;

public interface ITokenService {
  string CreateToken(User user);
}