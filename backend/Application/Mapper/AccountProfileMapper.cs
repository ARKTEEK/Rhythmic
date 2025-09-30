using backend.Api.DTO;
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

  public static AccountProfileResponse ToProviderProfile(this AccountProfile accountProfile) {
    return new AccountProfileResponse {
      Id = accountProfile.Id,
      Displayname = accountProfile.Displayname,
      Provider = accountProfile.Provider,
      Email = accountProfile.Email,
    };
  }
}