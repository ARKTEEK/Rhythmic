using System.Security.Claims;

namespace backend.Infrastructure.Extensions;

public static class ClaimsExtensions {
  public static string GetUsername(this ClaimsPrincipal user) {
    return user.Claims.SingleOrDefault(x =>
      x.Type.Equals("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname")).Value;
  }

  public static string GetUserIdClaim(this ClaimsPrincipal user) {
    return user.FindFirst(ClaimTypes.NameIdentifier)?.Value
      ?? throw new UnauthorizedAccessException("User ID not found in claims");
  }
}
