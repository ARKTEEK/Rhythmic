import axios from "axios";
import { API_BASE_URL } from "../config/Config.ts";
import { ProviderTrack } from "../models/ProviderTrack.ts";
import { ProviderPlaylist } from "../models/ProviderPlaylist.ts";
import { PlaylistUpdateRequest } from "../models/PlaylistUpdateRequest.ts";

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

export const updatePlaylist = async (
  provider: string,
  playlistId: string,
  providerAccountId: string,
  body: PlaylistUpdateRequest
): Promise<void> => {
  await axios.put(
    `${ API_BASE_URL }/${ provider }/${ playlistId }`,
    body,
    { params: { providerAccountId } }
  );
};

export const deletePlaylist = async (
  provider: string,
  playlistId: string,
  providerAccountId: string
): Promise<void> => {
  const response = await axios.delete(
    `${ API_BASE_URL }/${ provider }/${ playlistId }`,
    { params: { providerAccountId } }
  );
  return response.data;
};

export const searchSong = async (
  provider: string,
  providerAccountId: string,
  query: string,
): Promise<ProviderTrack[]> => {
  const response = await axios.get<ProviderTrack[]>(
    `${ API_BASE_URL }/${ provider }/search/${ query }`,
    { params: { providerAccountId } });
  return response.data;
};