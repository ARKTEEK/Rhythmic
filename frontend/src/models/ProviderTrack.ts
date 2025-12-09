export interface ProviderTrack {
  id: string;
  trackUrl: string;
  title: string;
  artist: string;
  album?: string;
  position?: number;
  thumbnailUrl?: string;
  durationMs: number;
  provider: string;
}
