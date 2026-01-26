import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSetTopNavActions, useTopNavActions } from "../../context/TopNavActionsContext.tsx";
import { AppRoutes } from "../../data/AppRoutes.tsx";
import { useAuth } from "../../hooks/useAuth.tsx";
import Sidebar from "./Sidebar.tsx";
import TopNavBar from "./TopNavBar.tsx";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuth();
  const setTopNavActions = useSetTopNavActions();
  const actions = useTopNavActions();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const currentRoute = AppRoutes.find(route => {
    const pathSegments = route.path.split('/');
    const locationSegments = location.pathname.split('/');
    if (pathSegments.length !== locationSegments.length) {
      return false;
    }
    return pathSegments.every((segment, index) =>
      segment.startsWith(':') || segment === locationSegments[index]
    );
  });
  const hasLayout = !currentRoute?.noLayout;

  useEffect(() => {
    setTopNavActions([]);
  }, [location.pathname, setTopNavActions]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="bg-[#f9ccb5] min-h-screen w-screen relative overflow-hidden flex">
      {isMobile && isSidebarOpen && isAuthenticated && hasLayout && (
        <div
          className="fixed inset-0 bg-black/50 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {isAuthenticated && hasLayout && (
        <aside
          className={`
            h-screen fixed top-0 left-0 z-30 transition-transform duration-300
            ${isMobile ? 'w-64' : 'w-64'}
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
          <Sidebar onClose={() => setIsSidebarOpen(false)} isMobile={isMobile} />
        </aside>
      )}

      <div
        className={`
          flex-1 flex flex-col transition-all duration-300
          ${isAuthenticated && hasLayout && isSidebarOpen && !isMobile ? 'ml-64' : 'ml-0'}
        `}>
        {isAuthenticated && hasLayout && (
          <TopNavBar
            actions={actions}
            onToggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
          />
        )}
        <main className="flex-1 overflow-auto h-full">
          <div className="bg-grid-pattern h-full flex items-center justify-center">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
