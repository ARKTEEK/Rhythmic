import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
  setFocusedPlaylist: (playlist: ProviderPlaylist | null) => void;
  handleAddSong: (playlist: ProviderPlaylist, track: ProviderTrack) => void;
  handleRemoveSong: (playlist: ProviderPlaylist, track: ProviderTrack) => void;
  getSongsForPlaylist: (playlist: ProviderPlaylist) => ProviderTrack[];
  isLoadingTracks: boolean;
  isTracksError: boolean;
  tracks: ProviderTrack[];
}


export const usePlaylistSongsManagement = (): UsePlaylistSongsManagementResult => {
  const [focusedPlaylist, setFocusedPlaylist] = useState<ProviderPlaylist | null>(null);
  const queryClient = useQueryClient();

  const {
    data: tracks = [],
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

  const getSongsForPlaylist = (playlist: ProviderPlaylist): ProviderTrack[] => {
    return queryClient.getQueryData<ProviderTrack[]>(['tracks', playlist.id]) || [];
  };

  const updatePlaylistItemCount = (playlistId: string, delta: number) => {
    queryClient.setQueryData<ProviderPlaylist[]>(["playlists"], (oldPlaylists) => {
      if (!oldPlaylists) return oldPlaylists;
      return oldPlaylists.map((p) =>
        p.id === playlistId ? { ...p, itemCount: Math.max(0, (p.itemCount || 0) + delta) } : p
      );
    });
  };

  const addSongMutation = useMutation({
    mutationFn: async ({ playlist, track }: { playlist: ProviderPlaylist; track: ProviderTrack }) => {
      const providerName = getProviderName(playlist.provider);
      const updateBody: PlaylistUpdateRequest = {
        id: playlist.id,
        addItems: [track],
        removeItems: [],
        provider: getProviderValue(providerName)!
      };
      return updatePlaylist(providerName, playlist.id, playlist.providerId, updateBody);
    },
    onMutate: async ({ playlist, track }) => {
      await queryClient.cancelQueries({ queryKey: ['tracks', playlist.id] });
      await queryClient.cancelQueries({ queryKey: ['playlists'] });

      const previousTracks = queryClient.getQueryData<ProviderTrack[]>(['tracks', playlist.id]);
      const previousPlaylists = queryClient.getQueryData<ProviderPlaylist[]>(['playlists']);

      queryClient.setQueryData<ProviderTrack[]>(['tracks', playlist.id], (old) => {
        return old ? [...old, track] : [track];
      });

      updatePlaylistItemCount(playlist.id, 1);

      return { previousTracks, previousPlaylists, playlist };
    },
    onSuccess: (_, { playlist, track }) => {
      toast.success(Notification, {
        data: {
          title: 'Added to Playlist',
          content: `${track.title} added successfully.`,
        },
        icon: false,
      });

      queryClient.invalidateQueries({
        queryKey: ['tracks', playlist.id],
        refetchType: 'none'
      });
      queryClient.invalidateQueries({
        queryKey: ['playlists'],
        refetchType: 'none'
      });
    },
    onError: (err, { playlist }, context) => {
      console.error("Failed to add track to playlist:", err);

      if (context?.previousTracks) {
        queryClient.setQueryData(['tracks', playlist.id], context.previousTracks);
      }
      if (context?.previousPlaylists) {
        queryClient.setQueryData(['playlists'], context.previousPlaylists);
      }

      toast.error(Notification, {
        data: {
          title: 'Error',
          content: 'Failed to add song. Please try again.',
        },
        icon: false,
      });
    },
  });

  const removeSongMutation = useMutation({
    mutationFn: async ({ playlist, track }: { playlist: ProviderPlaylist; track: ProviderTrack }) => {
      const providerName = getProviderName(playlist.provider);
      const updateBody: PlaylistUpdateRequest = {
        id: playlist.id,
        addItems: [],
        removeItems: [track],
        provider: getProviderValue(providerName)!
      };
      return updatePlaylist(providerName, playlist.id, playlist.providerId, updateBody);
    },
    onMutate: async ({ playlist, track }) => {
      await queryClient.cancelQueries({ queryKey: ['tracks', playlist.id] });
      await queryClient.cancelQueries({ queryKey: ['playlists'] });

      const previousTracks = queryClient.getQueryData<ProviderTrack[]>(['tracks', playlist.id]);
      const previousPlaylists = queryClient.getQueryData<ProviderPlaylist[]>(['playlists']);

      const isGoogle = getProviderValue(track.provider) === OAuthProvider.Google;
      const removalKey = isGoogle ? track.playlistId : track.id;

      queryClient.setQueryData<ProviderTrack[]>(['tracks', playlist.id], (old) => {
        if (!old) return old;
        return old.filter(t => {
          const compareKey = isGoogle ? t.playlistId : t.id;
          if (compareKey !== removalKey) return true;
          if (track.position !== undefined && t.position !== undefined) {
            return t.position !== track.position;
          }
          return false;
        });
      });

      updatePlaylistItemCount(playlist.id, -1);

      return { previousTracks, previousPlaylists, playlist };
    },
    onSuccess: (_, { track, playlist }) => {
      toast.info(Notification, {
        data: {
          title: "Removed Song",
          content: `Removed "${track.title}" from playlist.`
        },
        icon: false
      });

      queryClient.invalidateQueries({
        queryKey: ['tracks', playlist.id],
        refetchType: 'none'
      });
      queryClient.invalidateQueries({
        queryKey: ['playlists'],
        refetchType: 'none'
      });
    },
    onError: (err, { playlist }, context) => {
      console.error("Failed to remove track from playlist:", err);

      if (context?.previousTracks) {
        queryClient.setQueryData(['tracks', playlist.id], context.previousTracks);
      }
      if (context?.previousPlaylists) {
        queryClient.setQueryData(['playlists'], context.previousPlaylists);
      }

      toast.error(Notification, {
        data: {
          title: "Error",
          content: "Failed to remove song."
        },
        icon: false
      });
    },
  });

  const handleAddSong = (playlist: ProviderPlaylist, track: ProviderTrack) => {
    addSongMutation.mutate({ playlist, track });
  };

  const handleRemoveSong = (playlist: ProviderPlaylist, track: ProviderTrack) => {
    removeSongMutation.mutate({ playlist, track });
  };

  return {
    focusedPlaylist,
    setFocusedPlaylist,
    handleAddSong,
    handleRemoveSong,
    getSongsForPlaylist,
    isLoadingTracks,
    isTracksError,
    tracks,
  };
};
