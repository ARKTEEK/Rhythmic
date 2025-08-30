using backend.Api.DTO.Auth;

namespace backend.Application.Model;

public record AuthResult(bool Success, AuthResponse? User, IEnumerable<string>? Errors = null);