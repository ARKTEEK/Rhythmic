using backend.Application.Model.Provider;
using backend.Infrastructure.DTO.Google;

namespace backend.Infrastructure.Mapper.Google;

public static class GoogleProfileMapper {
  public static ProviderProfile ToProviderProfile(GoogleUserInfoResponse response) {
    return new ProviderProfile { Id = response.Id, Name = response.Name, Email = response.Email };
  }
}