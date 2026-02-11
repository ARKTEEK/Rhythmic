using System.Security.Cryptography;
using System.Text;

namespace backend.Infrastructure.Utils;

public static class Pkce {
  public static string GenerateVerifier() {
    return Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
      .Replace("+", "-").Replace("/", "_").Replace("=", "");
  }

  public static string GenerateChallenge(string verifier) {
    using SHA256 sha256 = SHA256.Create();
    byte[] hash = sha256.ComputeHash(Encoding.UTF8.GetBytes(verifier));
    return Convert.ToBase64String(hash)
      .Replace("+", "-").Replace("/", "_").Replace("=", "");
  }
}