import { Menu } from "lucide-react";
import { FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth.tsx";
import Button from "../ui/Button.tsx";

interface TopNavBarProps {
  actions: {
    id: string;
    label: string;
    onClick: () => void;
    active?: boolean;
    Icon?: any;
    buttonClassName?: string;
    textClassName?: string;
  }[];
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export default function TopNavBar({ actions, onToggleSidebar, isSidebarOpen }: TopNavBarProps) {
  const { user } = useAuth();

  const handleLogout = (): void => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div
      className="flex justify-between items-center min-h-[48px] h-[48px] sm:h-[56px] md:h-[64px]
                 px-3 sm:px-4 md:px-6 border-b-4 border-black bg-[#e0b39c] relative">
      <div className="bg-stripes absolute inset-0" />

      <div className="flex items-center gap-2 sm:gap-3 relative z-10">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 bg-[#f3d99c] hover:bg-[#f1d189] border-2 border-black box-style-md
                       cursor-pointer transition-colors"
            aria-label="Toggle sidebar">
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <Button
              key={action.id}
              label={action.label}
              variant={action.active === true ? 'active' : 'inactive'}
              onClick={action.onClick}
              Icon={action.Icon}
              color={action.buttonClassName}
              textColorClassName={action.textClassName}
              size="small"
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 relative">
        <div className="hidden sm:flex items-center gap-2">
          <img
            src={`https://ui-avatars.com/api/?name=${user?.username}&background=0D8ABC&color=fff`}
            alt="User"
            className="w-8 h-8 rounded-lg object-cover box-style-md"
          />
          <span className="hidden md:block text-md font-semibold text-black">{user?.username}</span>
        </div>

        <div className="relative">
          <FaSignOutAlt
            onClick={() => {
              handleLogout();
            }}
            className="text-black cursor-pointer hover:opacity-70 hover:text-blue-600
                       transition-opacity w-5 h-5"
          />
        </div>
      </div>
    </div>
  );
}
