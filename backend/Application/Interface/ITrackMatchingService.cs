using backend.Application.Model.Provider;

namespace backend.Application.Interface;

public interface ITrackMatchingService {
  (ProviderTrack? bestMatch, double score)? FindBestMatch(
    ProviderTrack sourceTrack,
    List<ProviderTrack> candidates,
    int maxCandidates = 10,
    double similarityThreshold = 0.85
  );

  bool AreDuplicates(
    ProviderTrack track1,
    ProviderTrack track2,
    double similarityThreshold = 0.9
  );

  double CalculateSimilarity(string text1, string text2);
}