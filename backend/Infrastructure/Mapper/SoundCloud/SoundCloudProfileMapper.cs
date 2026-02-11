using backend.Application.Model.Provider;
using backend.Infrastructure.DTO.SoundCloud;

namespace backend.Infrastructure.Mapper.SoundCloud;

public static class SoundCloudProfileMapper {
  public static ProviderProfile ToProviderProfile(SoundCloudUserResponse response) {
    return new ProviderProfile {
      Id = response.Urn,
      Name = !string.IsNullOrWhiteSpace(response.FullName)
        ? response.FullName
        : response.Username,
      Email = string.Empty
    };
  }
}