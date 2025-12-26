using backend.Domain.Enum;

namespace backend.Application.Model;

public class PlaylistCreateRequest {
  public string Title { get; set; }
  public string? Description { get; set; }

  public PlaylistVisibility Visibility { get; set; }

  public List<string>? TrackIds { get; set; }
}

public sealed class SpotifyCreatePlaylistResponse {
  public string id { get; set; } = default!;
  public string name { get; set; } = default!;
  public bool @public { get; set; }
}
