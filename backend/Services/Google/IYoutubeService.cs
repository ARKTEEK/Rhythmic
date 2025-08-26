using backend.DataEntity.Google;

namespace backend.Services.Google;

public interface IYoutubeService {
  Task<List<YoutubePlaylist>> GetPlaylistsAsync(string accessToken);
}