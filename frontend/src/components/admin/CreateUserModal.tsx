import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { createUser, CreateUserRequest } from "../../services/AdminService";
import Notification from "../ui/Notification";

interface CreateUserModalProps {
  onClose: () => void;
}

const AVAILABLE_ROLES = ["User", "Admin"];

export default function CreateUserModal({ onClose }: CreateUserModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    roles: ["User"] as string[],
  });

  const createMutation = useMutation({
    mutationFn: (request: CreateUserRequest) => createUser(request),
    onSuccess: (newUser) => {
      toast.success(Notification, {
        data: {
          title: "User Created",
          content: `User ${newUser.username} has been created successfully`,
        },
        icon: false,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"], refetchType: 'active' });
      onClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || "Failed to create user";
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    createMutation.mutate({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      roles: formData.roles,
    });
  };

  const toggleRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 font-mono">
      <div className="relative w-[90vw] max-w-md bg-[#fff9ec] box-style-lg flex flex-col">
        <div className="w-full px-5 py-3 border-b-4 border-black font-extrabold uppercase tracking-wider flex items-center justify-between bg-[#f3d99c] text-black">
          <div className="flex items-center gap-3">
            <UserPlus className="w-5 h-5" />
            <span className="text-lg">Create New User</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-[#f26b6b] hover:bg-[#e55d5d] border-2 border-black rounded-lg box-style-md cursor-pointer">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 px-5 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold uppercase tracking-wide">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
              required
              className="w-full px-3 py-2 bg-white border-2 border-black box-style-sm font-bold"
              placeholder="johndoe"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold uppercase tracking-wide">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              className="w-full px-3 py-2 bg-white border-2 border-black box-style-sm font-bold"
              placeholder="john@example.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold uppercase tracking-wide">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
              minLength={8}
              className="w-full px-3 py-2 bg-white border-2 border-black box-style-sm font-bold"
              placeholder="Min 8 characters"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold uppercase tracking-wide">Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              required
              minLength={8}
              className="w-full px-3 py-2 bg-white border-2 border-black box-style-sm font-bold"
              placeholder="Re-enter password"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold uppercase tracking-wide">Roles</label>
            <div className="flex gap-2">
              {AVAILABLE_ROLES.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`px-3 py-1.5 border-2 border-black box-style-sm text-xs font-bold uppercase transition ${formData.roles.includes(role)
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

          <div className="flex justify-end gap-3 border-t-2 border-black pt-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-200 hover:bg-gray-300 border-2 border-black box-style-md uppercase font-bold">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || formData.roles.length === 0}
              className="px-5 py-2 bg-[#63d079] hover:bg-[#4ec767] border-2 border-black box-style-md uppercase font-bold disabled:opacity-50 disabled:cursor-not-allowed">
              {createMutation.isPending ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

