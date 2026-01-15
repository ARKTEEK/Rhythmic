import { PlaylistVisibility } from "../enums/PlaylistVisibility";

export interface PlaylistCreateRequest {
  title: string;
  description?: string;
  visibility: PlaylistVisibility;
}

