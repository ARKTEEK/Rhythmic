import { createContext, useContext } from "react";
import { IconType } from "react-icons";

export interface TopNavAction {
  id: string;
  label: string;
  onClick: () => void;
  active?: boolean;
  Icon?: IconType;
  buttonClassName?: string;
  textClassName?: string;
}

export type SetTopNavActions = (actions: TopNavAction[]) => void;

export const TopNavActionsContext = createContext<TopNavAction[]>([]);
export const SetTopNavActionsContext = createContext<SetTopNavActions>(() => {
});

export const useTopNavActions = () => useContext(TopNavActionsContext);
export const useSetTopNavActions = () => useContext(SetTopNavActionsContext);
