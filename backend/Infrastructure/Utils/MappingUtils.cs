namespace backend.Infrastructure.Utils;

public static class MappingUtils {
  public static (string Artist, string Track) ParseYoutubeTitle(string title) {
    if (string.IsNullOrWhiteSpace(title)) {
      return (string.Empty, string.Empty);
    }

    string[] delimiters = { " - ", " – ", " — ", " | ", ":" };

    foreach (string delimiter in delimiters) {
      if (title.Contains(delimiter)) {
        string[] parts = title.Split(delimiter, 2, StringSplitOptions.TrimEntries);
        if (parts.Length == 2) {
          return (parts[0], parts[1]);
        }
      }
    }

    return (string.Empty, title);
  }
}