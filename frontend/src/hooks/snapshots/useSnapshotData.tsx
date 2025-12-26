import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Notification from "../../components/ui/Notification.tsx";
import { PlaylistSnapshot, PlaylistSnapshotComparison } from "../../models/PlaylistSnapshot.ts";
import { ProviderPlaylist } from "../../models/ProviderPlaylist.ts";
import { compareSnapshot, deleteSnapshot, getSnapshotHistory, revertToSnapshot } from "../../services/PlaylistSnapshotsService.ts";
import { getProviderName } from "../../utils/providerUtils.tsx";

interface UseSnapshotDataProps {
  playlist: ProviderPlaylist;
  selectedSnapshotId: number | null;
  onRevertSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export const useSnapshotData = ({
  playlist,
  selectedSnapshotId,
  onRevertSuccess,
  onDeleteSuccess,
}: UseSnapshotDataProps) => {
  const queryClient = useQueryClient();
  const provider = getProviderName(playlist.provider);

  const {
    data: snapshots = [],
    isLoading: isLoadingHistory,
  } = useQuery<PlaylistSnapshot[]>({
    queryKey: ["playlist-snapshots", playlist.provider, playlist.id],
    queryFn: () => getSnapshotHistory(provider, playlist.id),
  });

  const {
    data: comparison,
    isLoading: isLoadingComparison,
  } = useQuery<PlaylistSnapshotComparison>({
    queryKey: ["snapshot-comparison", selectedSnapshotId, playlist.provider, playlist.id],
    queryFn: () => {
      if (!selectedSnapshotId) throw new Error("No snapshot selected");
      return compareSnapshot(selectedSnapshotId, provider, playlist.id, playlist.providerId);
    },
    enabled: !!selectedSnapshotId,
  });

  const revertMutation = useMutation({
    mutationFn: (snapshotId: number) =>
      revertToSnapshot(snapshotId, provider, playlist.id, playlist.providerId),
    onSuccess: (_, snapshotId) => {
      const revertedSnapshot = snapshots.find(s => s.id === snapshotId);
      const snapshotDate = revertedSnapshot
        ? new Date(revertedSnapshot.createdAt).toLocaleString()
        : "selected snapshot";

      toast.info(Notification, {
        data: {
          title: "Playlist Reverted",
          content: `Playlist has been reverted to snapshot from ${snapshotDate}`
        },
        icon: false
      });

      queryClient.invalidateQueries({ queryKey: ["tracks", playlist.id] });
      queryClient.invalidateQueries({
        queryKey: ["playlist-snapshots", playlist.provider, playlist.id],
      });
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      onRevertSuccess?.();
    },
    onError: () => {
      toast.error("Failed to revert playlist");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (snapshotId: number) => deleteSnapshot(snapshotId),
    onSuccess: (_, snapshotId) => {
      const deletedSnapshot = snapshots.find(s => s.id === snapshotId);
      const snapshotDate = deletedSnapshot
        ? new Date(deletedSnapshot.createdAt).toLocaleString()
        : "selected snapshot";

      toast.info(Notification, {
        data: {
          title: "Snapshot Deleted",
          content: `Snapshot from ${snapshotDate} has been deleted`
        },
        icon: false
      });
      queryClient.invalidateQueries({
        queryKey: ["playlist-snapshots", playlist.provider, playlist.id],
      });
      onDeleteSuccess?.();
    },
    onError: () => {
      toast.error("Failed to delete snapshot");
    },
  });

  return {
    snapshots,
    isLoadingHistory,
    comparison,
    isLoadingComparison,
    revertMutation,
    deleteMutation,
  };
};

