import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import { AdminUserDto } from "../../models/User";
import { sendPasswordResetEmail } from "../../services/AdminService";
import Notification from "../ui/Notification";
import ConfirmWindow from "../ui/Window/ConfirmWindow";
import EditUserRolesModal from "./EditUserRolesModal";

interface UserTableProps {
  users: AdminUserDto[];
}

export default function UserTable({ users }: UserTableProps) {
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<AdminUserDto | null>(null);
  const [userToResetPassword, setUserToResetPassword] = useState<{ id: string; email: string } | null>(null);

  const resetPasswordMutation = useMutation({
    mutationFn: (userId: string) => sendPasswordResetEmail(userId),
    onSuccess: () => {
      toast.success(Notification, {
        data: {
          title: "Password Reset Sent",
          content: "Password reset email has been sent successfully",
        },
        icon: false,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => {
      toast.error("Failed to send password reset email");
    },
  });

  const handleResetPassword = (userId: string, userEmail: string) => {
    setUserToResetPassword({ id: userId, email: userEmail });
  };

  return (
    <>
      <div className="bg-white border-2 border-black box-style-md overflow-hidden h-full flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full font-mono">
            <thead className="bg-[#f3d99c] border-b-2 border-black sticky top-0">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider">
                  Roles
                </th>
                <th className="px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider">
                  Connections
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider">
                  Manage
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[#fffaf5] transition">
                  <td className="px-4 py-3">
                    <div className="font-bold text-sm">{user.username}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-700">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className={`text-xs min-w-[60px] max-w-[60px] text-center px-2 py-1 border border-black box-style-sm font-bold uppercase ${role === "Admin"
                              ? "bg-[#f26b6b] text-white"
                              : "bg-[#e0b39c] text-black"
                            }`}>
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-bold text-sm">{user.actionsCount}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-bold text-sm">{user.tokensCount}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="cursor-pointer px-2.5 py-1.5 bg-[#9b88c7] hover:bg-[#8a77b6] border-2 border-black box-style-md text-xs font-bold uppercase">
                        Roles
                      </button>
                      <button
                        onClick={() => handleResetPassword(user.id, user.email)}
                        disabled={resetPasswordMutation.isPending}
                        className="cursor-pointer px-2.5 py-1.5 bg-[#40a8d0] hover:bg-[#3597bd] border-2 border-black box-style-md text-xs font-bold uppercase disabled:opacity-50 disabled:cursor-not-allowed">
                        Reset Pass
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="text-center py-8 text-gray-600 italic">No users found</div>
        )}
      </div>

      {editingUser && (
        <EditUserRolesModal user={editingUser} onClose={() => setEditingUser(null)} />
      )}

      {userToResetPassword && (
        <ConfirmWindow
          height="200px"
          confirmTitle="Reset Password"
          confirmMessage={`Send password reset email to ${userToResetPassword.email}?`}
          onCancel={() => setUserToResetPassword(null)}
          onConfirm={() => {
            resetPasswordMutation.mutate(userToResetPassword.id);
            setUserToResetPassword(null);
          }}
        />
      )}
    </>
  );
}

