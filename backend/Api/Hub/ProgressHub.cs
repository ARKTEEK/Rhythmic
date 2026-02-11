namespace backend.Api.Hub;

public class ProgressHub : Microsoft.AspNetCore.SignalR.Hub {
  public Task Subscribe(string jobId) {
    return Groups.AddToGroupAsync(Context.ConnectionId, jobId);
  }

  public Task Unsubscribe(string jobId) {
    return Groups.RemoveFromGroupAsync(Context.ConnectionId, jobId);
  }
}