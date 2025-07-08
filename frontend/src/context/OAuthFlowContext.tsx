import React, { createContext, useContext, useEffect, useState } from "react";

const OAuthFlowContext = createContext<{
  allowAccess: boolean;
  setAllowAccess: (allowed: boolean) => void;
}>({
  allowAccess: false,
  setAllowAccess: () => {
  },
});

export const useOAuthAccess = () => useContext(OAuthFlowContext);

export const OAuthAccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
};