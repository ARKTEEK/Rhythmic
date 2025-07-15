export interface Playlist {
  id: number;
  title: string;
  description: string;
  coverImageUrl: string;
  itemCount: number;
  privacyStatus: "private" | "public" | "unlisted";
}