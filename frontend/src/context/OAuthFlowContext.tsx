import { createContext, useContext } from "react";

export interface OAuthFlowContextType {
  allowAccess: boolean;
  setAllowAccess: (allowed: boolean) => void;
}

export const OAuthFlowContext = createContext<OAuthFlowContextType>({
  allowAccess: false,
  setAllowAccess: () => {
  },
});

export const useOAuthAccess = () => useContext(OAuthFlowContext);
