using backend.Application.Model.Admin;

namespace backend.Application.Interface;

public interface IAdminService {
  Task<List<UserDto>> GetAllUsersAsync();
  Task<UserDto> CreateUserAsync(CreateUserRequest request);
  Task<bool> UpdateUserRolesAsync(string userId, UpdateUserRolesRequest request);
  Task<bool> SendPasswordResetEmailAsync(string userId);
  Task<SystemStatisticsDto> GetSystemStatisticsAsync();
}

