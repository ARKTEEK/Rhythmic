import { FaSpotify, FaYoutube } from "react-icons/fa";
import { Song } from "../../models/Song";

const SongItem = ({ song }: { song: Song }) => {
  return (
    <div
      key={ song.id }
      className="flex justify-between items-center py-2 border-b border-gray-700">
      <div>
        <p className="text-white font-medium">{ song.title }</p>
        <p className="text-gray-400 text-sm">
          { song.artist } • { song.length }
        </p>
      </div>
      <div className="flex space-x-3">
        <a
          href={ song.spotifyUrl }
          className="text-green-400 hover:text-green-300">
          <FaSpotify className="text-2xl"/>
        </a>
        <a
          href={ song.youtubeUrl }
          className="text-red-400 hover:text-red-300">
          <FaYoutube className="text-2xl"/>
        </a>
      </div>
    </div>
  );
};

export default SongItem;
