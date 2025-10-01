import React from "react";
import { IconType } from "react-icons";
import AuthPage from "../pages/public/AuthPage.tsx";
import HomePage from "../pages/public/HomePage.tsx";
import OAuthCallback from "../pages/oauth/OAuthCallback.tsx";
import {
  FaCog,
  FaCompass,
  FaHome,
  FaLink,
  FaList,
  FaListAlt,
  FaQuestionCircle,
} from "react-icons/fa";
import PlaceholderPage from "../pages/private/PlaceholderPage.tsx";
import DashboardPage from "../pages/private/DashboardPage.tsx";
import ConnectionsPage from "../pages/private/ConnectionsPage.tsx";

export interface AppRoute {
  path: string;
  element: React.ReactElement;
  label?: string;
  private?: boolean;
  publicOnly?: boolean;
  icon?: IconType;
  category?: string;
  noLayout?: boolean;
}

export const AppRoutes: AppRoute[] = [
  {
    path: "/",
    element: <HomePage/>,
    label: "Home",
    icon: FaHome,
    category: "",
    publicOnly: true,
    noLayout: true,
  },

  {
    path: "/dashboard",
    element: <DashboardPage/>,
    label: "Dashboard",
    icon: FaHome,
    private: true
  },

  // My Library
  {
    path: "/playlists",
    element: <PlaceholderPage/>,
    label: "Playlists",
    private: true,
    icon: FaList,
    category: "My Library",
  },

  // Discover
  {
    path: "/hub",
    element: <PlaceholderPage/>,
    label: "Discovery Hub",
    icon: FaCompass,
    category: "Discover",
  },

  // Manage
  {
    path: "/activity",
    element: <PlaceholderPage/>,
    label: "Activity",
    private: true,
    icon: FaListAlt,
    category: "Manage",
  },
  {
    path: "/connections",
    element: <ConnectionsPage/>,
    label: "Connections",
    private: true,
    icon: FaLink,
    category: "Manage",
  },
  {
    path: "/settings",
    element: <PlaceholderPage/>,
    label: "Settings",
    private: true,
    icon: FaCog,
    category: "Manage",
  },

  // Support
  {
    path: "/help",
    element: <PlaceholderPage/>,
    label: "Help",
    icon: FaQuestionCircle,
    category: "Support",
  },

  // Auth
  {
    path: "/auth",
    element: <AuthPage/>,
    publicOnly: true,
    noLayout: true,
  },
  {
    path: "/api/oauth/:provider/callback",
    element: <OAuthCallback/>,
    noLayout: true,
  },
];
