import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, History, RotateCcw, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { PlaylistSnapshot, PlaylistSnapshotComparison } from "../../models/PlaylistSnapshot.ts";
import { ProviderPlaylist } from "../../models/ProviderPlaylist.ts";
import { compareSnapshot, getSnapshotHistory, revertToSnapshot } from "../../services/PlaylistSnapshotsService.ts";
import { formatDuration } from "../../utils/playlistUtils.tsx";
import { getProviderName } from "../../utils/providerUtils.tsx";

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
  const queryClient = useQueryClient();
  const provider = getProviderName(playlist.provider);

  const { data: snapshots = [], isLoading: isLoadingHistory } = useQuery<PlaylistSnapshot[]>({
    queryKey: ["playlist-snapshots", playlist.provider, playlist.id],
    queryFn: () => getSnapshotHistory(provider, playlist.id),
  });

  const { data: comparison, isLoading: isLoadingComparison } = useQuery<PlaylistSnapshotComparison>({
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
    onSuccess: () => {
      toast.success("Playlist reverted successfully");
      queryClient.invalidateQueries({ queryKey: ["playlist-tracks"] });
      queryClient.invalidateQueries({ queryKey: ["playlist-snapshots"] });
      onRevert?.();
      onClose();
    },
    onError: () => {
      toast.error("Failed to revert playlist");
    },
  });

  const handleCompare = (snapshotId: number) => {
    setSelectedSnapshotId(snapshotId);
  };

  const handleRevert = (snapshotId: number) => {
    if (window.confirm("Are you sure you want to revert to this snapshot? This will modify your playlist.")) {
      revertMutation.mutate(snapshotId);
    }
  };

  const { snapshotRows, currentRows } = useMemo(() => {
    if (!comparison) {
      return { snapshotRows: [], currentRows: [] };
    }

    const getTrackKey = (track: any) =>
      track.trackUrl || track.id || `${track.title}|${track.artist}`;

    // Count occurrences of each track in both lists
    const snapshotCounts = new Map<string, number>();
    const currentCounts = new Map<string, number>();

    comparison.snapshotTracks.forEach(track => {
      const key = getTrackKey(track);
      snapshotCounts.set(key, (snapshotCounts.get(key) || 0) + 1);
    });

    comparison.currentTracks.forEach(track => {
      const key = getTrackKey(track);
      currentCounts.set(key, (currentCounts.get(key) || 0) + 1);
    });

    // Build snapshot rows - mark tracks as removed if count decreased
    const snapshotTracksProcessed = new Map<string, number>();
    const snapshotRows = comparison.snapshotTracks.map(track => {
      const key = getTrackKey(track);
      const instanceNum = (snapshotTracksProcessed.get(key) || 0) + 1;
      snapshotTracksProcessed.set(key, instanceNum);

      const snapshotCount = snapshotCounts.get(key) || 0;
      const currentCount = currentCounts.get(key) || 0;

      // Mark as removed if this instance number exceeds what exists in current
      const isRemoved = instanceNum > currentCount;

      return { track, isRemoved };
    });

    // Build current rows - mark tracks as added if count increased
    const currentTracksProcessed = new Map<string, number>();
    const currentRows = comparison.currentTracks.map(track => {
      const key = getTrackKey(track);
      const instanceNum = (currentTracksProcessed.get(key) || 0) + 1;
      currentTracksProcessed.set(key, instanceNum);

      const snapshotCount = snapshotCounts.get(key) || 0;
      const currentCount = currentCounts.get(key) || 0;

      // Mark as added if this instance number exceeds what existed in snapshot
      const isAdded = instanceNum > snapshotCount;

      return { track, isAdded };
    });

    return { snapshotRows, currentRows };
  }, [comparison]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 font-mono">
      <div className="relative w-[90vw] max-w-6xl bg-[#fff9ec] box-style-lg max-h-[90vh] flex flex-col">
        <div className={`w-full px-4 py-2 border-b-4 border-black font-extrabold rounded-t-lg uppercase tracking-wider flex items-center justify-between ${accentSoft} ${accentText}`}>
          <div className="flex items-center gap-2 text-black">
            <History className="w-5 h-5" />
            <span className="text-lg">Playlist History</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-[#f26b6b] hover:bg-[#e55d5d] border-2 border-black box-style-md hover:cursor-pointer">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex min-h-[70vh]">
          {/* History List */}
          <div className="w-1/3 border-r-4 border-black bg-[#fff5df] flex flex-col min-h-[70vh]">
            <div className="px-4 py-2 bg-[#f3d99c] border-b-4 border-black font-extrabold uppercase text-sm">
              Snapshots ({snapshots.length})
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {isLoadingHistory ? (
                <div className="p-4 text-center italic text-gray-500">Loading history...</div>
              ) : snapshots.length === 0 ? (
                <div className="p-4 text-center italic text-gray-500">No snapshots yet</div>
              ) : (
                snapshots.map(snapshot => {
                  const isActive = selectedSnapshotId === snapshot.id;
                  return (
                    <button
                      type="button"
                      key={snapshot.id}
                      onClick={() => handleCompare(snapshot.id)}
                      className={`text-left w-full box-style-md p-3 transition-all border-2 ${
                        isActive
                          ? "border-black bg-[#ffe9c2]"
                          : "border-transparent bg-[#fffaf5] hover:border-[#f3d99c] hover:bg-[#fff3e6]"
                      }`}>
                      <div className="flex items-center justify-between text-sm font-bold mb-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {new Date(snapshot.createdAt).toLocaleString()}
                        </div>
                        <span className="text-xs text-gray-600">
                          {snapshot.trackCount} tracks
                        </span>
                      </div>
                      {snapshot.createdAt && (
                        <div className="text-xs text-gray-500 line-clamp-1">
                          {new Date(snapshot.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Comparison View */}
          <div className="flex-1 flex flex-col bg-[#fff9ec]">
            {!selectedSnapshotId ? (
              <div className="flex-1 flex items-center justify-center text-gray-500 italic">
                Select a snapshot to compare
              </div>
            ) : isLoadingComparison ? (
              <div className="flex-1 flex items-center justify-center text-gray-500 italic">
                Loading comparison...
              </div>
            ) : comparison ? (
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">Comparison</h3>
                    <p className="text-sm text-gray-600">
                      Snapshot from {new Date(comparison.snapshot.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRevert(comparison.snapshot.id)}
                    disabled={revertMutation.isPending}
                    className="px-4 py-2 bg-[#63d079] hover:bg-[#4ec767] box-style-md uppercase font-extrabold hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Revert
                  </button>
                </div>

                {/* Side-by-Side Tables */}
                <div className="flex-1 overflow-hidden flex gap-4">
                  {/* Snapshot Table (Left) */}
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
                                  className={`px-2 py-1.5 max-w-[20ch] truncate ${item.isRemoved ? "line-through text-[#dc3545]" : ""}`}
                                  title={item.track.title}>
                                  {item.track.title}
                                </td>
                                <td
                                  className={`px-2 py-1.5 max-w-[15ch] truncate ${item.isRemoved ? "line-through text-[#dc3545]" : ""}`}
                                  title={item.track.artist}>
                                  {item.track.artist}
                                </td>
                                <td className={`px-2 py-1.5 text-center ${item.isRemoved ? "line-through text-[#dc3545]" : ""}`}>
                                  {formatDuration(item.track.durationMs)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Current Playlist Table (Right) */}
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
                                  className={`px-2 py-1.5 max-w-[20ch] truncate ${item.isAdded ? "font-bold text-[#28a745]" : ""}`}
                                  title={item.track.title}>
                                  {item.track.title}
                                </td>
                                <td
                                  className={`px-2 py-1.5 max-w-[15ch] truncate ${item.isAdded ? "font-bold text-[#28a745]" : ""}`}
                                  title={item.track.artist}>
                                  {item.track.artist}
                                </td>
                                <td className={`px-2 py-1.5 text-center ${item.isAdded ? "font-bold text-[#28a745]" : ""}`}>
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

                {/* Summary Footer */}
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
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

