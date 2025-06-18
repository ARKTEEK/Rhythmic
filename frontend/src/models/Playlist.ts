export interface Playlist {
  id: number;
  name: string;
  source: "spotify" | "youtube";
  songCount: number;
  lengthMin: number;
  imageUrl: string;
}