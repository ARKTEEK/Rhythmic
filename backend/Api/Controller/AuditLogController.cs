using backend.Application.Interface;
using backend.Application.Model.Audit;
using backend.Domain.Entity;
using backend.Infrastructure.Extensions;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Api.Controller;

[ApiController]
[Route("api/logs")]
public class AuditLogController : ControllerBase {
  private readonly IAuditLogService _auditService;
  private readonly UserManager<User> _userManager;

  public AuditLogController(
    UserManager<User> userManager,
    IAuditLogService auditService) {
    _userManager = userManager;
    _auditService = auditService;
  }

  [HttpGet]
  [Authorize]
  public async Task<IActionResult> GetAuditLogs() {
    User? user = await this.GetCurrentUserAsync(_userManager);
    if (user == null) {
      return Unauthorized();
    }

    List<AuditLogDto> logs = await _auditService.GetAuditLogs(user.Id);
    return Ok(logs);
  }
}