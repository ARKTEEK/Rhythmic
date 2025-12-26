import axios from "axios";
import { API_BASE_URL } from "../config/Config.ts";
import { PlaylistSnapshot, PlaylistSnapshotComparison } from "../models/PlaylistSnapshot.ts";

export const getSnapshotHistory = async (
  provider: string,
  playlistId: string
): Promise<PlaylistSnapshot[]> => {
  const response = await axios.get<PlaylistSnapshot[]>(
    `${API_BASE_URL}/${provider}/${playlistId}/snapshots`
  );
  return response.data;
};

export const compareSnapshot = async (
  snapshotId: number,
  provider: string,
  playlistId: string,
  providerAccountId: string
): Promise<PlaylistSnapshotComparison> => {
  const response = await axios.get<PlaylistSnapshotComparison>(
    `${API_BASE_URL}/snapshots/${snapshotId}/compare`,
    {
      params: { provider, playlistId, providerAccountId }
    }
  );
  return response.data;
};

export const revertToSnapshot = async (
  snapshotId: number,
  provider: string,
  playlistId: string,
  providerAccountId: string
): Promise<void> => {
  await axios.post(
    `${API_BASE_URL}/snapshots/${snapshotId}/revert`,
    null,
    {
      params: { provider, playlistId, providerAccountId },
      headers: { 'X-Revert-Operation': 'true' }
    }
  );
};

