import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Music, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  AddChildPlaylistRequest,
  CreateSyncGroupRequest,
  PlaylistSyncGroup,
} from "../../models/PlaylistSync.ts";
import { ProviderPlaylist } from "../../models/ProviderPlaylist.ts";
import { createSyncGroup } from "../../services/PlaylistSyncService.ts";
import { getProviderName } from "../../utils/providerUtils.tsx";
import Notification from "../ui/Notification.tsx";

interface PlaylistSyncModalProps {
  playlist: ProviderPlaylist;
  availablePlaylists: ProviderPlaylist[];
  onClose: () => void;
  onCreate?: (group: PlaylistSyncGroup) => void;
}

export default function PlaylistSyncModal({
  playlist,
  availablePlaylists,
  onClose,
  onCreate,
}: PlaylistSyncModalProps) {
  const queryClient = useQueryClient();
  const [groupName, setGroupName] = useState<string>(`${playlist.title} Sync Group`);
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);

  const childCandidates = useMemo(
    () => availablePlaylists.filter(item => item.id !== playlist.id),
    [availablePlaylists, playlist.id]
  );

  const addChild = useMutation({
    mutationFn: (request: CreateSyncGroupRequest) => createSyncGroup(request),
    onSuccess: async (group) => {
      toast.success(Notification, {
        data: {
          title: "Sync Group Created",
          content: `${group.name} will sync ${group.children.length} child playlist(s)`,
        },
        icon: false,
      });
      // Invalidate queries to show sync group in table
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["playlists"] }),
        queryClient.invalidateQueries({ queryKey: ["sync-groups"] })
      ]);
      onCreate?.(group);
    },
    onError: (error: any) => {
      toast.error(Notification, {
        data: {
          title: "Sync Group Failed",
          content: error.response?.data || error.message || "Unable to create sync group",
        },
        icon: false,
      });
    },
  });

  const toggleChild = (childId: string) => {
    setSelectedChildIds(prev =>
      prev.includes(childId) ? prev.filter(id => id !== childId) : [...prev, childId]
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (selectedChildIds.length === 0) {
      toast.error(Notification, {
        data: {
          title: "No Children Selected",
          content: "Please select at least one child playlist",
        },
        icon: false,
      });
      return;
    }

    const children: AddChildPlaylistRequest[] = selectedChildIds
      .map(id => availablePlaylists.find(p => p.id === id))
      .filter(Boolean)
      .map(p => ({
        childPlaylistId: p!.id,
        provider: p!.provider,
        providerAccountId: p!.providerId,
      }));

    addChild.mutate({
      name: groupName || `${playlist.title} Sync Group`,
      masterPlaylistId: playlist.id,
      masterProvider: playlist.provider,
      masterProviderAccountId: playlist.providerId,
      children,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 font-mono">
      <div className="relative w-[90vw] max-w-3xl bg-[#fff9ec] box-style-lg max-h-[90vh] flex flex-col">
        <div className="w-full px-5 py-3 border-b-4 border-black font-extrabold uppercase tracking-wider flex items-center justify-between bg-[#f3d99c] text-black">
          <div className="flex items-center gap-3">
            <span className="text-lg">Configure Sync</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-[#f26b6b] hover:bg-[#e55d5d] border-2 border-black rounded-lg box-style-md cursor-pointer">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-5 px-5 py-4">
          <div className="flex items-center gap-4 bg-white border-2 border-black box-style-md p-3">
            {playlist.thumbnailUrl ? (
              <img
                src={playlist.thumbnailUrl}
                alt={playlist.title}
                className="w-16 h-16 border-2 border-black object-cover box-style-md"
              />
            ) : (
              <div className="w-16 h-16 bg-[#fffaf5] border-2 border-black flex items-center justify-center text-gray-500">
                <span className="text-sm">No Image</span>
              </div>
            )}
            <div>
              <div className="font-bold text-lg">{playlist.title}</div>
              <div className="text-xs text-gray-600">
                {playlist.description || "No description"}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {getProviderName(playlist.provider)} · {playlist.itemCount ?? 0} tracks
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold uppercase tracking-wide">Sync Group Name</label>
            <input
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-black box-style-sm font-bold"
            />
          </div>

          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wide">Child Playlists</h3>
              <span className="text-xs text-gray-600">
                Selected {selectedChildIds.length}/{childCandidates.length}
              </span>
            </div>

            <div className="flex-1 overflow-hidden border-2 border-black rounded box-style-sm bg-white">
              {/* Reduced space-y-3 to space-y-1 for a tighter list */}
              <div className="overflow-y-auto max-h-[320px] space-y-1 p-2">
                {childCandidates.length === 0 ? (
                  <p className="text-xs italic text-gray-500 p-2">No other playlists available</p>
                ) : (
                  childCandidates.map(child => {
                    const isSelected = selectedChildIds.includes(child.id);
                    return (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => toggleChild(child.id)}
                        className={`w-full text-left border-2 rounded px-3 py-1.5 flex items-center gap-3 transition ${isSelected
                          ? "border-[#63d079] bg-[#eaffed]"
                          : "border-transparent bg-[#fffaf5] hover:border-[#f3d99c] hover:bg-[#fff3e6]"
                          }`}>
                        {child.thumbnailUrl ? (
                          <img
                            src={child.thumbnailUrl}
                            alt={child.title}
                            className="w-8 h-8 border border-black object-cover shrink-0 box-style-sm"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-[#fffaf5] border border-black flex items-center justify-center text-gray-400 shrink-0">
                            <Music className="w-4 h-4" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1 flex items-center justify-between">
                          <div className="font-bold text-sm truncate">{child.title}</div>
                          <div className="text-[10px] text-gray-500 uppercase font-black ml-2 shrink-0">
                            {getProviderName(child.provider)} · {child.itemCount ?? 0}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t-2 border-black pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-200 hover:bg-gray-300 border-2 border-black box-style-md uppercase font-bold">
              Cancel
            </button>
            <button
              type="submit"
              disabled={addChild.isPending}
              className="px-5 py-2 bg-[#63d079] hover:bg-[#4ec767] border-2 border-black box-style-md uppercase font-bold disabled:opacity-50 disabled:cursor-not-allowed">
              Save Sync Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

