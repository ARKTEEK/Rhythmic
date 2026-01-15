import axios from "axios";
import { API_BASE_URL } from "../config/Config.ts";
import {
  PlaylistSyncGroup,
  CreateSyncGroupRequest,
  UpdateSyncGroupRequest,
  AddChildPlaylistRequest,
  SyncResult,
} from "../models/PlaylistSync.ts";

export const createSyncGroup = async (
  request: CreateSyncGroupRequest
): Promise<PlaylistSyncGroup> => {
  const response = await axios.post<PlaylistSyncGroup>(
    `${API_BASE_URL}/sync/groups`,
    request
  );
  return response.data;
};

export const getSyncGroups = async (): Promise<PlaylistSyncGroup[]> => {
  const response = await axios.get<PlaylistSyncGroup[]>(
    `${API_BASE_URL}/sync/groups`
  );
  return response.data;
};

export const getSyncGroup = async (
  syncGroupId: number
): Promise<PlaylistSyncGroup> => {
  const response = await axios.get<PlaylistSyncGroup>(
    `${API_BASE_URL}/sync/groups/${syncGroupId}`
  );
  return response.data;
};

export const updateSyncGroup = async (
  syncGroupId: number,
  request: UpdateSyncGroupRequest
): Promise<PlaylistSyncGroup> => {
  const response = await axios.put<PlaylistSyncGroup>(
    `${API_BASE_URL}/sync/groups/${syncGroupId}`,
    request
  );
  return response.data;
};

export const deleteSyncGroup = async (syncGroupId: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/sync/groups/${syncGroupId}`);
};

export const addChildPlaylist = async (
  syncGroupId: number,
  request: AddChildPlaylistRequest
): Promise<PlaylistSyncGroup> => {
  const response = await axios.post<PlaylistSyncGroup>(
    `${API_BASE_URL}/sync/groups/${syncGroupId}/children`,
    request
  );
  return response.data;
};

export const removeChildPlaylist = async (
  syncGroupId: number,
  childId: number
): Promise<void> => {
  await axios.delete(
    `${API_BASE_URL}/sync/groups/${syncGroupId}/children/${childId}`
  );
};

export const syncGroup = async (
  syncGroupId: number,
  force: boolean = false
): Promise<SyncResult> => {
  const response = await axios.post<SyncResult>(
    `${API_BASE_URL}/sync/groups/${syncGroupId}/sync`,
    null,
    {
      params: { force },
    }
  );
  return response.data;
};

