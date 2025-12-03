import { ProviderTrack } from "./ProviderTrack.ts";

export interface Payload {
  jobId: string;
  index: number;
  track: ProviderTrack;
  removed: boolean;
}