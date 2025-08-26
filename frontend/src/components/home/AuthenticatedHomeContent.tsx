import { useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { mockSongs } from "../../data/MockSongs";
import { Song } from "../../models/Song";
import SongItem from "../playlists/SongItem";

const AuthenticatedHomeContent = () => {
  const [playlistLink, setPlaylistLink] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);

  const handleConvert = () => {
    if (!playlistLink.trim()) return;
    setSongs(mockSongs);
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center text-center">
      <h1 className="text-5xl font-extrabold text-red-400">ListPort</h1>

      <div className="mt-6 w-full space-y-4">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Enter playlist link..."
            value={ playlistLink }
            onChange={ (e) => setPlaylistLink(e.target.value) }
            className="w-full px-6 py-3 pr-16 bg-transparent border-2 border-gray-700 rounded-full
            text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
          />
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-red-400"
            onClick={ handleConvert }>
            <FaArrowRight className="text-2xl"/>
          </button>
        </div>
      </div>

      { songs.length > 0 && (
        <div
          className="mt-6 w-full max-h-[400px] bg-transparent border-2 border-gray-700 p-4
          overflow-y-auto scrollbar-thin scrollbar-thumb-red-600 scrollbar-track-gray-700 text-left">
          <h2 className="text-lg text-gray-300 mb-2">Songs Found</h2>
          <div className="h-[300px]">
            { songs.map((song) => (
              <SongItem
                key={ song.id }
                song={ song }/>
            )) }
          </div>
        </div>
      ) }
    </div>
  );
};

export default AuthenticatedHomeContent;
