import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Notification from "../../components/ui/Notification.tsx";
import { OAuthProvider } from "../../models/Connection.ts";
import { PlaylistUpdateRequest } from "../../models/PlaylistUpdateRequest.ts";
import { ProviderPlaylist } from "../../models/ProviderPlaylist.ts";
import { ProviderTrack } from "../../models/ProviderTrack.ts";
import { getTracks, updatePlaylist } from "../../services/PlaylistsService.ts";
import { getProviderName, getProviderValue } from "../../utils/providerUtils.tsx";

interface UsePlaylistSongsManagementResult {
  focusedPlaylist: ProviderPlaylist | null;
  playlistIdToSongs: Record<string, ProviderTrack[]>;
  setFocusedPlaylist: (playlist: ProviderPlaylist | null) => void;
  handleAddSong: (playlist: ProviderPlaylist, track: ProviderTrack) => void;
  handleRemoveSong: (playlist: ProviderPlaylist, track: ProviderTrack) => void;
  getSongsForPlaylist: (playlist: ProviderPlaylist) => ProviderTrack[];
  isLoadingTracks: boolean;
  isTracksError: boolean;
}

export const usePlaylistSongsManagement = (): UsePlaylistSongsManagementResult => {
  const [playlistIdToSongs, setPlaylistIdToSongs] = useState<Record<string, ProviderTrack[]>>({});
  const [focusedPlaylist, setFocusedPlaylist] = useState<ProviderPlaylist | null>(null);

  const {
    data: focusedSongs,
    isLoading: isLoadingTracks,
    isError: isTracksError,
  } = useQuery({
    queryKey: ['tracks', focusedPlaylist?.id],
    queryFn: async () => {
      if (!focusedPlaylist) return [];
      const providerName = getProviderName(focusedPlaylist.provider);
      return getTracks(providerName, focusedPlaylist.id, focusedPlaylist.providerId);
    },
    enabled: !!focusedPlaylist,
  });

  useEffect(() => {
    if (focusedPlaylist && focusedSongs && !playlistIdToSongs[focusedPlaylist.id]) {
      setPlaylistIdToSongs(prev => ({
        ...prev,
        [focusedPlaylist.id]: focusedSongs
      }));
    }
  }, [focusedSongs, focusedPlaylist, playlistIdToSongs]);

  const handleAddSong = async (playlist: ProviderPlaylist, track: ProviderTrack) => {
    setPlaylistIdToSongs(prev => {
      const current = prev[playlist.id] || [];
      return { ...prev, [playlist.id]: [...current, track] };
    });
    const providerName = getProviderName(playlist.provider);

    const updateBody: PlaylistUpdateRequest = {
      id: playlist.id,
      addItems: [track],
      removeItems: [],
      provider: getProviderValue(providerName)!
    };

    try {
      await updatePlaylist(providerName, playlist.id, playlist.providerId, updateBody);
      toast.success(Notification, {
        data: {
          title: 'Added to Playlist',
          content: `${track.title} added successfully.`,
        },
        icon: false,
      });
    } catch (err) {
      console.error("Failed to add track to playlist:", err);

      setPlaylistIdToSongs(prev => {
        const current = prev[playlist.id] || [];
        return { ...prev, [playlist.id]: current.filter(s => s.id !== track.id) };
      });

      toast.error(Notification, {
        data: {
          title: 'Error',
          content: 'Failed to add song. Please try again.',
        },
        icon: false,
      });
    }
  };

  const handleRemoveSong = async (playlist: ProviderPlaylist, track: ProviderTrack) => {
    const isGoogle = track.provider === OAuthProvider.Google;
    const removalKey = isGoogle ? track.playlistId : track.id;

    console.log(track.provider + " " + OAuthProvider.Google.toString())
    console.log(isGoogle + " " + removalKey);

    setPlaylistIdToSongs(prev => {
      const current = prev[playlist.id] || [];
      return {
        ...prev,
        [playlist.id]: current.filter(s => {
          const compareKey = isGoogle ? s.playlistId : s.id;
          return compareKey !== removalKey;
        })
      };
    });

    const providerName = getProviderName(playlist.provider);

    const updateBody: PlaylistUpdateRequest = {
      id: playlist.id,
      addItems: [],
      removeItems: [track],
      provider: getProviderValue(providerName)!
    };

    try {
      await updatePlaylist(providerName, playlist.id, playlist.providerId, updateBody);
      toast.info(Notification, {
        data: {
          title: "Removed Song",
          content: `Removed "${track.title}" from playlist.`
        },
        icon: false
      });
    } catch (err) {
      console.error("Failed to remove track from playlist:", err);

      setPlaylistIdToSongs(prev => {
        const current = prev[playlist.id] || [];
        return {
          ...prev,
          [playlist.id]: [...current, track]
        };
      });

      toast.error(Notification, {
        data: {
          title: "Error",
          content: "Failed to remove song."
        },
        icon: false
      });
    }
  };

  const getSongsForPlaylist = (playlist: ProviderPlaylist): ProviderTrack[] => {
    return playlistIdToSongs[playlist.id] || [];
  };

  return {
    focusedPlaylist,
    playlistIdToSongs,
    setFocusedPlaylist,
    handleAddSong,
    handleRemoveSong,
    getSongsForPlaylist,
    isLoadingTracks,
    isTracksError,
  };
};
