import { useMemo, useState } from "react";
import { ProviderPlaylist } from "../../models/ProviderPlaylist.ts";

interface UsePlaylistSelectionResult {
  selectedIds: Set<string>;
  hasSelection: boolean;
  handleToggleSelect: (id: string) => void;
  handleSelectAll: (playlists: ProviderPlaylist[]) => void;
  handleClearSelection: () => void;
}

export const usePlaylistSelection = (): UsePlaylistSelectionResult => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const hasSelection = useMemo(() => selectedIds.size > 0, [selectedIds]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  const handleSelectAll = (playlists: ProviderPlaylist[]) => {
    setSelectedIds(new Set(playlists.map(p => p.id)));
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  return {
    selectedIds,
    hasSelection,
    handleToggleSelect,
    handleSelectAll,
    handleClearSelection,
  };
};
