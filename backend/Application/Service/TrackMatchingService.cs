using backend.Application.Interface;
using backend.Application.Model.Provider;

using F23.StringSimilarity;

namespace backend.Application.Service;

public class TrackMatchingService : ITrackMatchingService {
  private readonly JaroWinkler _jaroWinkler;

  public TrackMatchingService() {
    _jaroWinkler = new JaroWinkler();
  }

  public (ProviderTrack? bestMatch, double score)? FindBestMatch(
    ProviderTrack sourceTrack,
    List<ProviderTrack> candidates,
    int maxCandidates = 10,
    double similarityThreshold = 0.85
  ) {
    if (!candidates.Any()) {
      return null;
    }

    ProviderTrack? bestMatch = null;
    double bestScore = 0.0;

    foreach (ProviderTrack candidate in candidates.Take(maxCandidates)) {
      double titleScore = CalculateSimilarity(
        sourceTrack.Title.ToLowerInvariant(),
        candidate.Title.ToLowerInvariant()
      );

      double artistScore = CalculateSimilarity(
        sourceTrack.Artist.ToLowerInvariant(),
        candidate.Artist.ToLowerInvariant()
      );

      double durationScore = CalculateDurationSimilarity(
        sourceTrack.DurationMs,
        candidate.DurationMs
      );

      double totalScore = (0.5 * titleScore) + (0.3 * artistScore) + (0.2 * durationScore);

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestMatch = candidate;
      }
    }

    if (bestMatch != null && bestScore >= similarityThreshold) {
      return (bestMatch, bestScore);
    }

    return null;
  }

  public bool AreDuplicates(
    ProviderTrack track1,
    ProviderTrack track2,
    double similarityThreshold = 0.9
  ) {
    if (!string.IsNullOrEmpty(track1.TrackUrl) &&
        !string.IsNullOrEmpty(track2.TrackUrl) &&
        track1.TrackUrl == track2.TrackUrl) {
      return true;
    }

    double titleSimilarity = CalculateSimilarity(track1.Title, track2.Title);
    double artistSimilarity = CalculateSimilarity(track1.Artist, track2.Artist);

    return titleSimilarity >= similarityThreshold &&
           artistSimilarity >= similarityThreshold;
  }

  public double CalculateSimilarity(string text1, string text2) {
    if (string.IsNullOrEmpty(text1) || string.IsNullOrEmpty(text2)) {
      return 0.0;
    }

    return _jaroWinkler.Similarity(text1, text2);
  }

  private double CalculateDurationSimilarity(int durationMs1, int durationMs2) {
    if (durationMs1 <= 0 || durationMs2 <= 0) {
      return 0.0;
    }

    double diff = Math.Abs(durationMs1 - durationMs2);
    double relativeDifference = diff / durationMs1;

    if (relativeDifference <= 0.02) {
      return 1.0;
    }

    if (relativeDifference <= 0.05) {
      return 0.5;
    }

    return 0.0;
  }
}