using backend.Application.Model;
using backend.Domain.Entity;
using backend.Domain.Enum;

namespace backend.Application.Mapper;

public static class AccountProfileMapper {
  public static AccountProfile ToEntity(this ProviderProfile providerProfile, string userId,
    OAuthProvider provider) {
    return new AccountProfile {
      UserId = userId,
      Provider = provider,
      Displayname = providerProfile.Name,
      Email = providerProfile.Email
    };
  }
}