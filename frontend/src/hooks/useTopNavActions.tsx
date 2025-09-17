import { useState, ReactNode } from "react";
import {
  SetTopNavActionsContext,
  TopNavAction,
  TopNavActionsContext
} from "../context/TopNavActionsContext.tsx";

export const TopNavActionsProvider = ({ children }: { children: ReactNode }) => {
  const [actions, setActions] = useState<TopNavAction[]>([]);

  return (
    <TopNavActionsContext.Provider value={ actions }>
      <SetTopNavActionsContext.Provider value={ setActions }>
        { children }
      </SetTopNavActionsContext.Provider>
    </TopNavActionsContext.Provider>
  );
};
