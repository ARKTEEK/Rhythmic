using backend.DataEntity;
using backend.Entity;

namespace backend.Repositories;

public interface IUserRepository {
  Task<List<User>> GetAllAsync();
  Task<User?> GetByIdAsync(int id);
  Task<User> CreateAsync(User userEntity);
  Task<User?> UpdateAsync(int id, UpdateUserDto userDto);
  Task<User?> DeleteAsync(int id);
}