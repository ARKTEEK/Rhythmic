import axios from "axios";
import { API_BASE_URL } from "../config/Config.ts";
import { ProviderPlaylist } from "../models/ProviderPlaylist.ts";

export enum PlaylistSplitType {
  ByArtist = 0,
  InHalf = 1,
  ByNumber = 2,
  ByCustomNumber = 3,
}

export interface PlaylistSplitRequest {
  splitType: PlaylistSplitType;
  splitValue?: string;
  baseName?: string;
}

export const splitPlaylist = async (
  provider: string,
  playlistId: string,
  providerAccountId: string,
  destinationAccountId: string,
  request: PlaylistSplitRequest
): Promise<ProviderPlaylist[]> => {
  const response = await axios.post<ProviderPlaylist[]>(
    `${API_BASE_URL}/${provider}/${playlistId}/split`,
    {
      splitType: request.splitType,
      splitValue: request.splitValue,
      baseName: request.baseName,
    },
    {
      params: {
        providerAccountId,
        destinationAccountId,
      },
    }
  );
  return response.data;
};

