import { RotateCcw } from "lucide-react";
import { useMemo } from "react";
import { PlaylistSnapshotComparison } from "../../../models/PlaylistSnapshot.ts";
import { formatDuration } from "../../../utils/playlistUtils.tsx";
import { calculateTrackDiff, isPlaylistIdentical } from "../../../utils/snapshotUtils.tsx";

interface SnapshotComparisonProps {
  comparison: PlaylistSnapshotComparison | undefined;
  isLoading: boolean;
  isReverting: boolean;
  onRevert: (snapshotId: number) => void;
}

export default function SnapshotComparison({
  comparison,
  isLoading,
  isReverting,
  onRevert,
}: SnapshotComparisonProps) {
  const { snapshotRows, currentRows } = useMemo(() => {
    if (!comparison) {
      return { snapshotRows: [], currentRows: [] };
    }
    return calculateTrackDiff(comparison);
  }, [comparison]);

  const isIdentical = useMemo(() => {
    if (!comparison) return false;
    return isPlaylistIdentical(comparison);
  }, [comparison]);

  if (!comparison) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 italic">
        Select a snapshot to compare
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 italic">
        Loading comparison...
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">Comparison</h3>
          <p className="text-sm text-gray-600">
            Snapshot from {new Date(comparison.snapshot.createdAt).toLocaleString()}
          </p>
          {isIdentical && (
            <p className="text-xs text-[#28a745] font-bold mt-1">
              This snapshot is identical to your current playlist
            </p>
          )}
        </div>
        <button
          onClick={() => onRevert(comparison.snapshot.id)}
          disabled={isReverting || isIdentical}
          className="px-4 py-2 bg-[#63d079] hover:bg-[#4ec767] box-style-md uppercase font-extrabold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          title={isIdentical ? "Snapshot is identical to current playlist" : "Revert to this snapshot"}>
          <RotateCcw className="w-4 h-4" />
          Revert
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex gap-4">
        <div className="flex-1 flex flex-col box-style-md border-2 border-black bg-white overflow-hidden">
          <div className="bg-[#f3d99c] border-b-2 border-black px-3 py-2 font-extrabold uppercase text-xs">
            Snapshot ({comparison.snapshotTracks.length} tracks)
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#ffe9c2] border-b-2 border-black sticky top-0">
                <tr className="text-[10px] uppercase tracking-wide">
                  <th className="px-2 py-1.5 text-left">#</th>
                  <th className="px-2 py-1.5 text-left">Title</th>
                  <th className="px-2 py-1.5 text-left">Artist</th>
                  <th className="px-2 py-1.5 text-center w-16">Duration</th>
                </tr>
              </thead>
              <tbody>
                {snapshotRows.map((item, i) => {
                  const bgColor = item.isRemoved
                    ? "bg-[#ffebee] border-l-4 border-l-[#dc3545]"
                    : i % 2 === 0
                      ? "bg-[#fffaf0]"
                      : "bg-white";

                  return (
                    <tr key={`snapshot-${item.track.id}-${i}`} className={bgColor}>
                      <td className="px-2 py-1.5 text-gray-500">{i + 1}</td>
                      <td
                        className={`px-2 py-1.5 max-w-[20ch] truncate ${item.isRemoved ? "line-through text-[#dc3545]" : ""
                          }`}
                        title={item.track.title}>
                        {item.track.title}
                      </td>
                      <td
                        className={`px-2 py-1.5 max-w-[15ch] truncate ${item.isRemoved ? "line-through text-[#dc3545]" : ""
                          }`}
                        title={item.track.artist}>
                        {item.track.artist}
                      </td>
                      <td
                        className={`px-2 py-1.5 text-center ${item.isRemoved ? "line-through text-[#dc3545]" : ""
                          }`}>
                        {formatDuration(item.track.durationMs)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex-1 flex flex-col box-style-md border-2 border-black bg-white overflow-hidden">
          <div className="bg-[#f3d99c] border-b-2 border-black px-3 py-2 font-extrabold uppercase text-xs">
            Current Playlist ({comparison.currentTracks.length} tracks)
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#ffe9c2] border-b-2 border-black sticky top-0">
                <tr className="text-[10px] uppercase tracking-wide">
                  <th className="px-2 py-1.5 text-left">#</th>
                  <th className="px-2 py-1.5 text-left">Title</th>
                  <th className="px-2 py-1.5 text-left">Artist</th>
                  <th className="px-2 py-1.5 text-center w-16">Duration</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((item, i) => {
                  const bgColor = item.isAdded
                    ? "bg-[#e8f5e9] border-l-4 border-l-[#28a745]"
                    : i % 2 === 0
                      ? "bg-[#fffaf0]"
                      : "bg-white";

                  return (
                    <tr key={`current-${item.track.id}-${i}`} className={bgColor}>
                      <td className="px-2 py-1.5 text-gray-500">{i + 1}</td>
                      <td
                        className={`px-2 py-1.5 max-w-[20ch] truncate ${item.isAdded ? "font-bold text-[#28a745]" : ""
                          }`}
                        title={item.track.title}>
                        {item.track.title}
                      </td>
                      <td
                        className={`px-2 py-1.5 max-w-[15ch] truncate ${item.isAdded ? "font-bold text-[#28a745]" : ""
                          }`}
                        title={item.track.artist}>
                        {item.track.artist}
                      </td>
                      <td
                        className={`px-2 py-1.5 text-center ${item.isAdded ? "font-bold text-[#28a745]" : ""
                          }`}>
                        {formatDuration(item.track.durationMs)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="p-3 bg-[#fff5df] box-style-md border-2 border-black text-sm flex items-center justify-between">
        <div className="font-bold">Summary</div>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Snapshot:</span>
            <span className="font-bold">{comparison.snapshotTracks.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Current:</span>
            <span className="font-bold">{comparison.currentTracks.length}</span>
          </div>
          <div className="flex items-center gap-2 text-[#28a745]">
            <span className="font-bold">+{comparison.addedTracks.length}</span>
            <span>added</span>
          </div>
          <div className="flex items-center gap-2 text-[#dc3545]">
            <span className="font-bold">-{comparison.removedTracks.length}</span>
            <span>removed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

