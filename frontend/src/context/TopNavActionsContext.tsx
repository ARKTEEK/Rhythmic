import { createContext, useContext } from "react";

export interface TopNavAction {
  id: string;
  label: string;
  onClick: () => void;
  active?: boolean;
}

export type SetTopNavActions = (actions: TopNavAction[]) => void;

export const TopNavActionsContext = createContext<TopNavAction[]>([]);
export const SetTopNavActionsContext = createContext<SetTopNavActions>(() => {
});

export const useTopNavActions = () => useContext(TopNavActionsContext);
export const useSetTopNavActions = () => useContext(SetTopNavActionsContext);
