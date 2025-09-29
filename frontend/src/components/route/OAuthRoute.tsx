import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useOAuthAccess } from "../../context/OAuthFlowContext.tsx";

interface OAuthProps {
  children: ReactNode;
}

export default function OAuthRoute({ children }: OAuthProps) {
  const location = useLocation();
  const { allowAccess } = useOAuthAccess();

  const allow = location.state?.allowOAuth === true || allowAccess;

  if (!allow) {
    return <Navigate
      to="/"
      replace/>;
  }

  return <>{ children }</>;
};