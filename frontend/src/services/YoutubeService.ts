import axios from "axios";
import { API_BASE_URL } from "../configs/Config.ts";
import { Playlist } from "../models/Playlist.ts";

export const getPlaylists = async (): Promise<Playlist[]> => {
  try {
    const response = await axios.get<Playlist[]>(`${ API_BASE_URL }/youtube/playlists`);
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
