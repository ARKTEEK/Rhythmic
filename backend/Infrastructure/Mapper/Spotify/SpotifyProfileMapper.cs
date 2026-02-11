using backend.Application.Model.Provider;
using backend.Infrastructure.DTO.Spotify;

namespace backend.Infrastructure.Mapper.Spotify;

public static class SpotifyProfileMapper {
  public static ProviderProfile ToProviderProfile(SpotifyUserInfoResponse response) {
    return new ProviderProfile { Id = response.Id, Name = response.Name, Email = response.Email };
  }
}