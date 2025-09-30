using backend.Application.Model;
using backend.Infrastructure.DTO;

namespace backend.Infrastructure.Mapper;

public static class GoogleProfileMapper {
  public static ProviderProfile ToProviderProfile(GoogleUserInfoResponse response) =>
    new() {
      Id = response.Id,
      Name = response.Name,
      Email = response.Email
    };
}