using backend.Application.Model;

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
