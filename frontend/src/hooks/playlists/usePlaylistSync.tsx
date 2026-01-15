import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import Notification from "../../components/ui/Notification.tsx";
import { PlaylistSyncGroup } from "../../models/PlaylistSync.ts";
import { ProviderPlaylist } from "../../models/ProviderPlaylist.ts";
import {
  getSyncGroups,
  syncGroup,
} from "../../services/PlaylistSyncService.ts";

export const usePlaylistSync = () => {
  const queryClient = useQueryClient();
  const [syncingGroups, setSyncingGroups] = useState<Set<number>>(new Set());

  const { data: syncGroups = [] } = useQuery<PlaylistSyncGroup[]>({
    queryKey: ["sync-groups"],
    queryFn: getSyncGroups,
  });

  const syncMutation = useMutation({
    mutationFn: (syncGroupId: number) => {
      setSyncingGroups(prev => new Set(prev).add(syncGroupId));
      return syncGroup(syncGroupId, false);
    },
    onSuccess: async (result, syncGroupId) => {
      setSyncingGroups(prev => {
        const next = new Set(prev);
        next.delete(syncGroupId);
        return next;
      });

      toast.info(Notification, {
        data: {
          title: "Sync Completed",
          content: `Synced ${result.childrenSynced} playlist(s), skipped ${result.childrenSkipped}, failed ${result.childrenFailed}`,
        },
        icon: false,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["playlists"] }),
        queryClient.invalidateQueries({ queryKey: ["sync-groups"] }),
        queryClient.invalidateQueries({ queryKey: ["tracks"] })
      ]);
    },
    onError: (error: any, syncGroupId) => {
      setSyncingGroups(prev => {
        const next = new Set(prev);
        next.delete(syncGroupId);
        return next;
      });

      toast.error(Notification, {
        data: {
          title: "Sync Failed",
          content: error.response?.data || error.message || "Failed to sync playlist",
        },
        icon: false,
      });
    },
  });

  const findSyncGroupForPlaylist = (playlist: ProviderPlaylist): PlaylistSyncGroup | null => {
    return (
      syncGroups.find(
        (sg) =>
          sg.masterPlaylistId === playlist.id &&
          sg.masterProvider === playlist.provider &&
          sg.masterProviderAccountId === playlist.providerId
      ) || null
    );
  };

  const handleSync = (playlist: ProviderPlaylist) => {
    const syncGroup = findSyncGroupForPlaylist(playlist);
    if (!syncGroup) {
      toast.error(Notification, {
        data: {
          title: "No Sync Group",
          content: "This playlist is not a master in any sync group",
        },
        icon: false,
      });
      return;
    }

    if (!syncGroup.syncEnabled) {
      toast.error(Notification, {
        data: {
          title: "Sync Disabled",
          content: "Sync is disabled for this sync group",
        },
        icon: false,
      });
      return;
    }

    syncMutation.mutate(syncGroup.id);
  };

  const isSyncGroupSyncing = (syncGroupId: number) => {
    return syncingGroups.has(syncGroupId);
  };

  return {
    syncGroups,
    handleSync,
    findSyncGroupForPlaylist,
    isSyncing: syncMutation.isPending,
    syncingGroups,
    isSyncGroupSyncing,
  };
};

