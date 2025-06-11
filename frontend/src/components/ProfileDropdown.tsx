import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { FaChevronDown } from "react-icons/fa";
import { UserDto } from "../models/User";

interface ProfileDropdownProps {
  onSettings: () => void;
  onLogout: () => void;
  user: UserDto | null;
}

const ProfileDropdown = ({
  onSettings,
  onLogout,
  user,
}: ProfileDropdownProps) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton className="flex items-center gap-2 px-4 py-1 bg-white/10 border-2 border-gray-700 rounded-full backdrop-blur-xl text-white hover:bg-white/20 transition">
        <span>{user?.username || "User"}</span>
        <FaChevronDown className="text-sm" />
      </MenuButton>

      <MenuItems className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 origin-top bg-white/10 border-2 border-gray-700 rounded-xl backdrop-blur-xl shadow-lg ring-black/5 focus:outline-none z-50">
        <div className="p-1 text-white">
          <MenuItem>
            <button
              onClick={onSettings}
              className="w-full text-left px-4 py-2 rounded-md transition data-[focus]:bg-white/20"
            >
              Settings
            </button>
          </MenuItem>
          <MenuItem>
            <button
              onClick={onLogout}
              className="w-full text-left px-4 py-2 rounded-md transition data-[focus]:bg-white/20"
            >
              Logout
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
};

export default ProfileDropdown;
