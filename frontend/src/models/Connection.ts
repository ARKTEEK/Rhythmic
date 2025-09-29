import { IconType } from "react-icons";

export interface Connection {
  id: string;
}

export interface Account {
  id: string;
  username: string;
}

export type Platform = {
  name: string;
  icon: IconType;
  color: string;
  ribbonColor?: string;
  windowColor?: string;
  accounts: Account[];
};
