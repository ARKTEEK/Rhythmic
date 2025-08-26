import React, { lazy, Suspense } from "react";
import AuthPage from "../../pages/public/AuthPage.tsx";
import HomePage from "../../pages/public/HomePage.tsx";
import OAuthComplete from "../../pages/oauth/OAuthComplete.tsx";
import OAuthError from "../../pages/oauth/OAuthError.tsx";
import OAuthRoute from "./OAuthRoute.tsx";
import OAuthCallback from "../../pages/oauth/OAuthCallback.tsx";
import ProfilePage from "../../pages/private/ProfilePage.tsx";
import Spinner from "../common/Spinner.tsx";
import ImportPage from "../../pages/private/ImportPage.tsx";
import SettingsPage from "../../pages/private/SettingsPage.tsx";
import HelpPage from "../../pages/public/HelpPage.tsx";

const PlaylistPage = lazy(() => import("../../pages/private/PlaylistPage.tsx"));

export interface AppRoute {
  path: string;
  element: React.ReactElement;
  label?: string;
  private?: boolean;
  publicOnly?: boolean;
}

export const AppRoutes: AppRoute[] = [
  {
    path: "/",
    element: <HomePage/>,
    label: "Home"
  },
  {
    path: "/playlists",
    element: (
      <Suspense fallback={ <Spinner/> }>
        <PlaylistPage/>
      </Suspense>
    ),
    label: "Playlists",
    private: true,
  },

  {
    path: "/import",
    element: <ImportPage/>,
    label: "Import",
    private: true
  },
  {
    path: "/settings",
    element: <SettingsPage/>,
    label: "Settings",
    private: true
  },
  {
    path: "/api/oauth/:provider/callback",
    element: <OAuthCallback/>
  },
  {
    path: "/oauth/complete",
    element:
      <OAuthRoute>
        <OAuthComplete/>
      </OAuthRoute>
  },
  {
    path: "/oauth/error",
    element:
      <OAuthRoute>
        <OAuthError/>
      </OAuthRoute>
  },
  {
    path: "/profile",
    element: <ProfilePage/>,
    label: "Profile",
    private: true,
  },
  {
    path: "/help",
    element: <HelpPage/>,
    label: "Help"
  },
  {
    path: "/auth",
    element: <AuthPage/>,
    publicOnly: true
  },
];
