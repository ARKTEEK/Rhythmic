import { lazy } from "react";
import AuthPage from "../../pages/AuthPage";
import HomePage from "../../pages/HomePage";
import PlaylistPage from "../../pages/PlaylistPage";

const ImportPage = lazy(() => import("../../pages/ImportPage"));
const SettingsPage = lazy(() => import("../../pages/SettingsPage"));
const BrowsePage = lazy(() => import("../../pages/BrowsePage"));
const HelpPage = lazy(() => import("../../pages/HelpPage"));

export interface AppRoute {
  path: string;
  element: React.ReactElement;
  label?: string;
  private?: boolean;
  publicOnly?: boolean;
}

export const AppRoutes: AppRoute[] = [
  { path: "/", element: <HomePage />, label: "Home" },
  {
    path: "/playlists",
    element: <PlaylistPage />,
    label: "Playlists",
    private: true,
  },
  { path: "/import", element: <ImportPage />, label: "Import", private: true },
  { path: "/settings", element: <SettingsPage />, label: "Settings" },
  {
    path: "/browse",
    element: <BrowsePage />,
    label: "Browse",
    private: true,
  },
  { path: "/help", element: <HelpPage />, label: "Help" },
  { path: "/auth", element: <AuthPage />, publicOnly: true },
];
