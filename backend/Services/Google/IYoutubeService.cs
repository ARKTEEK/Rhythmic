using backend.DataEntity;

namespace backend.Services;

public interface IYoutubeService {
  Task<List<YoutubePlaylist>> GetPlaylistsAsync(string accessToken);
}