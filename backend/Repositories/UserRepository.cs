using backend.DataEntity;
using backend.Entity;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class UserRepository : IUserRepository {
  private readonly AppDbContext _context;

  public UserRepository(AppDbContext context) {
    _context = context;
  }

  public async Task<List<User>> GetAllAsync() {
    return await _context.Users.ToListAsync();
  }

  public async Task<User?> GetByIdAsync(int id) {
    return await _context.Users.FindAsync(id);
  }

  public async Task<User> CreateAsync(User userEntity) {
    await _context.Users.AddAsync(userEntity);
    await _context.SaveChangesAsync();

    return userEntity;
  }

  public async Task<User?> UpdateAsync(int id, UpdateUserDto userDto) {
    var existingUser = await _context.Users.FirstOrDefaultAsync(x => x.Id == id);

    if (existingUser == null) {
      return null;
    }

    existingUser.Email = userDto.Email;
    existingUser.Password = userDto.Pasword;

    await _context.SaveChangesAsync();

    return existingUser;
  }

  public async Task<User?> DeleteAsync(int id) {
    var userEntity = await _context.Users.FirstOrDefaultAsync(x => x.Id == id);

    if (userEntity == null) {
      return null;
    }

    _context.Users.Remove(userEntity);
    await _context.SaveChangesAsync();

    return userEntity;
  }
}