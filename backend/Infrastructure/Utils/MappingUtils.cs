namespace backend.Infrastructure.Utils;

public static class MappingUtils {
  private static readonly string[] Delimiters = { " - ", " – ", " — ", " | ", ":" };

  private static readonly string[] RemovableTags = {
    "official music video",
    "official hd music video",
    "official video",
    "official audio",
    "official lyric video",
    "official visualizer",
    "visualizer",
    "visualiser",
    "lyric video",
    "lyrics",
    "audio",
    "hd music video",
    "video"
  };

  private static readonly string[] TopicSuffixes = {
    "- topic",
    "– topic",
    "— topic",
    " topic"
  };

  public static (string Artist, string Track) ParseAndClean(string title) {
    if (string.IsNullOrWhiteSpace(title)) {
      return (string.Empty, string.Empty);
    }

    (string artist, string track) = SplitArtistTrack(title);

    artist = CleanArtist(artist);
    track = CleanTrack(track);

    return (artist, track);
  }

  private static (string Artist, string Track) SplitArtistTrack(string title) {
    foreach (string delimiter in Delimiters) {
      if (title.Contains(delimiter)) {
        string[] parts = title.Split(delimiter, 2, StringSplitOptions.TrimEntries);
        if (parts.Length == 2) {
          return (parts[0], parts[1]);
        }
      }
    }

    return (string.Empty, title);
  }

  private static string CleanArtist(string artist) {
    if (string.IsNullOrWhiteSpace(artist)) {
      return string.Empty;
    }

    string lower = artist.ToLowerInvariant().Trim();

    foreach (var suffix in TopicSuffixes) {
      if (lower.EndsWith(suffix)) {
        int idx = lower.LastIndexOf(suffix, StringComparison.Ordinal);
        if (idx > 0) {
          string cleaned = artist[..idx].TrimEnd('-', '–', '—', ' ').Trim();
          return cleaned;
        }
      }
    }

    return artist.Trim();
  }

  private static string CleanTrack(string track) {
    if (string.IsNullOrWhiteSpace(track)) {
      return string.Empty;
    }

    string cleaned = track.Trim();

    bool removed;

    do {
      removed = false;
      cleaned = RemoveTrailingContent(cleaned, ref removed);
    } while (removed);

    return cleaned.Trim();
  }

  private static string RemoveTrailingContent(string track, ref bool removed) {
    track = RemoveTrailingGroup(track, '(', ')', ref removed);

    track = RemoveTrailingGroup(track, '[', ']', ref removed);

    return track;
  }

  private static string RemoveTrailingGroup(string track, char open, char close, ref bool removed) {
    int end = track.LastIndexOf(close);
    if (end < 0) {
      return track;
    }

    int start = track.LastIndexOf(open, end);
    if (start < 0 || end < start) {
      return track;
    }

    string inner = track.Substring(start + 1, end - start - 1).Trim().ToLowerInvariant();

    foreach (var tag in RemovableTags) {
      if (inner.Contains(tag)) {
        removed = true;
        return track[..start].Trim();
      }
    }

    return track;
  }
}