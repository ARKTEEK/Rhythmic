import { IconType } from "react-icons";

export enum OAuthProvider {
  Google = 0,
  Spotify = 1,
  SoundCloud = 2,
  Tidal = 3,
}

export interface Connection {
  id: string;
  provider: OAuthProvider;
  displayname: string;
  email: string;
}

export interface Account {
  id: string;
  username: string;
  email: string;
}

export type Platform = {
  redirect: () => void;
  name: string;
  icon: IconType;
  color: string;
  accent?: string;
  secondaryAccent?: string;
  accounts: Account[];
};