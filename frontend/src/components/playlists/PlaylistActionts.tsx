import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { FaDownload, FaRedo, FaSync } from "react-icons/fa";
import { useSetTopNavActions } from "../../context/TopNavActionsContext.tsx";
import { ProviderPlaylist } from "../../models/ProviderPlaylist.ts";

interface PlaylistActionsProps {
  selectedIds: Set<string>;
  hasSelection: boolean;
  isFetching: boolean;
  playlists: ProviderPlaylist[];
  refetchPlaylists: () => void;
}

export default function PlaylistActions({
                                          selectedIds,
                                          hasSelection,
                                          isFetching,
                                          playlists,
                                          refetchPlaylists
                                        }: PlaylistActionsProps) {

  const setTopNavActions = useSetTopNavActions();
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["playlists"] });
    await refetchPlaylists();
  };

  const handleExport = () => {
    const selected = playlists.filter((p) => selectedIds.has(p.id));
    const blob = new Blob([JSON.stringify(selected, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = selected.length > 0 ? `playlists-export-${ selected.length }.json` : "playlists-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSync = () => void handleRefresh();

  const actions = useMemo(() => [
    {
      id: "export",
      label: hasSelection ? `Export (${ selectedIds.size })` : "Export",
      onClick: handleExport,
      active: hasSelection,
      Icon: FaDownload,
      buttonClassName: "bg-yellow-200 border border-brown-800",
      textClassName: "text-brown-900",
    },
    {
      id: "sync",
      label: hasSelection ? `Sync (${ selectedIds.size })` : "Sync",
      onClick: handleSync,
      active: hasSelection,
      Icon: FaSync,
      buttonClassName: "bg-yellow-200 border border-brown-800",
      textClassName: "text-brown-900",
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
  ], [hasSelection, selectedIds.size, handleExport, handleSync, isFetching, handleRefresh]);

  useEffect(() => {
    setTopNavActions(actions);
  }, [actions, setTopNavActions]);

  return null;
};
