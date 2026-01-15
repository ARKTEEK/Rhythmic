import { useMutation } from "@tanstack/react-query";
import { Lock, Mail, Save, Settings, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import Notification from "../../components/ui/Notification";
import Window from "../../components/ui/Window";
import { useAuth } from "../../hooks/useAuth";
import { changePassword, updateProfile } from "../../services/UserProfileService";

export default function UserSettingsPage() {
  const { user, logout } = useAuth();

  const [profileData, setProfileData] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const updateProfileMutation = useMutation({
    mutationFn: () => updateProfile({
      username: profileData.username !== user?.username ? profileData.username : undefined,
      email: profileData.email !== user?.email ? profileData.email : undefined,
    }),
    onSuccess: () => {
      toast.success(Notification, {
        data: {
          title: "Profile Updated",
          content: "Your profile has been updated successfully. Please log in again.",
        },
        icon: false,
      });
      setTimeout(() => logout(), 2000);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || "Failed to update profile";
      toast.error(message);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: () => changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    }),
    onSuccess: () => {
      toast.success(Notification, {
        data: {
          title: "Password Changed",
          content: "Your password has been changed successfully. Please log in again.",
        },
        icon: false,
      });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => logout(), 2000);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || "Failed to change password";
      toast.error(message);
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (profileData.username === user?.username && profileData.email === user?.email) {
      toast.info("No changes to save");
      return;
    }

    updateProfileMutation.mutate();
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    changePasswordMutation.mutate();
  };

  return (
    <div className="p-6 font-mono flex flex-col text-black h-full w-full overflow-hidden">
      <Window
        containerClassName="w-full h-full box-style-md overflow-hidden bg-[#fff5df]"
        ribbonClassName="bg-[#8cc6f3] border-b-4 border-black text-white font-extrabold"
        windowClassName="bg-[#fff9ec]"
        ribbonContent={
          <div className="flex items-center justify-between w-full px-4 py-1">
            <h2 className="text-lg text-black uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-5 h-5" />
              User Settings
            </h2>
          </div>
        }>
        <div className="p-3 flex flex-col gap-6 overflow-y-auto retro-scrollbar h-full">
          {/* PROFILE SETTINGS */}
          <section className="p-5 bg-white border-2 border-black box-style-lg rounded">
            <div className="flex items-center gap-2 mb-4">
              <UserIcon className="w-5 h-5 text-[#9b88c7]" />
              <h3 className="uppercase font-extrabold text-lg">Profile Information</h3>
            </div>

            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm uppercase tracking-wide">Username</label>
                <input
                  type="text"
                  className="px-3 py-2 bg-[#fffaf5] border-2 border-black box-style-sm font-bold"
                  value={profileData.username}
                  onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  className="px-3 py-2 bg-[#fffaf5] border-2 border-black box-style-sm font-bold"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="px-4 py-2 bg-[#63d079] hover:bg-[#4ec767] border-2 border-black box-style-md uppercase font-extrabold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Save className="w-4 h-4" />
                  {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </section>

          {/* PASSWORD SETTINGS */}
          <section className="p-5 bg-white border-2 border-black box-style-lg rounded">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-[#f26b6b]" />
              <h3 className="uppercase font-extrabold text-lg">Change Password</h3>
            </div>

            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm uppercase tracking-wide">Current Password</label>
                <input
                  type="password"
                  className="px-3 py-2 bg-[#fffaf5] border-2 border-black box-style-sm font-bold"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm uppercase tracking-wide">New Password</label>
                <input
                  type="password"
                  className="px-3 py-2 bg-[#fffaf5] border-2 border-black box-style-sm font-bold"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  required
                  minLength={8}
                  placeholder="Min 8 characters"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm uppercase tracking-wide">Confirm New Password</label>
                <input
                  type="password"
                  className="px-3 py-2 bg-[#fffaf5] border-2 border-black box-style-sm font-bold"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  minLength={8}
                  placeholder="Re-enter new password"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="px-4 py-2 bg-[#f26b6b] hover:bg-[#e55d5d] border-2 border-black box-style-md uppercase font-extrabold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Lock className="w-4 h-4" />
                  {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </section>

          {/* INFO BOX */}
          <section className="p-3 bg-[#fff3e6] border-2 border-black box-style-md rounded">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-[#40a8d0]" />
              <h4 className="font-bold text-sm uppercase">Important</h4>
            </div>
            <p className="text-sm text-gray-700">
              Changing your email or password will require you to log in again. Make sure you remember your new credentials.
            </p>
          </section>
        </div>
      </Window>
    </div>
  );
}
