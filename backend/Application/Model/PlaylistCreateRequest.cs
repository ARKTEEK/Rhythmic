using backend.Domain.Enum;

namespace backend.Application.Model;

public class PlaylistCreateRequest {
  public string Title { get; set; }
  public string? Description { get; set; }

  public PlaylistVisibility Visibility { get; set; }

  public List<string>? TrackIds { get; set; }
}