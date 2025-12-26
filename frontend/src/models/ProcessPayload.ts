import { ProviderTrack } from "./ProviderTrack";

export interface ProgressPayload {
  jobId: string;
  index: number;
  track: ProviderTrack;
  removed: boolean;
}

export interface StartJobResponse {
  jobId: string;
}
