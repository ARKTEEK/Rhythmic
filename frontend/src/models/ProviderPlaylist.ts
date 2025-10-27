export interface ProviderPlaylist {
  id: string;
  providerId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  itemCount: number;
  privacyStatus: "private" | "public" | "unlisted";
  provider: number;
  channelId: string;
  channelTitle: string;
  createdAt: string;
}