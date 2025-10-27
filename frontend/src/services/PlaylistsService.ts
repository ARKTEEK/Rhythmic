import axios from "axios";
import { API_BASE_URL } from "../config/Config.ts";
import { ProviderTrack } from "../models/ProviderTrack.ts";
import { ProviderPlaylist } from "../models/ProviderPlaylist.ts";

export const getPlaylists = async (): Promise<ProviderPlaylist[]> => {
  try {
    const response = await axios.get<ProviderPlaylist[]>(`${ API_BASE_URL }/playlists`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error("You must connect Google Account to use this.");
      }
    }

    throw error;
  }
};

export const getTracks = async (
  provider: string,
  playlistId: string,
  providerAccountId: string
): Promise<ProviderTrack[]> => {
  const response = await axios.get<ProviderTrack[]>(
    `${ API_BASE_URL }/${ provider }/${ playlistId }/tracks`,
    { params: { providerAccountId } }
  );
  return response.data;
};
