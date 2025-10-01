using backend.Api.DTO.OAuth;
using backend.Domain.Enum;

namespace backend.Application.Interface;

public interface IOAuthService {
  Task<OAuthLoginResponseDto> LoginAsync(string userId, OAuthProvider provider, string code);
  Task DisconnectAsync(OAuthProvider provider, string providerId);
  string GetLoginUrl(OAuthProvider provider);
}