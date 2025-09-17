import { AppRoute, AppRoutes } from "../route/AppRoutes.tsx";
import { Button } from "./Button.tsx";
import { useLocation, useNavigate } from "react-router-dom";
import { Logo } from "./Logo.tsx";

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = AppRoutes.filter((r) => r.label && !r.publicOnly);

  const homeRoute = navItems.find((r) => r.path === "/");
  const otherRoutes = navItems.filter((r) => r.path !== "/");

  const categories = Array.from(
    new Set(otherRoutes.map((route) => route.category).filter(Boolean))
  ) as string[];

  const categorizedRoutes: Record<string, AppRoute[]> = {};
  for (const category of categories) {
    categorizedRoutes[category] = otherRoutes.filter((r) => r.category === category);
  }

  return (
    <aside className="w-full h-full bg-gradient-to-b from-white/80 to-[#f8f8f8]/80 backdrop-blur-md border-r border-gray-200/50 flex flex-col justify-between py-6">
      <div className="px-6">
        <div className="px-6 pb-8 pt-2">
          <Logo/>
        </div>

      </div>

      <div className="flex-1 overflow-y-auto mt-4">
        { homeRoute && (
          <nav className="flex flex-col px-6 space-y-3">
            <Button
              key={ homeRoute.path }
              label={ homeRoute.label! }
              Icon={ homeRoute.icon }
              active={ location.pathname === homeRoute.path }
              fullWidth
              small
              onClick={ () => navigate(homeRoute.path!) }
            />
          </nav>
        ) }

        { categories.map((category) => (
          <nav
            key={ category }
            className="flex flex-col px-6 mt-6 space-y-3">
            <div className="mb-3 text-sm font-semibold tracking-widest text-gray-600/80 uppercase">
              { category }
            </div>
            { categorizedRoutes[category].map(({ label, path, icon: Icon }) => (
              <Button
                key={ path }
                label={ label! }
                Icon={ Icon }
                active={ location.pathname === path }
                fullWidth
                small
                onClick={ () => navigate(path!) }
              />
            )) }
          </nav>
        )) }
      </div>
    </aside>
  );
}
