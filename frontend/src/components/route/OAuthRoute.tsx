import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useOAuthAccess } from "../../context/OAuthFlowContext.tsx";

const OAuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { allowAccess } = useOAuthAccess();

  const allow =
    location.state?.allowOAuth === true || allowAccess;

  if (!allow) {
    return <Navigate to="/" replace/>;
  }

  return <>{ children }</>;
};

export default OAuthRoute;