namespace backend.Api.DTO.OAuth;

public record OAuthLoginResponseDto(
  string AccessToken,
  string RefreshToken,
  int ExpiresIn
);