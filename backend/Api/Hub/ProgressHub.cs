namespace backend.Api.Hub;

using Microsoft.AspNetCore.SignalR;

public class ProgressHub : Hub {
  public Task Subscribe(string jobId) {
    return Groups.AddToGroupAsync(Context.ConnectionId, jobId);
  }

  public Task Unsubscribe(string jobId) {
    return Groups.RemoveFromGroupAsync(Context.ConnectionId, jobId);
  }
}