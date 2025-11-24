import { useQuery } from "@tanstack/react-query";
import createPlaylistsQueryOptions from "../../queries/createPlaylistsQueryOptions.ts";
import { ProviderPlaylist } from "../../models/ProviderPlaylist.ts";

export interface PlaylistMeta {
  lengthText: string;
  updatedText: string;
  trackCount: number;
}

interface UsePlaylistDataResult {
  isLoading: boolean;
  isError: boolean;
  playlists: ProviderPlaylist[];
  effectivePlaylists: ProviderPlaylist[];
  refetch: () => void;
  isFetching: boolean;
  getPlaylistMeta: (playlistId: string, fallbackTrackCount: number) => PlaylistMeta;
}

export const usePlaylistData = (): UsePlaylistDataResult => {
  const {
    isLoading,
    isError,
    data: playlists = [] as ProviderPlaylist[],
    refetch,
    isFetching
  } = useQuery(createPlaylistsQueryOptions());

  const effectivePlaylists = isError || playlists.length === 0 ? [] : playlists;

  const getPlaylistMeta = (playlistId: string, fallbackTrackCount: number): PlaylistMeta => {
    const lengthText = "0:00";

    const daysAgo = 1;
    const updated = new Date();
    updated.setDate(updated.getDate() - daysAgo);
    const updatedText = updated.toISOString().slice(0, 10);

    return { lengthText, updatedText, trackCount: fallbackTrackCount };
  };

  return {
    isLoading,
    isError,
    playlists,
    effectivePlaylists,
    refetch: refetch as () => void,
    isFetching,
    getPlaylistMeta,
  };
};
