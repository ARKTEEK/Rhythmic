using backend.Application.Model.Playlists.Snapshot;
using backend.Application.Model.Provider;
using backend.Application.Serializer;
using backend.Domain.Entity;

namespace backend.Application.Mapper;

public static class PlaylistSnapshotMapper {
  public static PlaylistSnapshotDto ToDto(PlaylistSnapshot snapshot) {
    List<ProviderTrack> tracks =
      PlaylistSnapshotSerializer.DeserializeTracks(snapshot.TracksJson);
    return new PlaylistSnapshotDto {
      Id = snapshot.Id,
      Provider = snapshot.Provider,
      PlaylistId = snapshot.PlaylistId,
      CreatedAt = snapshot.CreatedAt,
      TrackCount = tracks.Count
    };
  }

  public static List<PlaylistSnapshotDto> ToDtoList(List<PlaylistSnapshot> snapshots) {
    return snapshots.Select(ToDto).ToList();
  }
}