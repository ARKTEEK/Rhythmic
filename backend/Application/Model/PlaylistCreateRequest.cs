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

public sealed class YouTubeCreatePlaylistResponse {
  public string id { get; set; } = default!;
  public Snippet snippet { get; set; } = default!;
  public Status status { get; set; } = default!;
}

public sealed class Snippet {
  public string title { get; set; } = default!;
  public string description { get; set; } = default!;
}

public sealed class Status {
  public string privacyStatus { get; set; } = default!;
}
