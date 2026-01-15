import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { FaPlus, FaRedo } from "react-icons/fa";
import { useSetTopNavActions } from "../../context/TopNavActionsContext.tsx";
import { ProviderPlaylist } from "../../models/ProviderPlaylist.ts";

interface PlaylistActionsProps {
  selectedIds: Set<string>;
  hasSelection: boolean;
  isFetching: boolean;
  playlists: ProviderPlaylist[];
  refetchPlaylists: () => void;
  onCreatePlaylist: () => void;
}

export default function PlaylistActions({
  selectedIds,
  hasSelection,
  isFetching,
  playlists,
  refetchPlaylists,
  onCreatePlaylist
}: PlaylistActionsProps) {

  const setTopNavActions = useSetTopNavActions();
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["playlists"] });
    await refetchPlaylists();
  };

  const handleSync = () => void handleRefresh();

  const actions = useMemo(() => [
    {
      id: "new",
      label: "New",
      onClick: onCreatePlaylist,
      active: true,
      Icon: FaPlus,
      buttonClassName: "bg-yellow-200 border-2 border-black",
      textClassName: "text-black",
    },
    {
      id: "refresh",
      label: isFetching ? "Refreshing..." : "Refresh",
      onClick: handleRefresh,
      active: true,
      Icon: FaRedo,
      buttonClassName: "bg-yellow-200 border border-brown-800",
      textClassName: "text-brown-900",
    },
  ], [onCreatePlaylist, hasSelection, selectedIds.size, handleSync, isFetching, handleRefresh]);

  useEffect(() => {
    setTopNavActions(actions);
  }, [actions, setTopNavActions]);

  return null;
};
