import { OAuthProvider } from "./Connection.ts";

export type PlaylistSyncGroup = {
  id: number;
  name: string;
  masterPlaylistId: string;
  masterProvider: OAuthProvider;
  masterProviderAccountId: string;
  syncEnabled: boolean;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
  children: PlaylistSyncChild[];
};

export type PlaylistSyncChild = {
  id: number;
  childPlaylistId: string;
  provider: OAuthProvider;
  providerAccountId: string;
  lastSyncedAt: string | null;
};

export type CreateSyncGroupRequest = {
  name: string;
  masterPlaylistId: string;
  masterProvider: OAuthProvider;
  masterProviderAccountId: string;
  children: AddChildPlaylistRequest[];
};

export type AddChildPlaylistRequest = {
  childPlaylistId: string;
  provider: OAuthProvider;
  providerAccountId: string;
};

export type UpdateSyncGroupRequest = {
  name?: string;
  syncEnabled?: boolean;
};

export type SyncResult = {
  syncGroupId: number;
  syncGroupName: string;
  success: boolean;
  errorMessage?: string;
  childrenSynced: number;
  childrenSkipped: number;
  childrenFailed: number;
  childResults: ChildSyncResult[];
  syncedAt: string;
};

export type ChildSyncResult = {
  childPlaylistId: string;
  success: boolean;
  errorMessage?: string;
  skipped: boolean;
  skipReason?: string;
};

