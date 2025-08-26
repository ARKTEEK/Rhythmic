import { Song } from "../models/Song";

export const mockSongs: Song[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  title: `Song ${ i + 1 }`,
  artist: `Artist ${ i + 1 }`,
  length: `${ Math.floor(Math.random() * 2) + 3 }:${ Math.floor(Math.random() * 60)
  .toString()
  .padStart(2, "0") }`,
  spotifyUrl: "#",
  youtubeUrl: "#",
}));
