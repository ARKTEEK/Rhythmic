import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { PlaylistVisibility } from "../../enums/PlaylistVisibility";
import { Platform } from "../../models/Connection";
import { createPlaylist, CreatePlaylistRequest } from "../../services/CreatePlaylistService";
import Notification from "../ui/Notification";

interface CreatePlaylistModalProps {
  platforms: Platform[];
  onClose: () => void;
}

export default function CreatePlaylistModal({ platforms, onClose }: CreatePlaylistModalProps) {
  const queryClient = useQueryClient();

  const platformsWithAccounts = platforms.filter(p => p.accounts.length > 0);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    visibility: PlaylistVisibility.Public,
    selectedPlatform: platformsWithAccounts[0] || null,
    selectedAccountId: platformsWithAccounts[0]?.accounts[0]?.id ?? "",
  });

  const createMutation = useMutation({
    mutationFn: () => {
      if (!formData.selectedPlatform || !formData.selectedAccountId) {
        throw new Error("Platform and account must be selected");
      }

      const request: CreatePlaylistRequest = {
        title: formData.title,
        description: formData.description || undefined,
        visibility: formData.visibility,
      };

      return createPlaylist(formData.selectedPlatform.name, formData.selectedAccountId, request);
    },
    onSuccess: async (newPlaylist) => {
      toast.success(Notification, {
        data: {
          title: "Playlist Created",
          content: `Playlist "${newPlaylist.title}" created successfully`,
        },
        icon: false,
      });
      await queryClient.invalidateQueries({ queryKey: ["playlists"] });
      onClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.message || "Failed to create playlist";
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  const handlePlatformChange = (platform: Platform) => {
    setFormData((prev) => ({
      ...prev,
      selectedPlatform: platform,
      selectedAccountId: platform.accounts[0]?.id ?? "",
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 font-mono">
      <div className="relative w-[90vw] max-w-md bg-[#fff9ec] box-style-lg flex flex-col max-h-[90vh]">
        <div className="w-full px-5 py-3 border-b-4 border-black font-extrabold uppercase tracking-wider flex items-center justify-between bg-[#63d079] text-black">
          <div className="flex items-center gap-3">
            <span className="text-lg">Create New Playlist</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-[#f26b6b] hover:bg-[#e55d5d] border-2 border-black rounded-lg box-style-md cursor-pointer">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 px-5 py-4 overflow-y-auto">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold uppercase tracking-wide">Playlist Name</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              required
              className="w-full px-3 py-2 bg-white border-2 border-black box-style-sm font-bold"
              placeholder="My Awesome Playlist"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold uppercase tracking-wide">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-white border-2 border-black box-style-sm font-bold resize-none"
              rows={3}
              placeholder="A collection of my favorite tracks"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold uppercase tracking-wide">Visibility</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, visibility: PlaylistVisibility.Public }))}
                className={`flex-1 px-3 py-2 border-2 border-black box-style-sm text-xs font-bold uppercase transition ${formData.visibility === PlaylistVisibility.Public
                    ? "bg-[#63d079] text-black"
                    : "bg-white hover:bg-gray-100"
                  }`}>
                Public
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, visibility: PlaylistVisibility.Private }))}
                className={`flex-1 px-3 py-2 border-2 border-black box-style-sm text-xs font-bold uppercase transition ${formData.visibility === PlaylistVisibility.Private
                    ? "bg-[#63d079] text-black"
                    : "bg-white hover:bg-gray-100"
                  }`}>
                Private
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold uppercase tracking-wide">Platform</label>
            <div className="flex gap-2 flex-wrap">
              {platformsWithAccounts.map((platform) => (
                <button
                  key={platform.name}
                  type="button"
                  onClick={() => handlePlatformChange(platform)}
                  className={`px-3 py-2 border-2 border-black box-style-sm text-xs font-bold uppercase transition flex items-center gap-2 ${formData.selectedPlatform?.name === platform.name
                      ? "bg-[#40a8d0] text-white"
                      : "bg-white hover:bg-gray-100"
                    }`}>
                  {platform.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold uppercase tracking-wide">Account</label>
            <select
              value={formData.selectedAccountId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, selectedAccountId: e.target.value }))
              }
              className="w-full px-3 py-2 bg-white border-2 border-black box-style-sm font-bold">
              {formData.selectedPlatform?.accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.username || account.email}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 border-t-2 border-black pt-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-200 hover:bg-gray-300 border-2 border-black box-style-md uppercase font-bold">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !formData.title.trim()}
              className="px-5 py-2 bg-[#63d079] hover:bg-[#4ec767] border-2 border-black box-style-md uppercase font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {createMutation.isPending ? "Creating..." : "Create Playlist"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

