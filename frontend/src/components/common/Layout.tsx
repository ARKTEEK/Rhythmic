import { ReactNode, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth.tsx";
import { Sidebar } from "./Sidebar.tsx";
import { TopNavBar } from "./TopNavBar.tsx";
import { useLocation } from "react-router-dom";
import { useSetTopNavActions, useTopNavActions } from "../../context/TopNavActionsContext.tsx";

interface LayoutProps {
  children: ReactNode;
  showProfile?: boolean;
}

export const Layout = ({ children }: LayoutProps) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const setTopNavActions = useSetTopNavActions();
  const actions = useTopNavActions();

  useEffect(() => {
    setTopNavActions([]);
  }, [location.pathname, setTopNavActions]);

  return (
    <div
      className="bg-[#ede0d0] min-h-screen min-w-screen
                 relative overflow-hidden flex">
      { isAuthenticated && (
        <aside className="w-64 h-screen fixed top-0 left-0 z-10">
          <Sidebar/>
        </aside>
      ) }

      <div
        className="flex-1 flex flex-col transition-all duration-300"
        style={ { marginLeft: isAuthenticated ? "16rem" : 0 } }>
        { isAuthenticated && <TopNavBar actions={ actions }/> }
        <main className="flex-1 overflow-auto">{ children }</main>
      </div>
    </div>
  );
};
