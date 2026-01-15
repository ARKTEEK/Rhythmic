import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { updateUserRoles, UpdateUserRolesRequest } from "../../services/AdminService";
import { AdminUserDto } from "../../models/User";
import Notification from "../ui/Notification";

interface EditUserRolesModalProps {
  user: AdminUserDto;
  onClose: () => void;
}

const AVAILABLE_ROLES = ["User", "Admin"];

export default function EditUserRolesModal({ user, onClose }: EditUserRolesModalProps) {
  const queryClient = useQueryClient();
  const [selectedRoles, setSelectedRoles] = useState<string[]>(user.roles);

  const updateMutation = useMutation({
    mutationFn: (request: UpdateUserRolesRequest) => updateUserRoles(user.id, request),
    onSuccess: () => {
      toast.success(Notification, {
        data: {
          title: "Roles Updated",
          content: `Roles for ${user.username} have been updated successfully`,
        },
        icon: false,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"], refetchType: 'active' });
      onClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || "Failed to update roles";
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRoles.length === 0) {
      toast.error("User must have at least one role");
      return;
    }

    updateMutation.mutate({ roles: selectedRoles });
  };

  const toggleRole = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 font-mono">
      <div className="relative w-[90vw] max-w-md bg-[#fff9ec] box-style-lg flex flex-col">
        <div className="w-full px-5 py-3 border-b-4 border-black font-extrabold uppercase tracking-wider flex items-center justify-between bg-[#f3d99c] text-black">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5" />
            <span className="text-lg">Edit User Roles</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-[#f26b6b] hover:bg-[#e55d5d] border-2 border-black rounded-lg box-style-md cursor-pointer">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 px-5 py-4">
          <div className="bg-white border-2 border-black box-style-sm p-3">
            <div className="text-xs text-gray-600 uppercase mb-1">User</div>
            <div className="font-bold">{user.username}</div>
            <div className="text-sm text-gray-600">{user.email}</div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold uppercase tracking-wide">Roles</label>
            <div className="flex gap-2">
              {AVAILABLE_ROLES.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`px-3 py-2 border-2 border-black box-style-sm text-xs font-bold uppercase transition flex-1 ${
                    selectedRoles.includes(role)
                      ? role === "Admin"
                        ? "bg-[#f26b6b] text-white"
                        : "bg-[#63d079] text-black"
                      : "bg-white hover:bg-gray-100"
                  }`}>
                  {role}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600 italic">Select at least one role</p>
          </div>

          <div className="bg-[#fff3e6] border-2 border-black box-style-sm p-3">
            <div className="text-xs font-bold uppercase mb-2">Current Roles</div>
            <div className="flex gap-1 flex-wrap">
              {user.roles.map(role => (
                <span
                  key={role}
                  className={`text-[10px] px-2 py-0.5 border border-black box-style-sm font-bold uppercase ${
                    role === "Admin" ? "bg-[#f26b6b] text-white" : "bg-[#e0b39c] text-black"
                  }`}>
                  {role}
                </span>
              ))}
            </div>
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
              disabled={updateMutation.isPending || selectedRoles.length === 0}
              className="px-5 py-2 bg-[#40a8d0] hover:bg-[#3597bd] border-2 border-black box-style-md uppercase font-bold disabled:opacity-50 disabled:cursor-not-allowed">
              {updateMutation.isPending ? "Updating..." : "Update Roles"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

