export interface ProviderTrack {
  id: string;
  trackUrl: string;
  title: string;
  artist: string;
  album?: string;
  thumbnailUrl?: string;
  durationMs: number;
  provider: string;
}
