import { History, X } from "lucide-react";
import { useState } from "react";
import { useSnapshotConfirmation } from "../../hooks/snapshots/useSnapshotConfirmation.tsx";
import { useSnapshotData } from "../../hooks/snapshots/useSnapshotData.tsx";
import { useSnapshotFilter } from "../../hooks/snapshots/useSnapshotFilter.tsx";
import { ProviderPlaylist } from "../../models/ProviderPlaylist.ts";
import ConfirmWindow from "../ui/Window/ConfirmWindow.tsx";
import DateFilter from "./history/DateFilter.tsx";
import SnapshotComparison from "./history/SnapshotComparison.tsx";
import SnapshotList from "./history/SnapshotList.tsx";

interface PlaylistHistoryModalProps {
  playlist: ProviderPlaylist;
  onClose: () => void;
  accentSoft?: string;
  accentText: string;
  onRevert?: () => void;
}

export default function PlaylistHistoryModal({
  playlist,
  onClose,
  accentSoft,
  accentText,
  onRevert,
}: PlaylistHistoryModalProps) {
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<number | null>(null);

  const {
    snapshots,
    isLoadingHistory,
    comparison,
    isLoadingComparison,
    revertMutation,
    deleteMutation,
  } = useSnapshotData({
    playlist,
    selectedSnapshotId,
    onRevertSuccess: () => {
      onRevert?.();
      onClose();
    },
    onDeleteSuccess: () => {
      setSelectedSnapshotId(null);
    },
  });

  const {
    dateFilter,
    setDateFilter,
    customDate,
    setCustomDate,
    filteredSnapshots,
  } = useSnapshotFilter(snapshots);

  const {
    confirmAction,
    requestRevert,
    requestDelete,
    confirm,
    cancel,
  } = useSnapshotConfirmation();

  const handleSnapshotSelect = (snapshotId: number) => {
    setSelectedSnapshotId(snapshotId);
  };

  const handleDelete = (snapshotId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    requestDelete(snapshotId);
  };

  const handleConfirmAction = () => {
    const { action, snapshotId } = confirm();
    if (!snapshotId) return;

    if (action === "revert") {
      revertMutation.mutate(snapshotId);
    } else if (action === "delete") {
      deleteMutation.mutate(snapshotId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 font-mono">
      <div className="relative w-[90vw] max-w-6xl bg-[#fff9ec] box-style-lg max-h-[90vh] flex flex-col">
        <div
          className={`w-full px-4 py-2 border-b-4 border-black font-extrabold rounded-t-lg uppercase tracking-wider flex items-center justify-between ${accentSoft} ${accentText}`}>
          <div className="flex items-center gap-2 text-black">
            <History className="w-5 h-5" />
            <span className="text-lg">Playlist History</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-[#f26b6b] hover:bg-[#e55d5d] border-2 border-black box-style-md cursor-pointer">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex min-h-[70vh]">
          <div className="w-1/3 border-r-4 border-black bg-[#fff5df] flex flex-col min-h-[70vh]">
            <div className="px-4 py-2 bg-[#f3d99c] border-b-4 border-black font-extrabold uppercase text-sm">
              Snapshots ({filteredSnapshots.length}/{snapshots.length})
            </div>

            <DateFilter
              dateFilter={dateFilter}
              customDate={customDate}
              onDateFilterChange={setDateFilter}
              onCustomDateChange={setCustomDate}
            />

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 retro-scrollbar">
              <SnapshotList
                snapshots={filteredSnapshots}
                selectedSnapshotId={selectedSnapshotId}
                onSelect={handleSnapshotSelect}
                onDelete={handleDelete}
                isLoading={isLoadingHistory}
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-[#fff9ec]">
            <SnapshotComparison
              comparison={comparison}
              isLoading={isLoadingComparison}
              isReverting={revertMutation.isPending}
              onRevert={requestRevert}
            />
          </div>
        </div>
      </div>

      {confirmAction === "revert" && (
        <ConfirmWindow
          confirmTitle="Revert to Snapshot?"
          confirmMessage="This will modify your playlist to match this snapshot."
          onConfirm={handleConfirmAction}
          onCancel={cancel}
          height="200px"
        />
      )}

      {confirmAction === "delete" && (
        <ConfirmWindow
          confirmTitle="Delete Snapshot?"
          confirmMessage="This action cannot be undone. The snapshot will be permanently deleted."
          onConfirm={handleConfirmAction}
          onCancel={cancel}
          height="200px"
        />
      )}
    </div>
  );
}

