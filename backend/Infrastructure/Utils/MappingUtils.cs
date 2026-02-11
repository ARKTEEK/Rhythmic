using System.Text.RegularExpressions;

namespace backend.Infrastructure.Utils;

public static class MappingUtils {
  private static readonly Regex WhitespaceRegex = new(@"\s+", RegexOptions.Compiled);

  private static readonly Regex TopicRegex = new(@"\s*[-–—]\s*topic\s*$",
    RegexOptions.Compiled | RegexOptions.IgnoreCase);

  private static readonly Regex BracketedFeaturingRegex = new(
    @"\s*[\[\(]\s*(?:feat\.?|ft\.?|featuring)\s+(?<artist>.*?)\s*[\]\)]",
    RegexOptions.Compiled | RegexOptions.IgnoreCase);

  private static readonly Regex UnbracketedFeaturingRegex = new(
    @"\s+(?:feat\.?|ft\.?|featuring)\s+(?<artist>.*)$",
    RegexOptions.Compiled | RegexOptions.IgnoreCase);

  private static readonly string[] Delimiters = { " - ", " – ", " — ", " | ", ":" };

  private static readonly string[] BracketedRemovableTags = {
    "official music video", "official hd music video", "official video", "official audio",
    "official lyric video", "official visualizer", "visualizer", "visualiser", "lyric video",
    "lyrics", "audio", "hd music video", "video", "official"
  };

  private static readonly string[] StandaloneSuffixes = {
    "official music video", "official video", "official audio"
  };

  public static (string Artist, string Track) ParseAndClean(string title) {
    if (string.IsNullOrWhiteSpace(title)) {
      return (string.Empty, string.Empty);
    }

    (string artist, string track) = SplitArtistTrack(title);

    artist = CleanArtist(artist);
    track = CleanTrackTags(track);

    (track, string featArtist) = ExtractFeaturingInfo(track);

    if (!string.IsNullOrEmpty(featArtist)) {
      featArtist = NormalizeWhitespace(featArtist);

      if (string.IsNullOrWhiteSpace(artist)) {
        artist = featArtist;
      } else if (!artist.Contains(featArtist, StringComparison.OrdinalIgnoreCase)) {
        artist = $"{artist}, {featArtist}";
      }
    }

    artist = NormalizeWhitespace(artist);
    track = NormalizeWhitespace(track);

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

  public static string CleanArtist(string artist) {
    if (string.IsNullOrWhiteSpace(artist)) {
      return string.Empty;
    }

    string cleaned = TopicRegex.Replace(artist, "");

    return cleaned.Trim();
  }

  private static (string CleanedTrack, string FeatArtist) ExtractFeaturingInfo(string track) {
    if (string.IsNullOrWhiteSpace(track)) {
      return (string.Empty, string.Empty);
    }

    Match bracketMatch = BracketedFeaturingRegex.Match(track);
    if (bracketMatch.Success) {
      string featArtist = bracketMatch.Groups["artist"].Value.Trim();
      string cleanedTrack = track.Replace(bracketMatch.Value, " ");
      return (cleanedTrack, featArtist);
    }

    Match unbracketedMatch = UnbracketedFeaturingRegex.Match(track);
    if (unbracketedMatch.Success) {
      string featArtist = unbracketedMatch.Groups["artist"].Value.Trim();
      string cleanedTrack = track.Substring(0, unbracketedMatch.Index);
      return (cleanedTrack, featArtist);
    }

    return (track, string.Empty);
  }

  private static string CleanTrackTags(string track) {
    if (string.IsNullOrWhiteSpace(track)) {
      return string.Empty;
    }

    string cleaned = track.Trim();

    bool suffixRemoved;
    do {
      suffixRemoved = false;
      foreach (string suffix in StandaloneSuffixes) {
        if (cleaned.EndsWith(suffix, StringComparison.OrdinalIgnoreCase)) {
          cleaned = cleaned.Substring(0, cleaned.Length - suffix.Length).Trim();
          suffixRemoved = true;
        }
      }
    } while (suffixRemoved);

    bool groupRemoved;
    do {
      groupRemoved = false;
      cleaned = RemoveTrailingContent(cleaned, ref groupRemoved);
    } while (groupRemoved);

    return cleaned;
  }

  private static string NormalizeWhitespace(string input) {
    if (string.IsNullOrWhiteSpace(input)) {
      return string.Empty;
    }

    return WhitespaceRegex.Replace(input, " ").Trim();
  }

  private static string RemoveTrailingContent(string track, ref bool removed) {
    track = RemoveTrailingGroup(track, '(', ')', ref removed);
    track = RemoveTrailingGroup(track, '[', ']', ref removed);
    return track;
  }

  private static string
    RemoveTrailingGroup(string track, char open, char close, ref bool removed) {
    int end = track.LastIndexOf(close);
    if (end < 0) {
      return track;
    }

    int start = track.LastIndexOf(open, end);
    if (start < 0 || end < start) {
      return track;
    }

    string inner = track.Substring(start + 1, end - start - 1).Trim().ToLowerInvariant();

    foreach (string tag in BracketedRemovableTags) {
      if (inner.Contains(tag)) {
        removed = true;
        return track[..start];
      }
    }

    return track;
  }
}