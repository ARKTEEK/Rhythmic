import { OAuthProvider } from "../models/Connection.ts";
import { platforms } from "../data/platforms.ts";

export function getProviderName(provider: OAuthProvider | number): string {
  return OAuthProviderNames[provider as OAuthProvider] ?? "Unknown";
}

export function getProviderValue(name: string): OAuthProvider | null {
  return OAuthProviderValues[name] ?? null;
}

export const OAuthProviderNames: Record<OAuthProvider, string> = {
  [OAuthProvider.Google]: "Google",
  [OAuthProvider.Spotify]: "Spotify",
  [OAuthProvider.SoundCloud]: "SoundCloud",
  [OAuthProvider.Tidal]: "Tidal"
};

export const OAuthProviderValues: Record<string, OAuthProvider> = {
  Google: OAuthProvider.Google,
  Spotify: OAuthProvider.Spotify,
  SoundCloud: OAuthProvider.SoundCloud,
  Tidal: OAuthProvider.Tidal,
};

const providerColors = {
  google: {
    accent: "bg-red-500",
    accentSoft: "bg-red-100",
    text: "text-white"
  },
  soundcloud: {
    accent: "bg-orange-500",
    accentSoft: "bg-orange-100",
    text: "text-white"
  },
  spotify: {
    accent: "bg-green-500",
    accentSoft: "bg-green-100",
    text: "text-white"
  },
  tidal: {
    accent: "bg-black",
    accentSoft: "bg-gray-200",
    text: "text-white"
  },
  default: {
    accent: "bg-gray-500",
    accentSoft: "bg-gray-100",
    text: "text-white"
  }
};

export const getProviderColors = (providerName: string) => {
  const platform = platforms.find(
    p =>
      p.name.toLowerCase() === providerName.toLowerCase() ||
      (providerName === "YouTube" && p.name === "Google")
  );

  if (!platform) {
    return {
      accent: "bg-gray-500",
      accentSoft: "bg-gray-100",
      text: "text-black",
    };
  }

  return {
    accent: platform.color,
    accentSoft: platform.ribbonColor,
    text: "text-black",
  };
};
