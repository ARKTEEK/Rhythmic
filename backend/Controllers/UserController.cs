using backend.DataEntity;
using backend.Mappers;
using backend.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[Route("api/user")]
[ApiController]
public class UserController : ControllerBase {
  private readonly AppDbContext _context;
  private readonly IUserRepository _userRepo;

  public UserController(AppDbContext context, IUserRepository userRepo) {
    _context = context;
    _userRepo = userRepo;
  }

  [HttpGet]
  public async Task<IActionResult> GetAll() {
    if (!ModelState.IsValid) {
      return BadRequest(ModelState);
    }

    var users = await _userRepo.GetAllAsync();
    var userDto = users.Select(s => s.ToUserDto());

    return Ok(users);
  }

  [HttpGet("{id:int}")]
  public async Task<IActionResult> GetById([FromRoute] int id) {
    if (!ModelState.IsValid) {
      return BadRequest(ModelState);
    }

    var user = await _userRepo.GetByIdAsync(id);

    if (user == null) {
      return NotFound();
    }

    return Ok(user.ToUserDto());
  }

  [HttpPost]
  public async Task<IActionResult> Create([FromBody] CreateUserDto userDto) {
    if (!ModelState.IsValid) {
      return BadRequest(ModelState);
    }

    var userEntity = userDto.ToAuthRequest();
    await _userRepo.CreateAsync(userEntity);

    return CreatedAtAction(nameof(GetById), new { id = userEntity.Id }, userEntity.ToUserDto());
  }

  [HttpPut]
  [Route("{id:int}")]
  public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateUserDto updateDto) {
    if (!ModelState.IsValid) {
      return BadRequest(ModelState);
    }

    var userEntity = await _userRepo.UpdateAsync(id, updateDto);

    if (userEntity == null) {
      return NotFound();
    }

    return Ok(userEntity.ToUserDto());
  }

  [HttpDelete]
  [Route("{id:int}")]
  public async Task<IActionResult> Delete([FromRoute] int id) {
    if (!ModelState.IsValid) {
      return BadRequest(ModelState);
    }

    var userEntity = await _userRepo.DeleteAsync(id);

    if (userEntity == null) {
      return NotFound();
    }

    return NoContent();
  }
}