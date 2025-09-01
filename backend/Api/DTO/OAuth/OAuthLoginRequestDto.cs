namespace backend.Api.DTO.OAuth;

public record OAuthLoginRequestDto(
  string Code,
  string State
);