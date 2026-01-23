import React from "react";
import { IconType } from "react-icons";
import {
  FaCog,
  FaHome,
  FaLink,
  FaList,
  FaListAlt,
  FaQuestionCircle,
  FaShieldAlt
} from "react-icons/fa";
import OAuthCallback from "../pages/oauth/OAuthCallback.tsx";
import AdminPanelPage from "../pages/private/AdminPanelPage.tsx";
import AuditLogsPage from "../pages/private/AuditLogsPage.tsx";
import ConnectionsPage from "../pages/private/ConnectionsPage.tsx";
import PlaceholderPage from "../pages/private/PlaceholderPage.tsx";
import PlaylistsPage from "../pages/private/PlaylistsPage.tsx";
import UserSettingsPage from "../pages/private/SettingsPage.tsx";
import AuthPage from "../pages/public/AuthPage.tsx";
import HomePage from "../pages/public/HomePage.tsx";

export interface AppRoute {
  path: string;
  element: React.ReactElement;
  label?: string;
  private?: boolean;
  publicOnly?: boolean;
  icon?: IconType;
  category?: string;
  noLayout?: boolean;
  adminOnly?: boolean;
}

export const AppRoutes: AppRoute[] = [
  {
    path: "/",
    element: <HomePage />,
    label: "Home",
    icon: FaHome,
    category: "",
    publicOnly: true,
    noLayout: true,
  },

  // My Library
  {
    path: "/playlists",
    element: <PlaylistsPage />,
    label: "Playlists",
    private: true,
    icon: FaList,
    category: "My Library",
  },

  // Admin
  {
    path: "/admin",
    element: <AdminPanelPage />,
    label: "Admin Panel",
    private: true,
    adminOnly: true,
    icon: FaShieldAlt,
    category: "Admin",
  },

  // Manage
  {
    path: "/activity",
    element: <AuditLogsPage />,
    label: "Activity",
    private: true,
    icon: FaListAlt,
    category: "Manage",
  },
  {
    path: "/connections",
    element: <ConnectionsPage />,
    label: "Connections",
    private: true,
    icon: FaLink,
    category: "Manage",
  },
  {
    path: "/settings",
    element: <UserSettingsPage />,
    label: "Settings",
    private: true,
    icon: FaCog,
    category: "Manage",
  },

  // Support
  {
    path: "/help",
    element: <PlaceholderPage />,
    label: "Help",
    icon: FaQuestionCircle,
    category: "Support",
  },

  // Auth
  {
    path: "/auth",
    element: <AuthPage />,
    publicOnly: true,
    noLayout: true,
  },
  {
    path: "/oauth-callback/:provider",
    element: <OAuthCallback />,
    noLayout: true,
  },
];
