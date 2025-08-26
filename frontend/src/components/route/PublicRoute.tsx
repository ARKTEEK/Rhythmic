import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.tsx";

interface PublicRouteProps {
  children: ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate
      to="/"
      replace/>;
  }

  return <>{ children }</>;
};

export default PublicRoute;
