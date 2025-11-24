import { useEffect, useState } from "react";
import { ProviderTrack } from "../../models/ProviderTrack.ts";
import { getTracks } from "../../services/PlaylistsService.ts";
import { getProviderName } from "../../utils/providerUtils.tsx";
import { useQuery } from "@tanstack/react-query";
import { ProviderPlaylist } from "../../models/ProviderPlaylist.ts";

interface UsePlaylistSongsManagementResult {
  focusedPlaylistId: string | null;
  playlistIdToSongs: Record<string, ProviderTrack[]>;
  setFocusedPlaylistId: (id: string | null) => void;
  handleAddSong: (playlistId: string) => void;
  handleRemoveSong: (playlistId: string, songId: string) => void;
  getSongsForPlaylist: (playlistId: string) => ProviderTrack[];
  isLoadingTracks: boolean;
  isTracksError: boolean;
}

export const usePlaylistSongsManagement = (
  effectivePlaylists: ProviderPlaylist[]
): UsePlaylistSongsManagementResult => {
  const [playlistIdToSongs, setPlaylistIdToSongs] = useState<Record<string, ProviderTrack[]>>({});
  const [focusedPlaylistId, setFocusedPlaylistId] = useState<string | null>(null);

  const focusedPlaylist = effectivePlaylists.find(p => p.id === focusedPlaylistId);

  const {
    data: focusedSongs,
    isLoading: isLoadingTracks,
    isError: isTracksError,
  } = useQuery({
    queryKey: ['tracks', focusedPlaylistId],
    queryFn: async () => {
      if (!focusedPlaylist) return [];
      const providerName = getProviderName(focusedPlaylist.provider);
      return getTracks(providerName, focusedPlaylist.id, focusedPlaylist.providerId);
    },
    enabled: !!focusedPlaylist,
  });

  useEffect(() => {
    if (focusedSongs && focusedPlaylistId && !playlistIdToSongs[focusedPlaylistId]) {
      setPlaylistIdToSongs(prev => ({
        ...prev,
        [focusedPlaylistId]: focusedSongs
      }));
    }
  }, [focusedSongs, focusedPlaylistId, playlistIdToSongs]);


  const handleAddSong = (playlistId: string) => {

  };

  const handleRemoveSong = (playlistId: string, songId: string) => {
    setPlaylistIdToSongs(prev => {
      const current: ProviderTrack[] = prev[playlistId] || [];
      return { ...prev, [playlistId]: current.filter(s => s.id !== songId) };
    });
  };

  const getSongsForPlaylist = (playlistId: string): ProviderTrack[] => {
    return playlistIdToSongs[playlistId] || [];
  };

  return {
    focusedPlaylistId,
    playlistIdToSongs,
    setFocusedPlaylistId,
    handleAddSong,
    handleRemoveSong,
    getSongsForPlaylist,
    isLoadingTracks,
    isTracksError,
  };
};
