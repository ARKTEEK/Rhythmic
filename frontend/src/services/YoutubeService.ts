import axios from "axios";
import { API_BASE_URL } from "../configs/Config.ts";
import { Playlist } from "../models/Playlist.ts";

export const getPlaylists = async (): Promise<Playlist[]> => {
  try {
    const response = await axios.get<Playlist[]>(`${ API_BASE_URL }/youtube/playlists`);

    return response.data;
  } catch (error) {
    console.error("Error fetching playlists:", error);
    throw error;
  }
};
