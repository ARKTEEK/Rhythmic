import { getPlaylists } from "../services/YoutubeService.ts";
import { queryOptions } from "@tanstack/react-query";

export default function createPlaylistsQueryOptions() {
  return queryOptions({
    queryKey: ["playlists"],
    queryFn: () => getPlaylists(),
    staleTime: 1000 * 30
  })
}