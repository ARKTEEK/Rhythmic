using backend.Domain.Entity;

using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Infrastructure.Extensions;

public static class ControllerExtensions {
  public static async Task<User?> GetCurrentUserAsync(this ControllerBase controller,
    UserManager<User> userManager) {
    string username = controller.User.GetUsername();
    return await userManager.FindByNameAsync(username);
  }
}