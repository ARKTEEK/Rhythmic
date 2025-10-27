import { OAuthProvider } from "../models/Connection.ts";

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
