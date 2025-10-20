using backend.Application.Model;
using backend.Infrastructure.DTO;

namespace backend.Infrastructure.Mapper;

public static class SpotifyProfileMapper {
  public static ProviderProfile ToProviderProfile(SpotifyUserInfoResponse response) =>
    new() {
      Id = response.Id,
      Name = response.Name,
      Email = response.Email,
    };
}