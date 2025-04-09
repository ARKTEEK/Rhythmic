using backend.DataEntity;
using backend.Entity;

namespace backend.Mappers;

public static class UserMapper {
  public static UserDto ToUserDto(this User userEntity) {
    return new UserDto {
      Id = userEntity.Id,
      Email = userEntity.Email
    };
  }

  public static User ToAuthRequest(this CreateUserDto userDto) {
    return new User {
      Email = userDto.Email,
      Password = userDto.Pasword
    };
  }
}