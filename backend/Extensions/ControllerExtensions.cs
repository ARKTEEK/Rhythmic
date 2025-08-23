using backend.Entity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Extensions;

public static class ControllerExtensions {
  public static async Task<User?> GetCurrentUserAsync(this ControllerBase controller,
    UserManager<User> userManager) {
    var username = controller.User.GetUsername();
    return await userManager.FindByNameAsync(username);
  }
}