import { IconType } from "react-icons";

export enum OAuthProvider {
  None = 0,
  Google = 1,
  Spotify = 2,
  Deezer = 3,
  SoundCloud = 4,
  Apple = 5,
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
  ribbonColor?: string;
  windowColor?: string;
  accounts: Account[];
};

export const OAuthProviderNames: Record<OAuthProvider, string> = {
  [OAuthProvider.None]: "None",
  [OAuthProvider.Google]: "Google",
  [OAuthProvider.Spotify]: "Spotify",
  [OAuthProvider.Deezer]: "Deezer",
  [OAuthProvider.Apple]: "Apple",
  [OAuthProvider.SoundCloud]: "SoundCloud",
};
