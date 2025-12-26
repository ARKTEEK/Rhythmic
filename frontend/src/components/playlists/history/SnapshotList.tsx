import { Trash2 } from "lucide-react";
import { PlaylistSnapshot } from "../../../models/PlaylistSnapshot.ts";
import { formatSnapshotChange } from "../../../utils/snapshotUtils.tsx";

interface SnapshotListProps {
  snapshots: PlaylistSnapshot[];
  selectedSnapshotId: number | null;
  onSelect: (snapshotId: number) => void;
  onDelete: (snapshotId: number, event: React.MouseEvent) => void;
  isLoading: boolean;
}

export default function SnapshotList({
  snapshots,
  selectedSnapshotId,
  onSelect,
  onDelete,
  isLoading,
}: SnapshotListProps) {
  if (isLoading) {
    return <div className="p-4 text-center italic text-gray-500">Loading history...</div>;
  }

  if (snapshots.length === 0) {
    return (
      <div className="p-4 text-center italic text-gray-500">
        No snapshots in selected period
      </div>
    );
  }

  return (
    <>
      {snapshots.map(snapshot => {
        const isActive = selectedSnapshotId === snapshot.id;
        const { additions, removals } = formatSnapshotChange(snapshot);

        return (
          <div
            key={snapshot.id}
            className={`relative w-full box-style-md transition-all border-2 group overflow-hidden ${
              isActive
                ? "border-black bg-[#ffe9c2]"
                : "border-transparent bg-[#fffaf5] hover:border-[#f3d99c] hover:bg-[#fff3e6]"
            }`}>
            <button
              type="button"
              onClick={() => onSelect(snapshot.id)}
              className="text-left w-full p-3 cursor-pointer">
              <div className="flex items-center justify-between text-sm font-bold mb-1">
                <div className="flex flex-col leading-tight flex-1 pr-2">
                  {snapshot.createdAt && (
                    <span className="text-xs text-gray-800 mt-1">
                      {new Date(snapshot.createdAt).toLocaleDateString()}{" "}
                      {new Date(snapshot.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                <span className="text-xs text-gray-600 whitespace-nowrap">
                  {snapshot.trackCount} tracks
                </span>
                </div>
              </div>
            </button>
            <button
              onClick={(e) => onDelete(snapshot.id, e)}
              className="absolute top-0 right-0 h-full px-2 bg-[#f26b6b] hover:bg-[#e55d5d] border-l-2 border-black translate-x-full group-hover:translate-x-0 transition-transform duration-200 flex items-center cursor-pointer"
              title="Delete snapshot">
              <Trash2 className="w-4 h-4 text-white" />
            </button>
          </div>
        );
      })}
    </>
  );
}

