export interface ProviderTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  thumbnailUrl?: string;
  durationMs: number;
  provider: string;
}
