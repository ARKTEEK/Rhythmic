import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Scissors, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ProviderPlaylist } from "../../models/ProviderPlaylist.ts";
import createConnectionsQueryOptions from "../../queries/createConnectionsQueryOptions.ts";
import { PlaylistSplitRequest, PlaylistSplitType, splitPlaylist } from "../../services/PlaylistSplitService.ts";
import { getProviderName, OAuthProviderNames } from "../../utils/providerUtils.tsx";
import Notification from "../ui/Notification.tsx";

interface PlaylistSplitModalProps {
  playlist: ProviderPlaylist;
  onClose: () => void;
  accentSoft?: string;
  accentText: string;
  onSplitSuccess?: () => void;
}

export default function PlaylistSplitModal({
  playlist,
  onClose,
  accentSoft,
  accentText,
  onSplitSuccess,
}: PlaylistSplitModalProps) {
  const queryClient = useQueryClient();
  const [splitType, setSplitType] = useState<PlaylistSplitType>(PlaylistSplitType.InHalf);
  const [splitValue, setSplitValue] = useState<string>("");
  const [baseName, setBaseName] = useState<string>(playlist.title);
  const [destinationAccountId, setDestinationAccountId] = useState<string>(playlist.providerId);

  const { data: connections = [] } = useQuery(createConnectionsQueryOptions());
  const provider = getProviderName(playlist.provider);

  const availableAccounts = connections.filter(
    conn => OAuthProviderNames[conn.provider] === provider
  );

  useEffect(() => {
    if (!destinationAccountId && availableAccounts.length > 0) {
      setDestinationAccountId(availableAccounts[0].id);
    }
  }, [destinationAccountId, availableAccounts]);

  const splitMutation = useMutation({
    mutationFn: (request: PlaylistSplitRequest) =>
      splitPlaylist(provider, playlist.id, playlist.providerId, destinationAccountId, request),
    onSuccess: async (createdPlaylists) => {
      toast.success(Notification, {
        data: {
          title: "Playlist Split",
          content: `Successfully created ${createdPlaylists.length} playlist(s)`,
        },
        icon: false,
      });
      await queryClient.invalidateQueries({ queryKey: ["playlists"] });
      onSplitSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(Notification, {
        data: {
          title: "Split Failed",
          content: error.response?.data || error.message || "Failed to split playlist",
        },
        icon: false,
      });
    },
  });

  const handleSplit = () => {
    if (splitType === PlaylistSplitType.ByNumber && !splitValue) {
      toast.error(Notification, {
        data: {
          title: "Invalid Input",
          content: "Please enter the number of playlists",
        },
        icon: false,
      });
      return;
    }

    if (splitType === PlaylistSplitType.ByCustomNumber && !splitValue) {
      toast.error(Notification, {
        data: {
          title: "Invalid Input",
          content: "Please enter tracks per playlist",
        },
        icon: false,
      });
      return;
    }

    splitMutation.mutate({
      splitType,
      splitValue: splitValue || undefined,
      baseName: baseName || playlist.title,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 font-mono">
      <div className="relative w-[90vw] max-w-2xl bg-[#fff9ec] box-style-lg max-h-[90vh] flex flex-col">
        <div
          className={`w-full px-4 py-2 border-b-4 border-black font-extrabold rounded-t-lg uppercase tracking-wider flex items-center justify-between ${accentSoft} ${accentText}`}>
          <div className="flex items-center gap-2 text-black">
            <Scissors className="w-5 h-5" />
            <span className="text-lg">Split Playlist</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-[#f26b6b] hover:bg-[#e55d5d] border-2 border-black box-style-md cursor-pointer">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Split Method</label>
            <select
              value={splitType}
              onChange={(e) => setSplitType(Number(e.target.value) as PlaylistSplitType)}
              className="w-full px-3 py-2 bg-white border-2 border-black box-style-sm font-bold cursor-pointer">
              <option value={PlaylistSplitType.InHalf}>Split in Half</option>
              <option value={PlaylistSplitType.ByNumber}>Split into N Playlists</option>
              <option value={PlaylistSplitType.ByCustomNumber}>Split by Track Count</option>
              <option value={PlaylistSplitType.ByArtist}>Split by Artist</option>
            </select>
          </div>

          {splitType === PlaylistSplitType.ByNumber && (
            <div>
              <label className="block text-sm font-bold mb-2">Number of Playlists</label>
              <input
                type="number"
                min="2"
                value={splitValue}
                onChange={(e) => setSplitValue(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-black box-style-sm font-bold"
                placeholder="e.g., 3"
              />
            </div>
          )}

          {splitType === PlaylistSplitType.ByCustomNumber && (
            <div>
              <label className="block text-sm font-bold mb-2">Tracks per Playlist</label>
              <input
                type="number"
                min="1"
                value={splitValue}
                onChange={(e) => setSplitValue(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-black box-style-sm font-bold"
                placeholder="e.g., 50"
              />
            </div>
          )}

          {splitType === PlaylistSplitType.ByArtist && (
            <div>
              <label className="block text-sm font-bold mb-2">Artist Name (optional)</label>
              <input
                type="text"
                value={splitValue}
                onChange={(e) => setSplitValue(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-black box-style-sm font-bold"
                placeholder="Leave empty to split by all artists"
              />
              <p className="text-xs text-gray-600 mt-1">
                If empty, creates one playlist per artist. If specified, creates two playlists: one with the artist, one without.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold mb-2">Base Name for New Playlists</label>
            <input
              type="text"
              value={baseName}
              onChange={(e) => setBaseName(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-black box-style-sm font-bold"
              placeholder={playlist.title}
            />
            <p className="text-xs text-gray-600 mt-1">
              New playlists will be named: "{baseName} - Part 1", "{baseName} - Part 2", etc.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t-4 border-black flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 box-style-md uppercase font-extrabold cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleSplit}
            disabled={splitMutation.isPending || availableAccounts.length === 0}
            className="px-4 py-2 bg-[#63d079] hover:bg-[#4ec767] box-style-md uppercase font-extrabold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            <Scissors className="w-4 h-4" />
            {splitMutation.isPending ? "Splitting..." : "Split"}
          </button>
        </div>
      </div>
    </div>
  );
}

