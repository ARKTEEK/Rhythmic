import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Crown, Plus, Power, PowerOff, Trash2, Users, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { OAuthProvider } from "../../models/Connection.ts";
import { PlaylistSyncGroup } from "../../models/PlaylistSync.ts";
import { ProviderPlaylist } from "../../models/ProviderPlaylist.ts";
import {
  addChildPlaylist,
  deleteSyncGroup,
  getSyncGroups,
  removeChildPlaylist,
  updateSyncGroup,
} from "../../services/PlaylistSyncService.ts";
import { getProviderName } from "../../utils/providerUtils.tsx";
import PlatformIcon from "../ui/Icon/PlatformIcon.tsx";
import Notification from "../ui/Notification.tsx";
import ConfirmWindow from "../ui/Window/ConfirmWindow.tsx";

interface PlaylistSyncManagementModalProps {
  playlist: ProviderPlaylist;
  allPlaylists: ProviderPlaylist[];
  onClose: () => void;
  accentSoft?: string;
  accentText: string;
}

export default function PlaylistSyncManagementModal({
  playlist,
  allPlaylists,
  onClose,
  accentSoft,
  accentText,
}: PlaylistSyncManagementModalProps) {
  const queryClient = useQueryClient();
  const [showAddChild, setShowAddChild] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>("");
  const [childToDelete, setChildToDelete] = useState<{
    id: number;
    title: string;
    childPlaylistId: string;
  } | null>(null);
  const [showDeleteGroupConfirm, setShowDeleteGroupConfirm] = useState(false);

  const { data: syncGroups = [] } = useQuery<PlaylistSyncGroup[]>({
    queryKey: ["sync-groups"],
    queryFn: getSyncGroups,
  });

  // Find the sync group where this playlist is the master
  const syncGroup = syncGroups.find(
    (sg) =>
      sg.masterPlaylistId === playlist.id &&
      sg.masterProvider === playlist.provider &&
      sg.masterProviderAccountId === playlist.providerId
  );

  // Get master playlist info
  const masterPlaylist = allPlaylists.find(
    (p) =>
      p.id === syncGroup?.masterPlaylistId &&
      p.provider === syncGroup?.masterProvider &&
      p.providerId === syncGroup?.masterProviderAccountId
  );

  // Get child playlist info with titles
  const childrenWithInfo = syncGroup?.children.map((child) => {
    const childPlaylist = allPlaylists.find(
      (p) =>
        p.id === child.childPlaylistId &&
        p.provider === child.provider &&
        p.providerId === child.providerAccountId
    );
    return {
      ...child,
      title: childPlaylist?.title || child.childPlaylistId,
      thumbnail: childPlaylist?.thumbnailUrl,
      trackCount: childPlaylist?.itemCount || 0,
    };
  }) || [];

  // Get available playlists for adding as children (exclude master and existing children)
  const availablePlaylists = allPlaylists.filter((p) => {
    if (!syncGroup) return false;

    // Exclude the master playlist
    if (
      p.id === syncGroup.masterPlaylistId &&
      p.provider === syncGroup.masterProvider &&
      p.providerId === syncGroup.masterProviderAccountId
    ) {
      return false;
    }

    // Exclude existing children
    const isExistingChild = syncGroup.children.some(
      (c) =>
        c.childPlaylistId === p.id &&
        c.provider === p.provider &&
        c.providerAccountId === p.providerId
    );

    return !isExistingChild;
  });

  const toggleSyncMutation = useMutation({
    mutationFn: ({ groupId, enabled }: { groupId: number; enabled: boolean }) =>
      updateSyncGroup(groupId, { syncEnabled: enabled }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sync-groups"] }),
        queryClient.invalidateQueries({ queryKey: ["playlists"] })
      ]);
      toast.success(Notification, {
        data: {
          title: "Sync Status Updated",
          content: "Sync has been " + (syncGroup?.syncEnabled ? "disabled" : "enabled"),
        },
        icon: false,
      });
    },
    onError: () => {
      toast.error("Failed to update sync status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (groupId: number) => deleteSyncGroup(groupId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sync-groups"] }),
        queryClient.invalidateQueries({ queryKey: ["playlists"] })
      ]);
      toast.success(Notification, {
        data: {
          title: "Sync Group Deleted",
          content: "Sync group has been removed",
        },
        icon: false,
      });
      onClose();
    },
    onError: () => {
      toast.error("Failed to delete sync group");
    },
  });

  const addChildMutation = useMutation({
    mutationFn: ({ groupId, childId, provider, accountId }: {
      groupId: number;
      childId: string;
      provider: OAuthProvider;
      accountId: string;
    }) =>
      addChildPlaylist(groupId, {
        childPlaylistId: childId,
        provider,
        providerAccountId: accountId,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sync-groups"] }),
        queryClient.invalidateQueries({ queryKey: ["playlists"] })
      ]);
      toast.success(Notification, {
        data: {
          title: "Child Added",
          content: "Playlist added to sync group",
        },
        icon: false,
      });
      setShowAddChild(false);
      setSelectedPlaylistId("");
    },
    onError: () => {
      toast.error("Failed to add child playlist");
    },
  });

  const removeChildMutation = useMutation({
    mutationFn: ({ groupId, childId }: { groupId: number; childId: number }) =>
      removeChildPlaylist(groupId, childId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sync-groups"] }),
        queryClient.invalidateQueries({ queryKey: ["playlists"] })
      ]);
      toast.success(Notification, {
        data: {
          title: "Child Removed",
          content: "Playlist removed from sync group",
        },
        icon: false,
      });
    },
    onError: () => {
      toast.error("Failed to remove child playlist");
    },
  });

  const handleAddChild = () => {
    if (!syncGroup || !selectedPlaylistId) return;

    const selectedPlaylist = availablePlaylists.find((p) => p.id === selectedPlaylistId);
    if (!selectedPlaylist) return;

    addChildMutation.mutate({
      groupId: syncGroup.id,
      childId: selectedPlaylist.id,
      provider: selectedPlaylist.provider,
      accountId: selectedPlaylist.providerId,
    });
  };

  if (!syncGroup) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 font-mono">
        <div className="relative w-[90vw] max-w-2xl bg-[#fff9ec] box-style-lg flex flex-col">
          <div
            className={`w-full px-5 py-3 border-b-4 border-black font-extrabold uppercase tracking-wider flex items-center justify-between ${accentSoft} ${accentText}`}>
            <span className="text-lg text-black">Manage Sync Group</span>
            <button
              onClick={onClose}
              className="p-1.5 bg-[#f26b6b] hover:bg-[#e55d5d] border-2 border-black box-style-md cursor-pointer rounded-lg">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-8 text-gray-600 italic">
            This playlist is not a master in any sync group.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 font-mono">
      <div className="relative w-[90vw] max-w-4xl h-[80vh] bg-[#fff9ec] box-style-lg flex flex-col">
        <div
          className={`w-full px-5 py-3 border-b-4 border-black font-extrabold uppercase tracking-wider flex items-center justify-between ${accentSoft} ${accentText}`}>
          <div className="flex items-center gap-3 text-black">
            <span className="text-lg">Manage Sync Group: {syncGroup.name}</span>
            {syncGroup.syncEnabled ? (
              <span className="text-xs bg-[#63d079] text-black px-2 py-0.5 border border-black uppercase font-bold">
                Enabled
              </span>
            ) : (
              <span className="text-xs bg-[#f26b6b] text-white px-2 py-0.5 border border-black uppercase font-bold">
                Disabled
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-[#f26b6b] hover:bg-[#e55d5d] border-2 border-black box-style-md cursor-pointer rounded-lg">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Master Playlist Section */}
          <div className="px-5 py-4 border-b-2 border-black bg-[#fffaf5]">
            <h3 className="font-bold text-sm uppercase text-gray-600 mb-3 flex items-center gap-2">
              <Crown className="w-4 h-4 text-[#FFD700]" />
              Master Playlist
            </h3>
            <div className="flex items-center gap-4 bg-white border-2 border-black box-style-md p-3">
              {masterPlaylist?.thumbnailUrl ? (
                <img
                  src={masterPlaylist.thumbnailUrl}
                  alt={masterPlaylist.title}
                  className="w-16 h-16 border-2 border-black object-cover box-style-md"
                />
              ) : (
                <div className="w-16 h-16 bg-[#fffaf5] border-2 border-black flex items-center justify-center box-style-md">
                  <Crown className="w-6 h-6 text-[#FFD700]" />
                </div>
              )}
              <div className="flex-1">
                <div className="font-bold text-lg">{masterPlaylist?.title || syncGroup.masterPlaylistId}</div>
                <div className="flex items-center gap-3 mt-1">
                  <PlatformIcon providerName={getProviderName(syncGroup.masterProvider)} />
                  <span className="text-xs text-gray-600">{masterPlaylist?.itemCount || 0} tracks</span>
                </div>
              </div>
            </div>
          </div>

          {/* Child Playlists Section */}
          <div className="flex-1 flex flex-col px-5 py-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm uppercase text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#40a8d0]" />
                Child Playlists ({childrenWithInfo.length})
              </h3>
              <button
                onClick={() => setShowAddChild(!showAddChild)}
                className="cursor-pointer px-3 py-1.5 bg-[#63d079] hover:bg-[#4ec767] border-2 border-black box-style-sm text-xs font-bold uppercase flex items-center gap-2">
                <Plus className="w-3 h-3" />
                Add Child
              </button>
            </div>

            {showAddChild && (
              <div className="mb-3 p-3 bg-[#fffaf5] border-2 border-black box-style-md">
                <select
                  value={selectedPlaylistId}
                  onChange={(e) => setSelectedPlaylistId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-black box-style-sm font-bold mb-2">
                  <option value="">Select a playlist...</option>
                  {availablePlaylists.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({getProviderName(p.provider)})
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddChild}
                    disabled={!selectedPlaylistId || addChildMutation.isPending}
                    className="px-3 py-1.5 bg-[#63d079] hover:bg-[#4ec767] border-2 border-black box-style-sm text-xs font-bold uppercase disabled:opacity-50 disabled:cursor-not-allowed">
                    {addChildMutation.isPending ? "Adding..." : "Add"}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddChild(false);
                      setSelectedPlaylistId("");
                    }}
                    className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 border-2 border-black box-style-sm text-xs font-bold uppercase">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-2">
              {childrenWithInfo.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-600 italic py-8">
                  No child playlists. Add one to start syncing!
                </div>
              ) : (
                childrenWithInfo.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center gap-3 bg-white border-2 border-black box-style-md p-3">
                    {child.thumbnail ? (
                      <img
                        src={child.thumbnail}
                        alt={child.title}
                        className="w-12 h-12 border-2 border-black object-cover box-style-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-[#fffaf5] border-2 border-black flex items-center justify-center box-style-sm">
                        <Users className="w-4 h-4 text-[#40a8d0]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate">{child.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <PlatformIcon providerName={getProviderName(child.provider)} />
                        <span className="text-xs text-gray-600">{child.trackCount} tracks</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setChildToDelete(child)}
                      disabled={removeChildMutation.isPending}
                      className="w-9 h-9 bg-[#f26b6b] hover:bg-[#e55d5d] border-2 border-black box-style-md flex items-center justify-center rounded-full cursor-pointer disabled:opacity-50">
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t-2 border-black flex justify-between">
          <div className="flex gap-2">
            <button
              onClick={() =>
                toggleSyncMutation.mutate({
                  groupId: syncGroup.id,
                  enabled: !syncGroup.syncEnabled,
                })
              }
              disabled={toggleSyncMutation.isPending}
              className={`cursor-pointer px-4 py-2 border-2 border-black box-style-md font-extrabold uppercase flex items-center gap-2 ${syncGroup.syncEnabled ? "bg-[#f26b6b] text-white" : "bg-[#63d079] text-black"
                }`}>
              {syncGroup.syncEnabled ? (
                <>
                  <PowerOff className="w-4 h-4" />
                  Disable Sync
                </>
              ) : (
                <>
                  <Power className="w-4 h-4" />
                  Enable Sync
                </>
              )}
            </button>
            <button
              onClick={() => setShowDeleteGroupConfirm(true)}
              disabled={deleteMutation.isPending}
              className="cursor-pointer px-4 py-2 bg-[#f26b6b] hover:bg-[#e55d5d] border-2 border-black box-style-md font-extrabold uppercase flex items-center gap-2 text-white">
              <Trash2 className="w-4 h-4" />
              Delete Group
            </button>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer px-5 py-2 bg-gray-200 hover:bg-gray-300 border-2 border-black box-style-md font-extrabold uppercase">
            Close
          </button>
        </div>
      </div>

      {childToDelete && (
        <ConfirmWindow
          height="200px"
          confirmTitle="Remove Child Playlist?"
          confirmMessage={`Are you sure you want to remove "${childToDelete.title}" from this sync group?`}
          onCancel={() => setChildToDelete(null)}
          onConfirm={async () => {
            removeChildMutation.mutate({
              groupId: syncGroup.id,
              childId: childToDelete.id,
            });
            setChildToDelete(null);
          }}
        />
      )}

      {showDeleteGroupConfirm && (
        <ConfirmWindow
          height="200px"
          confirmTitle="Delete Sync Group?"
          confirmMessage={`Are you sure you want to delete sync group "${syncGroup.name}"? This will not delete the playlists themselves.`}
          onCancel={() => setShowDeleteGroupConfirm(false)}
          onConfirm={async () => {
            deleteMutation.mutate(syncGroup.id);
            setShowDeleteGroupConfirm(false);
          }}
        />
      )}
    </div>
  );
}
