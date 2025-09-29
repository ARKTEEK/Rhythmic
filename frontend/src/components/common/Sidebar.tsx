import { AppRoute, AppRoutes } from "../../data/AppRoutes.tsx";
import Button from "../ui/Button.tsx";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo.tsx";

export default function Sidebar() {
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
    <aside
      className="w-full h-full flex flex-col justify-between py-6 border-r-4 border-black
                 bg-[#e0b39c] relative overflow-hidden z-100">
      <div className="bg-grid-pattern absolute inset-0 pointer-events-none"/>

      <div className="flex justify-center px-6 pb-8 pt-2 relative z-10">
        <Logo
          size="md"
          underline/>
      </div>

      <div className="flex-1 overflow-y-auto pt-6 relative z-10">
        { homeRoute && (
          <nav className="flex flex-col px-6 space-y-4 mb-6">
            <Button
              key={ homeRoute.path }
              label={ homeRoute.label! }
              Icon={ homeRoute.icon }
              variant={ location.pathname === homeRoute.path ? 'active' : 'inactive' }
              size="small"
              onClick={ () => navigate(homeRoute.path!) }
            />
          </nav>
        ) }

        { Object.entries(categorizedRoutes).map(([category, routes]) => (
          <nav
            key={ category }
            className="flex flex-col px-6 mt-6 space-y-4">
            <div
              className="mb-3 text-sm font-bold tracking-widest text-gray-800 uppercase border-b-2
                         border-dotted border-gray-600 pb-1">
              { category }
            </div>
            { routes.map(({ label, path, icon: Icon }) => (
              <Button
                key={ path }
                label={ label! }
                Icon={ Icon }
                variant={ location.pathname === path ? 'active' : 'inactive' }
                size="small"
                onClick={ () => navigate(path!) }
              />
            )) }
          </nav>
        )) }
      </div>
    </aside>
  );
}
