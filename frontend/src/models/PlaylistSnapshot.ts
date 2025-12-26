import { ProviderTrack } from "./ProviderTrack.ts";

export interface PlaylistSnapshot {
  id: number;
  provider: number;
  playlistId: string;
  createdAt: string;
  trackCount: number;
}

export interface PlaylistSnapshotComparison {
  snapshot: PlaylistSnapshot;
  currentTracks: ProviderTrack[];
  snapshotTracks: ProviderTrack[];
  addedTracks: ProviderTrack[];
  removedTracks: ProviderTrack[];
}

