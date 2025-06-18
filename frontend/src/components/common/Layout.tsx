import { ReactNode, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import ProfileDropdown from "./ProfileDropdown";
import ProfilePopup from "./ProfilePopup";

interface LayoutProps {
  children: ReactNode;
  showProfile?: boolean;
}

const Layout = ({ children, showProfile = true }: LayoutProps) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="bg-black min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-6">
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`${
            isAuthenticated ? "w-[600px] h-[600px]" : "w-96 h-96"
          } bg-red-500 opacity-20 blur-3xl rounded-full`}
        />
      </div>

      {isAuthenticated && showProfile && (
        <div className="absolute top-4 right-4 text-white text-right">
          <ProfileDropdown
            user={user}
            onSettings={() => setShowPopup(true)}
            onLogout={logout}
          />
          <ProfilePopup
            isOpen={showPopup}
            onClose={() => setShowPopup(false)}
          />
        </div>
      )}

      <div className="relative z-10 w-[70vw] flex justify-center items-center text-white overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default Layout;
