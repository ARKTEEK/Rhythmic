import { ReactNode, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth.tsx";
import Sidebar from "./Sidebar.tsx";
import TopNavBar from "./TopNavBar.tsx";
import { useLocation } from "react-router-dom";
import { useSetTopNavActions, useTopNavActions } from "../../context/TopNavActionsContext.tsx";
import { AppRoutes } from "../../data/AppRoutes.tsx";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuth();
  const setTopNavActions = useSetTopNavActions();
  const actions = useTopNavActions();
  const location = useLocation();

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
  return (
    <div
      className="bg-[#f9ccb5] min-h-screen min-w-screen relative overflow-hidden flex">
      { isAuthenticated && hasLayout && (
        <aside className="w-64 h-screen fixed top-0 left-0 z-10">
          <Sidebar/>
        </aside>
      ) }

      <div
        className="flex-1 flex flex-col transition-all duration-300"
        style={ { marginLeft: isAuthenticated && hasLayout ? "16rem" : 0 } }>
        { isAuthenticated && hasLayout && <TopNavBar actions={ actions }/> }
        <main className="flex-1 overflow-auto h-full">
          <div
            className="bg-grid-pattern h-full flex items-center justify-center">
            { children }
          </div>
        </main>
      </div>
    </div>
  );
}
