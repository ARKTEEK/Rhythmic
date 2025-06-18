import { Playlist } from "../models/Playlist";

export const mockPlaylists: Playlist[] = Array.from({ length: 18 }, (_, i) => ({
  id: i + 1,
  name: `Playlist ${i + 1}`,
  source: Math.random() > 0.5 ? "spotify" : "youtube",
  songCount: Math.floor(Math.random() * 40) + 10,
  lengthMin: Math.floor(Math.random() * 120) + 30,
  imageUrl:
    "https://images.unsplash.com/photo-1523755231516-e43fd2e8dca5?w=800&q=80&fit=crop",
}));
