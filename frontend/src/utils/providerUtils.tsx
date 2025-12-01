import { FaMusic, FaSoundcloud, FaSpotify, FaYoutube, } from "react-icons/fa6";
import { OAuthProvider, Platform } from "../models/Connection.ts";
import { googleOAuth, soundCloudOAuth, spotifyOAuth, tidalOAuth, } from "../config/Config.ts";

export const platforms: Platform[] = [
  {
    redirect: spotifyOAuth,
    name: "Spotify",
    icon: FaSpotify,
    color: "bg-green-400",
    accent: "bg-green-300",
    secondaryAccent: "bg-green-50",
    accounts: [],
  },
  {
    redirect: googleOAuth,
    name: "Google",
    icon: FaYoutube,
    color: "bg-red-400",
    accent: "bg-red-300",
    secondaryAccent: "bg-red-50",
    accounts: [],
  },
  {
    redirect: soundCloudOAuth,
    name: "SoundCloud",
    icon: FaSoundcloud,
    color: "bg-orange-400",
    accent: "bg-orange-300",
    secondaryAccent: "bg-orange-50",
    accounts: [],
  },
  {
    redirect: tidalOAuth,
    name: "Tidal",
    icon: FaMusic,
    color: "bg-[#0ab2a5]",
    accent: "bg-[#26c2b8]",
    secondaryAccent: "bg-[#e0f7f5]",
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
    accentSoft: platform.accent,
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
