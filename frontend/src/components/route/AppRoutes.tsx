import React, { lazy, Suspense } from "react";
import { IconType } from "react-icons";
import AuthPage from "../../pages/public/AuthPage.tsx";
import HomePage from "../../pages/public/HomePage.tsx";
import OAuthComplete from "../../pages/oauth/OAuthComplete.tsx";
import OAuthError from "../../pages/oauth/OAuthError.tsx";
import OAuthRoute from "./OAuthRoute.tsx";
import OAuthCallback from "../../pages/oauth/OAuthCallback.tsx";
import Spinner from "../common/Spinner.tsx";
import SettingsPage from "../../pages/private/SettingsPage.tsx";
import HelpPage from "../../pages/public/HelpPage.tsx";
import {
  FaHome,
  FaList,
  FaCog,
  FaQuestionCircle,
  FaSync,
  FaShareAlt, FaLink, FaCompass, FaExchangeAlt, FaRegClone, FaListAlt,
} from "react-icons/fa";
import PlaceholderPage from "../../pages/private/PlaceholderPage.tsx";

const PlaylistPage = lazy(() => import("../../pages/private/PlaylistPage.tsx"));

export interface AppRoute {
  path: string;
  element: React.ReactElement;
  label?: string;
  private?: boolean;
  publicOnly?: boolean;
  icon?: IconType;
  category?: string;
}

export const AppRoutes: AppRoute[] = [
  {
    path: "/",
    element: <HomePage/>,
    label: "Home",
    icon: FaHome,
    category: "",
  },

  // My Library
  {
    path: "/playlists",
    element: (
      <Suspense fallback={ <Spinner/> }>
        <PlaylistPage/>
      </Suspense>
    ),
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
    path: "/platforms",
    element: <PlaceholderPage/>,
    label: "Connections",
    private: true,
    icon: FaLink,
    category: "Manage",
  },
  {
    path: "/settings",
    element: <SettingsPage/>,
    label: "Settings",
    private: true,
    icon: FaCog,
    category: "Manage",
  },

  // Support
  {
    path: "/help",
    element: <HelpPage/>,
    label: "Help",
    icon: FaQuestionCircle,
    category: "Support",
  },

  // Auth
  {
    path: "/auth",
    element: <AuthPage/>,
    publicOnly: true,
  },
  {
    path: "/api/oauth/:provider/callback",
    element: <OAuthCallback/>,
  },
  {
    path: "/oauth/complete",
    element: (
      <OAuthRoute>
        <OAuthComplete/>
      </OAuthRoute>
    ),
  },
  {
    path: "/oauth/error",
    element: (
      <OAuthRoute>
        <OAuthError/>
      </OAuthRoute>
    ),
  },
];
