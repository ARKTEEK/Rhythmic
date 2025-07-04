import { Dialog, DialogPanel } from "@headlessui/react";
import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaSpotify, FaYoutube } from "react-icons/fa";
import { FaX } from "react-icons/fa6";
import { useAuth } from "../../hooks/useAuth.tsx";

const ProfilePopup: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const googleOAuth = () => {
    window.location.href = "https://localhost:7184/api/oauth/google/login";
  };

  const { user } = useAuth();
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
        aria-hidden="true"
      />

      <DialogPanel className="relative bg-white/10 border border-white/30 shadow-2xl backdrop-blur-xl rounded-2xl w-full max-w-2xl p-6 text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-red-400 transition"
        >
          <FaX />
        </button>

        <h2 className="text-2xl font-semibold mb-8 text-center">
          User Settings
        </h2>

        {/* Section 1: Profile Info */}
        <div className="mb-10">
          <h3 className="text-xl font-medium mb-4 border-b border-white/20 pb-2">
            Profile
          </h3>
          <label className="block mb-4">
            <span className="block text-sm font-medium">Username</span>
            <input
              type="text"
              className="w-full mt-1 rounded-lg bg-white/20 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium">Email</span>
            <input
              type="email"
              className="w-full mt-1 rounded-lg bg-white/20 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
        </div>

        <div className="mb-10">
          <h3 className="text-xl font-medium mb-4 border-b border-white/20 pb-2">
            Change Password
          </h3>
          <label className="block relative mb-4">
            <span className="block text-sm font-medium">New Password</span>
            <input
              type={showNewPassword ? "text" : "password"}
              className="w-full mt-1 rounded-lg bg-white/20 text-white px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute top-9 right-3 text-white/80 hover:text-white"
              onMouseDown={() => setShowNewPassword(true)}
              onMouseUp={() => setShowNewPassword(false)}
              onMouseLeave={() => setShowNewPassword(false)}
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </label>
          <label className="block relative">
            <span className="block text-sm font-medium">
              Repeat New Password
            </span>
            <input
              type={showRepeatPassword ? "text" : "password"}
              className="w-full mt-1 rounded-lg bg-white/20 text-white px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute top-9 right-3 text-white/80 hover:text-white"
              onMouseDown={() => setShowRepeatPassword(true)}
              onMouseUp={() => setShowRepeatPassword(false)}
              onMouseLeave={() => setShowRepeatPassword(false)}
            >
              {showRepeatPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </label>
        </div>

        <div>
          <h3 className="text-xl font-medium mb-4 border-b border-white/20 pb-2">
            Connections
          </h3>
          <div className="flex flex-col gap-4">
            <button className="flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 transition text-white rounded-xl py-2 font-medium">
              <FaSpotify className="w-5 h-5" />
              Connect Spotify
            </button>
            <button
              onClick={googleOAuth}
              className="flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 transition text-white rounded-xl py-2 font-medium"
            >
              <FaYoutube className="w-5 h-5" />
              Connect YouTube
            </button>
          </div>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default ProfilePopup;
