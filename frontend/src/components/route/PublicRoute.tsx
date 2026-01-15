import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.tsx";

interface PublicRouteProps {
  children: ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || '/playlists';
    return <Navigate
      to={ from }
      replace/>;
  }

  return <>{ children }</>;
};
