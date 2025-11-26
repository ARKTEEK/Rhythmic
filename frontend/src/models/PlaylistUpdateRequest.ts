import { ProviderTrack } from "./ProviderTrack.ts";
import { OAuthProvider } from "./Connection.ts";

export interface Reorder {
  originalIndex: number;
  newIndex: number;
  count: number;
}

export interface PlaylistUpdateRequest {
  id: string;
  addItems?: ProviderTrack[];
  removeItems?: ProviderTrack[];
  reorder?: Reorder;
  replaceAll?: boolean;
  provider: OAuthProvider;
}
