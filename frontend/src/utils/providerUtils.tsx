import { FaGoogle, FaMusic, FaSoundcloud, FaSpotify, } from "react-icons/fa";
import { OAuthProvider, Platform } from "../models/Connection.ts";
import { googleOAuth, soundCloudOAuth, spotifyOAuth, tidalOAuth, } from "../config/Config.ts";

export const platforms: Platform[] = [
  {
    redirect: spotifyOAuth,
    name: "Spotify",
    icon: FaSpotify,
    color: "bg-green-400",
    ribbonColor: "bg-green-300",
    windowColor: "bg-green-50",
    accounts: [],
  },
  {
    redirect: googleOAuth,
    name: "Google",
    icon: FaGoogle,
    color: "bg-red-400",
    ribbonColor: "bg-red-300",
    windowColor: "bg-red-50",
    accounts: [],
  },
  {
    redirect: soundCloudOAuth,
    name: "SoundCloud",
    icon: FaSoundcloud,
    color: "bg-orange-400",
    ribbonColor: "bg-orange-300",
    windowColor: "bg-orange-50",
    accounts: [],
  },
  {
    redirect: tidalOAuth,
    name: "Tidal Music",
    icon: FaMusic,
    color: "bg-[#0ab2a5]",
    ribbonColor: "bg-[#26c2b8]",
    windowColor: "bg-[#e0f7f5]",
    accounts: [],
  },
];

export const OAuthProviderNames: Record<OAuthProvider, string> = {
  [OAuthProvider.Google]: "Google",
  [OAuthProvider.Spotify]: "Spotify",
  [OAuthProvider.SoundCloud]: "SoundCloud",
  [OAuthProvider.Tidal]: "Tidal",
};

export const OAuthProviderValues: Record<string, OAuthProvider> = {
  Google: OAuthProvider.Google,
  Spotify: OAuthProvider.Spotify,
  SoundCloud: OAuthProvider.SoundCloud,
  Tidal: OAuthProvider.Tidal,
};

export function getProviderName(provider: OAuthProvider | number): string {
  return OAuthProviderNames[provider as OAuthProvider] ?? "Unknown";
}

export function getProviderValue(name: string): OAuthProvider | null {
  return OAuthProviderValues[name] ?? null;
}

export const getProviderColors = (providerName: string) => {
  const platform = platforms.find(
    p =>
      p.name.toLowerCase() === providerName.toLowerCase() ||
      (providerName === "YouTube" && p.name === "Google")
  );

  if (!platform) {
    return {
      accent: "bg-gray-400",
      accentSoft: "bg-gray-200",
      text: "text-black",
    };
  }

  return {
    accent: platform.color,
    accentSoft: platform.ribbonColor,
    text: "text-black",
  };
};

export const getPlatformByProvider = (providerName: string) => {
  return platforms.find(
    p =>
      p.name.toLowerCase() === providerName.toLowerCase() ||
      (providerName === "YouTube" && p.name === "Google")
  );
};
