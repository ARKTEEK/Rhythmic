import { queryOptions } from "@tanstack/react-query";
import { getPlaylists } from "../services/PlaylistsService.ts";

export default function createPlaylistsQueryOptions() {
  return queryOptions({
    queryKey: ["playlists"],
    queryFn: () => getPlaylists(),
    staleTime: 1000 * 30,
    retry: 3
  })
}