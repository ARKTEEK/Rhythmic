namespace backend.Services.Core;

public interface ITokenService {
  string CreateToken(Entity.User user);
}