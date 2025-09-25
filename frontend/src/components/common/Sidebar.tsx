import { AppRoute, AppRoutes } from "../route/AppRoutes.tsx";
import { Button } from "./Button.tsx";
import { useLocation, useNavigate } from "react-router-dom";
import { Logo } from "./Logo.tsx";

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = AppRoutes.filter((r) => r.label && !r.publicOnly);

  const homeRoute = navItems.find((r) => r.path === "/dashboard");
  const otherRoutes = navItems.filter((r) => r.path !== "/dashboard");

  const categorizedRoutes = otherRoutes.reduce<Record<string, AppRoute[]>>((acc, route) => {
    if (!route.category) return acc;
    acc[route.category] = acc[route.category] || [];
    acc[route.category].push(route);
    return acc;
  }, {});

  return (
    <aside className="w-full h-full flex flex-col justify-between py-6 border-r-2 border-black">
      <div className="flex justify-center px-6 pb-8 pt-2">
        <Logo
          size="md"
          underline/>
      </div>

      <div className="flex-1 overflow-y-auto pt-6">
        { homeRoute && (
          <nav className="flex flex-col px-6 space-y-4 mb-6">
            <Button
              key={ homeRoute.path }
              label={ homeRoute.label! }
              Icon={ homeRoute.icon }
              variant={ location.pathname === homeRoute.path ? 'active' : 'inactive' }
              size="small"
              onClick={ () => navigate(homeRoute.path!) }/>
          </nav>
        ) }

        { Object.entries(categorizedRoutes).map(([category, routes]) => (
          <nav
            key={ category }
            className="flex flex-col px-6 mt-6 space-y-4">
            <div className="mb-3 text-sm font-bold tracking-widest text-gray-800 uppercase">
              { category }
            </div>
            { routes.map(({ label, path, icon: Icon }) => (
              <Button
                key={ path }
                label={ label! }
                Icon={ Icon }
                variant={ location.pathname === path ? 'active' : 'inactive' }
                size="small"
                onClick={ () => navigate(path!) }/>
            )) }
          </nav>
        )) }
      </div>
    </aside>
  );
}
