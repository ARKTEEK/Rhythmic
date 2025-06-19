import AuthPage from "../../pages/AuthPage";
import HomePage from "../../pages/HomePage";
import PlaylistPage from "../../pages/PlaylistPage";

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
  { path: "/auth", element: <AuthPage />, publicOnly: true },
];
