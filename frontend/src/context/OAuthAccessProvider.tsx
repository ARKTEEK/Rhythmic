import { ReactNode, useEffect, useState } from "react";
import { OAuthFlowContext } from "./OAuthFlowContext";

interface OAuthAccessProviderProps {
  children: ReactNode;
}

export default function OAuthAccessProvider({ children }: OAuthAccessProviderProps) {
  const [allowAccess, setAllowAccessState] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("allow_oauth_access");
    if (stored === "true") {
      setAllowAccessState(true);
    }
  }, []);

  const setAllowAccess = (allowed: boolean) => {
    sessionStorage.setItem("allow_oauth_access", String(allowed));
    setAllowAccessState(allowed);
  };

  return (
    <OAuthFlowContext.Provider value={ { allowAccess, setAllowAccess } }>
      { children }
    </OAuthFlowContext.Provider>
  );
}